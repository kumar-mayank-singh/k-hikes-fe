import axios from "axios";
import { authApi } from "@/lib/api/auth-client";
import { extractApiErrorMessage } from "@/lib/api/errors";
import {
  CategoriesResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/categoryConstants";
import {
  AdminDashboardSummary,
  BulkUploadResponse,
  FileAccessResponse,
  UploadUrlItem,
} from "@/types/constants";
import {
  CouponsResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/couponConstants";
import {
  CreateEventPayload,
  EventDetail,
  EventsPaginatedResponse,
  EventStatus,
  UpdateEventPayload,
} from "@/types/eventConstants";
import {
  AdminBooking,
  AdminBookingsListParams,
  AdminBookingsPaginatedResponse,
  ChangeAdminBookingDatePayload,
  CreateAdminBookingPayload,
  UpdateAdminBookingPayload,
} from "@/types/bookingConstants";
import {
  CheckoutLeadsPaginatedResponse,
  LeadsListParams,
  PdfLeadsPaginatedResponse,
} from "@/types/leadConstants";
import {
  BatchesResponse,
  CreateBatchPayload,
  CreateFormFieldPayload,
  CreatePickupPointPayload,
  FormFieldsResponse,
  PickupPointsResponse,
  PriceOptionsListResponse,
  UpdateBatchPayload,
  UpdateFormFieldPayload,
  UpdatePickupPointPayload,
} from "@/types/eventSubConstants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export interface EventListQueryKeyParams {
  page: number;
  per_page: number;
  category_id?: string;
  status?: EventStatus;
}

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: EventListQueryKeyParams) =>
    [...eventKeys.lists(), params] as const,
  detail: (eventId: string) => [...eventKeys.all, eventId] as const,
};

export interface GetEventsParams {
  page?: number;
  per_page?: number;
  category_id?: string;
  status?: EventStatus;
}

export function useGetEvents(params?: GetEventsParams) {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 20;
  const category_id = params?.category_id;
  const status = params?.status;

  return useQuery({
    queryKey: eventKeys.list({
      page,
      per_page,
      category_id,
      status,
    }),
    queryFn: async (): Promise<EventsPaginatedResponse> => {
      const queryParams: Record<string, string | number> = { page, per_page };
      if (category_id) queryParams.category_id = category_id;
      if (status) queryParams.status = status;

      const res = await authApi.get<EventsPaginatedResponse>(
        "/api/admin/events",
        { params: queryParams },
      );
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export interface UploadFileResult {
  id: string;
  filename: string;
}

/**
 * Step 1 — ask the API for pre-signed upload targets for one or more files.
 * The response items are returned in the same order as `fileNames`.
 */
async function requestUploadUrls(
  fileNames: string[],
): Promise<UploadUrlItem[]> {
  const res = await authApi.post<BulkUploadResponse>("/api/admin/upload", {
    file_names: fileNames,
  });
  return res.data.items ?? [];
}

/** Step 2 — push the raw bytes to storage using the pre-signed URL. */
async function uploadToStorage(item: UploadUrlItem, file: File): Promise<void> {
  
  if (item.upload_url.includes("http://127.0.0.1:8080")) {
    console.log("Uploading to local storage", item.upload_url);
    await authApi.put(item.upload_url, file);
    return;
  }

  // Cloud blob storage: must NOT carry our auth/credentials.
  await axios.request({
    url: item.upload_url,
    method: (item.method || "PUT") as "PUT",
    data: file,
    headers: item.headers,
    withCredentials: false,
  });
}

/** Step 3 — tell the API the bytes landed so it can finalise the file. */
async function completeUpload(fileId: string): Promise<void> {
  await authApi.post(`/api/admin/files/${fileId}/complete`);
}

/** Full three-step upload for a batch of files (get URLs → PUT → complete). */
async function uploadFiles(files: File[]): Promise<UploadFileResult[]> {
  if (files.length === 0) return [];

  const items = await requestUploadUrls(files.map((f) => f.name));
  if (items.length !== files.length) {
    throw new Error("Upload could not be initialised for all files");
  }

  return Promise.all(
    items.map(async (item, index) => {
      await uploadToStorage(item, files[index]);
      await completeUpload(item.file_id);
      return { id: item.file_id, filename: item.file_name };
    }),
  );
}

async function uploadSingleFile(file: File): Promise<UploadFileResult> {
  const [result] = await uploadFiles([file]);
  if (!result) throw new Error("File upload failed");
  return result;
}

/** Upload a single file end-to-end. */
export function useUploadFile() {
  return useMutation({ mutationFn: uploadSingleFile });
}

/** Bulk-upload many files end-to-end (one round-trip for the URLs). */
export function useUploadFiles() {
  return useMutation({ mutationFn: uploadFiles });
}

export function useDeleteUploadedFile() {
  return useMutation({
    mutationFn: async (fileId: string): Promise<void> => {
      await authApi.delete(`/api/admin/files/${fileId}`);
    },
  });
}

export const fileKeys = {
  all: ["admin", "files"] as const,
  url: (fileId: string) => [...fileKeys.all, fileId, "url"] as const,
};

/**
 * Resolve a stored file's short-lived access URL by id.
 * `staleTime` is kept under the typical signed-URL expiry so we re-fetch a
 * fresh URL rather than serving an expired one.
 */
export function useFileUrl(fileId: string | null | undefined) {
  return useQuery({
    queryKey: fileKeys.url(fileId ?? ""),
    queryFn: async (): Promise<FileAccessResponse> => {
      const res = await authApi.get<FileAccessResponse>(
        `/api/admin/files/${fileId}`,
      );
      return res.data;
    },
    enabled: Boolean(fileId),
    retry: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 4 * 60 * 1000,
  });
}

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await authApi.get("/api/auth/me");
      return res.data;
    },
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export const dashboardKeys = {
  all: ["admin", "dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useGetDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async (): Promise<AdminDashboardSummary> => {
      const res = await authApi.get<AdminDashboardSummary>(
        "/api/admin/dashboard/summary",
      );
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useGetCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async (): Promise<CategoriesResponse> => {
      const res = await authApi.get<CategoriesResponse>(
        "/api/admin/categories",
      );
      return res.data;
    },
    select: (data) => {
      const items = data.items ?? [];
      return [...items].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order;
        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const res = await authApi.post("/api/admin/categories", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + (error as Error).message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category_id,
      ...payload
    }: UpdateCategoryPayload & { category_id: string }) => {
      const res = await authApi.patch(
        `/api/admin/categories/${category_id}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + (error as Error).message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category_id: string) => {
      const res = await authApi.delete(`/api/admin/categories/${category_id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + (error as Error).message);
    },
  });
}

export const couponKeys = {
  all: ["coupons"] as const,
};

export function useGetCoupons() {
  return useQuery({
    queryKey: couponKeys.all,
    queryFn: async (): Promise<CouponsResponse> => {
      const res = await authApi.get<CouponsResponse>("/api/admin/coupons");
      return res.data;
    },
    select: (data) => data.items ?? [],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCouponPayload) => {
      const res = await authApi.post("/api/admin/coupons", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon created");
    },
    onError: (error) => {
      toast.error("Failed to create coupon: " + (error as Error).message);
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      coupon_id,
      ...payload
    }: UpdateCouponPayload & { coupon_id: string }) => {
      const res = await authApi.patch(
        `/api/admin/coupons/${coupon_id}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon updated");
    },
    onError: (error) => {
      toast.error("Failed to update coupon: " + (error as Error).message);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon_id: string) => {
      const res = await authApi.delete(`/api/admin/coupons/${coupon_id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete coupon: " + (error as Error).message);
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      const res = await authApi.post("/api/admin/events", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Event created successfully");
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to create event" + error.message);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (eventId) => authApi.delete(`/api/admin/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });
}

export function useToggleEventStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { event_id: string; currentStatus: EventStatus }
  >({
    mutationFn: ({ event_id, currentStatus }) => {
      const newStatus: EventStatus =
        currentStatus === "live" ? "draft" : "live";
      return authApi.patch(`/api/admin/events/${event_id}/status`, {
        status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useToggleOnSale() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { event_id: string; currentOnSale: boolean }>(
    {
      mutationFn: ({ event_id, currentOnSale }) =>
        authApi.patch(`/api/admin/events/${event_id}/on-sale`, {
          on_sale: !currentOnSale,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: eventKeys.all });
      },
    },
  );
}

export function useGetEventDetail(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: async (): Promise<EventDetail> => {
      const res = await authApi.get<EventDetail>(
        `/api/admin/events/${eventId}`,
      );
      return res.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEventPayload) => {
      const res = await authApi.patch(`/api/admin/events/${eventId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success("Changes saved");
    },
    onError: (error: Error) => {
      toast.error("Save failed: " + error.message);
    },
  });
}

export const pickupPointKeys = {
  all: (eventId: string) => ["events", eventId, "pickup-points"] as const,
};

export function useGetPickupPoints(eventId: string) {
  return useQuery({
    queryKey: pickupPointKeys.all(eventId),
    queryFn: async (): Promise<PickupPointsResponse> => {
      const res = await authApi.get<PickupPointsResponse>(
        `/api/admin/events/${eventId}/pickup-points`,
      );
      return res.data;
    },
    select: (data) => data.items ?? [],
    enabled: !!eventId,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}

export const adminEventPriceOptionKeys = {
  all: (eventId: string) =>
    ["admin", "events", eventId, "price-options"] as const,
};

export function useGetAdminEventPriceOptions(eventId: string) {
  return useQuery({
    queryKey: adminEventPriceOptionKeys.all(eventId),
    queryFn: async (): Promise<PriceOptionsListResponse> => {
      const res = await authApi.get<PriceOptionsListResponse>(
        `/api/admin/events/${eventId}/price-options`,
      );
      return res.data;
    },
    select: (data) => data.items ?? [],
    enabled: !!eventId,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreatePickupPoint(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePickupPointPayload) => {
      const res = await authApi.post(
        `/api/admin/events/${eventId}/pickup-points`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.all(eventId),
      });
      toast.success("Pickup point added");
    },
    onError: (error: Error) => {
      toast.error("Failed to add pickup point: " + error.message);
    },
  });
}

export function useUpdatePickupPoint(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pickupPointId,
      payload,
    }: {
      pickupPointId: string;
      payload: UpdatePickupPointPayload;
    }) => {
      const res = await authApi.patch(
        `/api/admin/events/${eventId}/pickup-points/${pickupPointId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.all(eventId),
      });
      toast.success("Pickup point updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update pickup point: " + error.message);
    },
  });
}

export function useDeletePickupPoint(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pickupPointId: string) => {
      await authApi.delete(
        `/api/admin/events/${eventId}/pickup-points/${pickupPointId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.all(eventId),
      });
      toast.success("Pickup point deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete pickup point: " + error.message);
    },
  });
}

export const formFieldKeys = {
  all: (eventId: string) => ["events", eventId, "form-fields"] as const,
};

export function useGetFormFields(eventId: string) {
  return useQuery({
    queryKey: formFieldKeys.all(eventId),
    queryFn: async (): Promise<FormFieldsResponse> => {
      const res = await authApi.get<FormFieldsResponse>(
        `/api/admin/events/${eventId}/form-fields`,
      );
      return res.data;
    },
    select: (data) => data.items ?? [],
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateFormField(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateFormFieldPayload) => {
      const res = await authApi.post(
        `/api/admin/events/${eventId}/form-fields`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: formFieldKeys.all(eventId),
      });
      toast.success("Form field added");
    },
    onError: (error: Error) => {
      toast.error("Failed to add form field: " + error.message);
    },
  });
}

export function useUpdateFormField(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      formFieldId,
      payload,
    }: {
      formFieldId: string;
      payload: UpdateFormFieldPayload;
    }) => {
      const res = await authApi.patch(
        `/api/admin/events/${eventId}/form-fields/${formFieldId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: formFieldKeys.all(eventId),
      });
      toast.success("Form field updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update form field: " + error.message);
    },
  });
}

export function useDeleteFormField(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formFieldId: string) => {
      await authApi.delete(
        `/api/admin/events/${eventId}/form-fields/${formFieldId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: formFieldKeys.all(eventId),
      });
      toast.success("Form field deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete form field: " + error.message);
    },
  });
}

export const batchKeys = {
  all: (eventId: string) => ["events", eventId, "batches"] as const,
};

export function useGetBatches(eventId: string) {
  return useQuery({
    queryKey: batchKeys.all(eventId),
    queryFn: async (): Promise<BatchesResponse> => {
      const res = await authApi.get<BatchesResponse>(
        `/api/admin/events/${eventId}/batches`,
      );
      return res.data;
    },
    select: (data) => data.items ?? [],
    enabled: !!eventId,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBatch(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBatchPayload) => {
      const res = await authApi.post(
        `/api/admin/events/${eventId}/batches`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(eventId) });
      toast.success("Batch added");
    },
    onError: (error: Error) => {
      toast.error("Failed to add batch: " + error.message);
    },
  });
}

export function useUpdateBatch(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      batchId,
      payload,
    }: {
      batchId: string;
      payload: UpdateBatchPayload;
    }) => {
      const res = await authApi.patch(
        `/api/admin/events/${eventId}/batches/${batchId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(eventId) });
      toast.success("Batch updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update batch: " + error.message);
    },
  });
}

export function useDeleteBatch(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: string) => {
      await authApi.delete(
        `/api/admin/events/${eventId}/batches/${batchId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all(eventId) });
      toast.success("Batch deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete batch: " + error.message);
    },
  });
}

export function useEventSubResource<TPayload = Record<string, unknown>>(
  eventId: string,
  path: string,
) {
  const queryClient = useQueryClient();
  const invalidate = (): void => {
    queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
  };

  const add = useMutation({
    mutationFn: async (payload: TPayload) => {
      const res = await authApi.post(
        `/api/admin/events/${eventId}/${path}`,
        payload,
      );
      return res.data;
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (itemId: string) => {
      await authApi.delete(`/api/admin/events/${eventId}/${path}/${itemId}`);
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast.error(err.message),
  });

  const update = useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: Record<string, unknown>;
    }) => {
      await authApi.patch(
        `/api/admin/events/${eventId}/${path}/${itemId}`,
        payload,
      );
    },
    onSuccess: invalidate,
    onError: (err: Error) => toast.error(err.message),
  });

  return { add, remove, update };
}

export const bookingKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: AdminBookingsListParams) =>
    [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (bookingId: string) => [...bookingKeys.details(), bookingId] as const,
};

export function useGetAdminBookings(params: AdminBookingsListParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: async (): Promise<AdminBookingsPaginatedResponse> => {
      const queryParams: Record<string, string | number> = {
        page: params.page,
        per_page: params.per_page,
      };
      if (params.event_id?.trim()) {
        queryParams.event_id = params.event_id.trim();
      }
      if (params.status?.trim()) {
        queryParams.status = params.status.trim();
      }
      if (params.batch_id?.trim()) {
        queryParams.batch_id = params.batch_id.trim();
      }

      const res = await authApi.get<AdminBookingsPaginatedResponse>(
        "/api/admin/bookings",
        { params: queryParams },
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetAdminBooking(bookingId: string) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: async (): Promise<AdminBooking> => {
      const res = await authApi.get<AdminBooking>(
        `/api/admin/bookings/${bookingId}`,
      );
      return res.data;
    },
    enabled: !!bookingId,
    retry: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdminBookingPayload) => {
      const res = await authApi.post<AdminBooking>(
        "/api/admin/bookings",
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success("Booking created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });
}

export function useUpdateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: UpdateAdminBookingPayload;
    }) => {
      const res = await authApi.patch<AdminBooking>(
        `/api/admin/bookings/${bookingId}`,
        payload,
      );
      return res.data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
      toast.success("Booking updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update booking: " + error.message);
    },
  });
}

export function useCancelAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      await authApi.patch(`/api/admin/bookings/${bookingId}/cancel`);
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
      toast.success("Booking cancelled");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel booking: " + error.message);
    },
  });
}

export function useChangeAdminBookingDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: ChangeAdminBookingDatePayload;
    }) => {
      const res = await authApi.patch<AdminBooking>(
        `/api/admin/bookings/${bookingId}/change-date`,
        payload,
      );
      return res.data;
    },
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
      toast.success("Departure updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to change departure: " + error.message);
    },
  });
}

export const leadKeys = {
  all: ["admin", "leads"] as const,
  pdf: {
    all: ["admin", "leads", "pdf"] as const,
    list: (params: LeadsListParams) =>
      ["admin", "leads", "pdf", "list", params] as const,
  },
  checkout: {
    all: ["admin", "leads", "checkout"] as const,
    list: (params: LeadsListParams) =>
      ["admin", "leads", "checkout", "list", params] as const,
  },
} as const;

const LEADS_STALE_TIME = 60 * 1000;
const LEADS_GC_TIME = 5 * 60 * 1000;

function buildLeadsQueryParams(
  params: LeadsListParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    per_page: params.per_page,
  };
  if (params.event_id?.trim()) {
    query.event_id = params.event_id.trim();
  }
  return query;
}

export function useGetPdfLeads(params: LeadsListParams) {
  return useQuery({
    queryKey: leadKeys.pdf.list(params),
    queryFn: async (): Promise<PdfLeadsPaginatedResponse> => {
      try {
        const res = await authApi.get<PdfLeadsPaginatedResponse>(
          "/api/admin/leads/pdf",
          { params: buildLeadsQueryParams(params) },
        );
        return res.data;
      } catch (err) {
        throw new Error(extractApiErrorMessage(err, "Failed to load PDF leads"));
      }
    },
    placeholderData: (previousData) => previousData,
    retry: false,
    staleTime: LEADS_STALE_TIME,
    gcTime: LEADS_GC_TIME,
  });
}

export function useGetCheckoutLeads(params: LeadsListParams) {
  return useQuery({
    queryKey: leadKeys.checkout.list(params),
    queryFn: async (): Promise<CheckoutLeadsPaginatedResponse> => {
      try {
        const res = await authApi.get<CheckoutLeadsPaginatedResponse>(
          "/api/admin/leads/checkout",
          { params: buildLeadsQueryParams(params) },
        );
        return res.data;
      } catch (err) {
        throw new Error(
          extractApiErrorMessage(err, "Failed to load missed checkouts"),
        );
      }
    },
    placeholderData: (previousData) => previousData,
    retry: false,
    staleTime: LEADS_STALE_TIME,
    gcTime: LEADS_GC_TIME,
  });
}

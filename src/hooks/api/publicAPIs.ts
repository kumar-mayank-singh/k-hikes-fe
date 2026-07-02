"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { publicApi } from "@/lib/api/public-client";
import { useAuthStore } from "@/store/auth-store";
import { SendOtpInput, VerifyOtpInput } from "@/lib/validation/schema";
import {
  AddOnsResponse,
  BatchesPublicResponse,
  BookingFormResponse,
  BookingFormSubmitPayload,
  ConfirmBookingResponse,
  ConfirmBookingVariables,
  CreatePaymentOrderResponse,
  CreatePaymentOrderVariables,
  InitiateBookingPayload,
  InitiateBookingResponse,
  VerifyPaymentResponse,
  VerifyPaymentVariables,
  PickupPointsResponseLite,
  PriceOptionsResponse,
  PublicEventDetail,
  PublicEventsResponse,
  ValidatePublicCouponPayload,
  ValidatePublicCouponResponse,
} from "@/types/bookingConstants";
import type { UseMutationResult } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { 
  RequestItineraryPdfPayload, 
  RequestItineraryPdfResponse, 
  SubmitContactPayload, 
  SubmitContactResponse 
} from "@/types/constants";

export interface PublicEventsQueryParams {
  page?: number;
  per_page?: number;
  category_id?: string;
  search?: string;
}

export const publicKeys = {
  events: {
    all: ["public", "events"] as const,
    list: (params: PublicEventsQueryParams) =>
      ["public", "events", "list", params] as const,
    detail: (eventId: string) =>
      ["public", "events", "detail", eventId] as const,
    addOns: (eventId: string) =>
      ["public", "events", eventId, "add-ons"] as const,
    batches: (eventId: string) =>
      ["public", "events", eventId, "batches"] as const,
    pickupPoints: (eventId: string) =>
      ["public", "events", eventId, "pickup-points"] as const,
    priceOptions: (eventId: string) =>
      ["public", "events", eventId, "price-options"] as const,
  },
  batches: {
    priceOptions: (batchId: string) =>
      ["public", "batches", batchId, "price-options"] as const,
  },
  bookings: {
    form: (bookingId: string, token?: string) =>
      ["public", "bookings", bookingId, "form", token ?? ""] as const,
  },
} as const;

function buildBookingFormUrl(
  bookingId: string | undefined,
  token?: string,
): string {
  const base = `/api/public/bookings/${bookingId}/form`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

const STALE_LIST = 2 * 60 * 1000;
const STALE_DETAIL = 5 * 60 * 1000;
const STALE_BATCH = 60 * 1000;
const GC_DEFAULT = 30 * 60 * 1000;

/* ── Auth (kept) ─────────────────────────────────────────── */

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: (payload: SendOtpInput) => sendOtp(payload),
    onSuccess: () => toast.success("OTP sent! Check your inbox."),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useVerifyOtpMutation() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (payload: VerifyOtpInput) => verifyOtp(payload),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      toast.success("Logged in successfully!");
      router.push("/admin");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/* ── Public events ───────────────────────────────────────── */

export function useListPublicEvents(params: PublicEventsQueryParams = {}) {
  const page = params.page ?? 1;
  const per_page = params.per_page ?? 24;
  const category_id = params.category_id;
  const search = params.search;

  return useQuery({
    queryKey: publicKeys.events.list({ page, per_page, category_id, search }),
    queryFn: async (): Promise<PublicEventsResponse> => {
      const queryParams: Record<string, string | number> = { page, per_page };
      if (category_id) queryParams.category_id = category_id;
      if (search) queryParams.search = search;
      const res = await publicApi.get<PublicEventsResponse>(
        "/api/public/events",
        { params: queryParams },
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: STALE_LIST,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.events.detail(eventId ?? ""),
    queryFn: async (): Promise<PublicEventDetail> => {
      const res = await publicApi.get<PublicEventDetail>(
        `/api/public/events/${eventId}`,
      );
      return res.data;
    },
    enabled: Boolean(eventId),
    staleTime: STALE_DETAIL,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicEventAddOns(eventId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.events.addOns(eventId ?? ""),
    queryFn: async (): Promise<AddOnsResponse> => {
      const res = await publicApi.get<AddOnsResponse>(
        `/api/public/events/${eventId}/add-ons`,
      );
      return res.data ?? [];
    },
    enabled: Boolean(eventId),
    staleTime: STALE_DETAIL,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicEventBatches(eventId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.events.batches(eventId ?? ""),
    queryFn: async (): Promise<BatchesPublicResponse> => {
      const res = await publicApi.get<BatchesPublicResponse>(
        `/api/public/events/${eventId}/batches`,
      );
      return res.data ?? [];
    },
    enabled: Boolean(eventId),
    staleTime: STALE_BATCH,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicEventPickupPoints(eventId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.events.pickupPoints(eventId ?? ""),
    queryFn: async (): Promise<PickupPointsResponseLite> => {
      const res = await publicApi.get<PickupPointsResponseLite>(
        `/api/public/events/${eventId}/pickup-points`,
      );
      return res.data ?? [];
    },
    enabled: Boolean(eventId),
    staleTime: STALE_DETAIL,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicEventPriceOptions(eventId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.events.priceOptions(eventId ?? ""),
    queryFn: async (): Promise<PriceOptionsResponse> => {
      const res = await publicApi.get<PriceOptionsResponse>(
        `/api/public/events/${eventId}/price-options`,
      );
      return res.data ?? [];
    },
    enabled: Boolean(eventId),
    staleTime: STALE_DETAIL,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

export function useGetPublicBatchPriceOptions(batchId: string | undefined) {
  return useQuery({
    queryKey: publicKeys.batches.priceOptions(batchId ?? ""),
    queryFn: async (): Promise<PriceOptionsResponse> => {
      const res = await publicApi.get<PriceOptionsResponse>(
        `/api/public/batches/${batchId}/price-options`,
      );
      return res.data ?? [];
    },
    enabled: Boolean(batchId),
    staleTime: STALE_BATCH,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

/* ── Booking flow ────────────────────────────────────────── */

function publicApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: unknown; message?: unknown }
      | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0];
      if (first && typeof first === "object" && "msg" in first) {
        const msg = (first as { msg?: string }).msg;
        if (typeof msg === "string") return msg;
      }
    }
    if (typeof data?.message === "string") return data.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not validate coupon";
}

export function useValidatePublicCouponMutation(): UseMutationResult<
  ValidatePublicCouponResponse,
  Error,
  ValidatePublicCouponPayload
> {
  return useMutation({
    mutationFn: async (
      payload: ValidatePublicCouponPayload,
    ): Promise<ValidatePublicCouponResponse> => {
      try {
        const res = await publicApi.post<ValidatePublicCouponResponse>(
          "/api/public/coupons/validate",
          payload,
        );
        const data = res.data;
        if (!data || data.valid !== true) {
          throw new Error(
            (typeof data?.error === "string" && data.error.trim()) ||
              "This coupon cannot be applied",
          );
        }
        return data;
      } catch (e: unknown) {
        if (e instanceof Error && !isAxiosError(e)) throw e;
        throw new Error(publicApiErrorMessage(e));
      }
    },
    gcTime: 5 * 60 * 1000,
  });
}

export function useInitiateBookingMutation() {
  return useMutation({
    mutationFn: async (
      payload: InitiateBookingPayload,
    ): Promise<InitiateBookingResponse> => {
      const res = await publicApi.post<InitiateBookingResponse>(
        "/api/public/bookings/initiate",
        payload,
      );
      return res.data;
    },
    onError: (err: Error) => toast.error(err.message || "Booking failed"),
  });
}

export function useConfirmBookingMutation(): UseMutationResult<
  ConfirmBookingResponse,
  Error,
  ConfirmBookingVariables
> {
  return useMutation({
    mutationFn: async (
      variables: ConfirmBookingVariables,
    ): Promise<ConfirmBookingResponse> => {
      const { bookingId, ...payload } = variables;
      const res = await publicApi.post<ConfirmBookingResponse>(
        `/api/public/bookings/${bookingId}/confirm`,
        payload,
      );
      return res.data;
    },
    onError: (err: Error) =>
      toast.error(err.message || "Payment confirmation failed"),
  });
}

export function useCreatePaymentOrderMutation(): UseMutationResult<
  CreatePaymentOrderResponse,
  Error,
  CreatePaymentOrderVariables
> {
  return useMutation({
    mutationFn: async (
      variables: CreatePaymentOrderVariables,
    ): Promise<CreatePaymentOrderResponse> => {
      const { bookingId, ...payload } = variables;
      const res = await publicApi.post<CreatePaymentOrderResponse>(
        `/api/public/bookings/${bookingId}/payment/order`,
        payload,
      );
      return res.data;
    },
    onError: (err: Error) =>
      toast.error(err.message || "Could not start payment"),
  });
}

export function useVerifyPaymentMutation(): UseMutationResult<
  VerifyPaymentResponse,
  Error,
  VerifyPaymentVariables
> {
  return useMutation({
    mutationFn: async (
      variables: VerifyPaymentVariables,
    ): Promise<VerifyPaymentResponse> => {
      const { bookingId, ...payload } = variables;
      const token = encodeURIComponent(payload.form_token);
      const res = await publicApi.post<VerifyPaymentResponse>(
        `/api/public/bookings/${bookingId}/payment/verify?token=${token}`,
        payload,
      );
      return res.data;
    },
    onError: (err: Error) =>
      toast.error(err.message || "Payment verification failed"),
  });
}

export function useGetPublicBookingForm(
  bookingId: string | undefined,
  formToken?: string,
) {
  return useQuery({
    queryKey: publicKeys.bookings.form(bookingId ?? "", formToken),
    queryFn: async (): Promise<BookingFormResponse> => {
      const res = await publicApi.get<BookingFormResponse>(
        buildBookingFormUrl(bookingId, formToken),
      );
      return res.data;
    },
    enabled: Boolean(bookingId),
    staleTime: STALE_DETAIL,
    gcTime: GC_DEFAULT,
    retry: 1,
  });
}

/* ── Leads ───────────────────────────────────────────────── */

export function useRequestItineraryPdfMutation() {
  return useMutation({
    mutationFn: async (
      payload: RequestItineraryPdfPayload,
    ): Promise<RequestItineraryPdfResponse> => {
      const res = await publicApi.post<RequestItineraryPdfResponse>(
        "/api/public/leads/pdf",
        payload,
      );
      return res.data;
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to request itinerary"),
  });
}

/* ── Contact ─────────────────────────────────────────────── */

export function useSubmitContactMutation(): UseMutationResult<
  SubmitContactResponse,
  Error,
  SubmitContactPayload
> {
  return useMutation({
    mutationFn: async (
      payload: SubmitContactPayload,
    ): Promise<SubmitContactResponse> => {
      try {
        const res = await publicApi.post<SubmitContactResponse>(
          "/api/public/contact",
          payload,
        );
        return res.data;
      } catch (e: unknown) {
        throw new Error(publicApiErrorMessage(e));
      }
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to send message"),
  });
}

export function useSubmitPublicBookingFormMutation(
  bookingId: string | undefined,
  options: { method?: "POST" | "PATCH"; formToken?: string } = {},
) {
  const method = options.method ?? "POST";
  const formToken = options.formToken;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BookingFormSubmitPayload) => {
      const url = buildBookingFormUrl(bookingId, formToken);
      const res =
        method === "PATCH"
          ? await publicApi.patch(url, payload)
          : await publicApi.post(url, payload);
      return res.data;
    },
    onSuccess: () => {
      if (!bookingId) return;
      queryClient.invalidateQueries({
        queryKey: publicKeys.bookings.form(bookingId, formToken),
      });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to submit form"),
  });
}

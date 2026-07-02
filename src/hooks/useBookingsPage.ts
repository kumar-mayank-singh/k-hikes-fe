"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCancelAdminBooking,
  useChangeAdminBookingDate,
  useCreateAdminBooking,
  useGetAdminBooking,
  useGetAdminBookings,
  useGetAdminEventPriceOptions,
  useGetBatches,
  useGetEvents,
  useGetPickupPoints,
  useUpdateAdminBooking,
} from "@/hooks/api/authAPIs";
import {
  adminBookingEditSchema,
  changeAdminBookingDateSchema,
  createManualAdminBookingSchema,
  type AdminBookingEditParsed,
  type ChangeAdminBookingDateFormValues,
  type CreateManualAdminBookingParsed,
} from "@/lib/validation/schema";
import type {
  AdminBooking,
  AdminBookingsListParams,
  UpdateAdminBookingPersonPayload,
} from "@/types/bookingConstants";

const PER_PAGE_OPTIONS = [10, 20, 50] as const;

function parseListStatus(value: string): string | undefined {
  if (value === "") return undefined;
  return value;
}

function detailEventId(detail: AdminBooking | undefined): string {
  if (!detail) return "";
  return detail.event_id?.trim() || detail.event?.event_id?.trim() || "";
}

export interface UseBookingsPageReturn {
  listParams: AdminBookingsListParams;
  statusFilter: string;
  eventFilter: string;
  batchIdFilter: string;
  setPage: (p: number) => void;
  setPerPage: (n: number) => void;
  setStatusFilter: (s: string) => void;
  setEventFilter: (id: string) => void;
  setBatchIdFilter: (id: string) => void;
  bookingsQuery: ReturnType<typeof useGetAdminBookings>;
  events: { event_id: string; name: string }[];
  showManual: boolean;
  setShowManual: (v: boolean) => void;
  createForm: ReturnType<typeof useForm<CreateManualAdminBookingParsed>>;
  createBatchesQuery: ReturnType<typeof useGetBatches>;
  createPickupPointsQuery: ReturnType<typeof useGetPickupPoints>;
  createPriceOptionsQuery: ReturnType<typeof useGetAdminEventPriceOptions>;
  onCreateSubmit: (values: CreateManualAdminBookingParsed) => Promise<void>;
  createBooking: ReturnType<typeof useCreateAdminBooking>;
  selectedBookingId: string;
  openDetail: (bookingId: string) => void;
  closeDetail: () => void;
  detailQuery: ReturnType<typeof useGetAdminBooking>;
  editForm: ReturnType<typeof useForm<AdminBookingEditParsed>>;
  detailPickupPointsQuery: ReturnType<typeof useGetPickupPoints>;
  changeDateForm: ReturnType<typeof useForm<ChangeAdminBookingDateFormValues>>;
  changeDateBatchesQuery: ReturnType<typeof useGetBatches>;
  onSaveDetail: (values: AdminBookingEditParsed) => Promise<void>;
  onChangeDateSubmit: (values: ChangeAdminBookingDateFormValues) => Promise<void>;
  onCancelBooking: () => Promise<void>;
  updateBooking: ReturnType<typeof useUpdateAdminBooking>;
  changeDate: ReturnType<typeof useChangeAdminBookingDate>;
  cancelBooking: ReturnType<typeof useCancelAdminBooking>;
  perPageOptions: readonly number[];
  totalPages: number;
}

export function useBookingsPage(): UseBookingsPageReturn {
  const [page, setPageState] = useState(1);
  const [perPage, setPerPageState] = useState<number>(20);
  const [statusFilter, setStatusFilterState] = useState("");
  const [eventFilter, setEventFilterState] = useState("");
  const [batchIdFilter, setBatchIdFilterState] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const listParams: AdminBookingsListParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      event_id: eventFilter || undefined,
      status: parseListStatus(statusFilter),
      batch_id: batchIdFilter.trim() || undefined,
    }),
    [page, perPage, eventFilter, statusFilter, batchIdFilter],
  );

  const bookingsQuery = useGetAdminBookings(listParams);
  const { data: eventsPage } = useGetEvents({ page: 1, per_page: 200 });
  const events = useMemo(
    () =>
      (eventsPage?.items ?? []).map((e) => ({
        event_id: e.event_id,
        name: e.name,
      })),
    [eventsPage],
  );

  const createForm = useForm<CreateManualAdminBookingParsed>({
    // zod input/output mismatch (coerce + transforms); values at submit match Parsed.
    resolver: zodResolver(
      createManualAdminBookingSchema,
    ) as unknown as Resolver<CreateManualAdminBookingParsed>,
    defaultValues: {
      event_id: "",
      batch_id: "",
      customer_name: "",
      customer_phone: "",
      customer_email: null,
      attendees: 1,
      amount_paid: 0,
      discount_amount: 0,
      subtotal: null,
      total_amount: null,
      gst_amount: null,
      pickup_point_id: "",
      price_option_id: "",
    },
  });

  const watchedCreateEventId = createForm.watch("event_id");
  const createBatchesQuery = useGetBatches(watchedCreateEventId || "");
  const createPickupPointsQuery = useGetPickupPoints(
    watchedCreateEventId || "",
  );
  const createPriceOptionsQuery = useGetAdminEventPriceOptions(
    watchedCreateEventId || "",
  );

  const prevCreateEventRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const cur = watchedCreateEventId || "";
    if (
      prevCreateEventRef.current !== undefined &&
      prevCreateEventRef.current !== cur
    ) {
      createForm.setValue("batch_id", "");
      createForm.setValue("pickup_point_id", "");
      createForm.setValue("price_option_id", "");
    }
    prevCreateEventRef.current = cur;
  }, [watchedCreateEventId, createForm]);

  const createBooking = useCreateAdminBooking();
  const updateBooking = useUpdateAdminBooking();
  const cancelBooking = useCancelAdminBooking();
  const changeDate = useChangeAdminBookingDate();

  const detailQuery = useGetAdminBooking(selectedBookingId);
  const bookingDetail = detailQuery.data;

  const editForm = useForm<AdminBookingEditParsed>({
    // Same zod/RHF Resolver typing limitation as create form.
    resolver: zodResolver(
      adminBookingEditSchema,
    ) as unknown as Resolver<AdminBookingEditParsed>,
    defaultValues: {
      people: [],
    },
  });

  const changeDateForm = useForm<ChangeAdminBookingDateFormValues>({
    resolver: zodResolver(changeAdminBookingDateSchema),
    defaultValues: { batch_id: "" },
  });

  const changeDateEventId = detailEventId(bookingDetail);
  const changeDateBatchesQuery = useGetBatches(changeDateEventId || "");
  const detailPickupPointsQuery = useGetPickupPoints(changeDateEventId || "");

  useEffect(() => {
    if (!bookingDetail) return;
    const people = (bookingDetail.people ?? [])
      .slice()
      .sort((a, b) => a.person_index - b.person_index)
      .map((p) => ({
        booking_person_id: p.booking_person_id,
        person_index: p.person_index,
        name: p.name ?? "",
        phone: p.phone ?? "",
        pickup_point_id: p.pickup_point_id?.trim() ? p.pickup_point_id : null,
      }));
    editForm.reset({
      people,
    });
    changeDateForm.reset({
      batch_id: bookingDetail.batch_id?.trim() || "",
    });
  }, [bookingDetail, editForm, changeDateForm]);

  const setPage = useCallback((p: number) => {
    setPageState(Math.max(1, p));
  }, []);

  const setPerPage = useCallback((n: number) => {
    setPerPageState(n);
    setPageState(1);
  }, []);

  const setStatusFilter = useCallback((s: string) => {
    setStatusFilterState(s);
    setPageState(1);
  }, []);

  const setEventFilter = useCallback((id: string) => {
    setEventFilterState(id);
    setPageState(1);
  }, []);

  const setBatchIdFilter = useCallback((id: string) => {
    setBatchIdFilterState(id);
    setPageState(1);
  }, []);

  const totalPages = useMemo(() => {
    const total = bookingsQuery.data?.total_count ?? 0;
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / perPage));
  }, [bookingsQuery.data?.total_count, perPage]);

  const onCreateSubmit = useCallback(
    async (values: CreateManualAdminBookingParsed) => {
      await createBooking.mutateAsync({
        add_on_ids: null,
        amount_paid: values.amount_paid,
        attendees: values.attendees,
        batch_id: values.batch_id,
        customer_email: values.customer_email ?? null,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        discount_amount: values.discount_amount ?? 0,
        event_id: values.event_id,
        gst_amount: values.gst_amount,
        pickup_point_id: values.pickup_point_id?.trim() || null,
        price_option_id: values.price_option_id?.trim() || null,
        source: "manual",
        status: "confirmed",
        subtotal: values.subtotal,
        total_amount: values.total_amount,
      });
      createForm.reset({
        event_id: "",
        batch_id: "",
        customer_name: "",
        customer_phone: "",
        customer_email: null,
        attendees: 1,
        amount_paid: 0,
        discount_amount: 0,
        subtotal: null,
        total_amount: null,
        gst_amount: null,
        pickup_point_id: "",
        price_option_id: "",
      });
      setShowManual(false);
    },
    [createBooking, createForm],
  );

  const openDetail = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedBookingId("");
  }, []);

  const onSaveDetail = useCallback(
    async (values: AdminBookingEditParsed) => {
      if (!selectedBookingId) return;
      const people: UpdateAdminBookingPersonPayload[] = values.people.map(
        (p) => ({
          booking_person_id: p.booking_person_id,
          person_index: p.person_index,
          name: p.name.trim(),
          phone: p.phone.trim(),
          pickup_point_id: p.pickup_point_id ?? null,
        }),
      );
      await updateBooking.mutateAsync({
        bookingId: selectedBookingId,
        payload: {
          people: people.length > 0 ? people : undefined,
        },
      });
    },
    [selectedBookingId, updateBooking],
  );

  const onChangeDateSubmit = useCallback(
    async (values: ChangeAdminBookingDateFormValues) => {
      if (!selectedBookingId) return;
      await changeDate.mutateAsync({
        bookingId: selectedBookingId,
        payload: { batch_id: values.batch_id },
      });
      changeDateForm.reset(values);
    },
    [selectedBookingId, changeDate, changeDateForm],
  );

  const onCancelBooking = useCallback(async () => {
    if (!selectedBookingId) return;
    if (
      !window.confirm(
        "Cancel this booking? The customer may be notified by email.",
      )
    ) {
      return;
    }
    await cancelBooking.mutateAsync(selectedBookingId);
    closeDetail();
  }, [selectedBookingId, cancelBooking, closeDetail]);

  return {
    listParams,
    statusFilter,
    eventFilter,
    batchIdFilter,
    setPage,
    setPerPage,
    setStatusFilter,
    setEventFilter,
    setBatchIdFilter,
    bookingsQuery,
    events,
    showManual,
    setShowManual,
    createForm,
    createBatchesQuery,
    createPickupPointsQuery,
    createPriceOptionsQuery,
    onCreateSubmit,
    createBooking,
    selectedBookingId,
    openDetail,
    closeDetail,
    detailQuery,
    editForm,
    detailPickupPointsQuery,
    changeDateForm,
    changeDateBatchesQuery,
    onSaveDetail,
    onChangeDateSubmit,
    onCancelBooking,
    updateBooking,
    changeDate,
    cancelBooking,
    perPageOptions: PER_PAGE_OPTIONS,
    totalPages,
  };
}

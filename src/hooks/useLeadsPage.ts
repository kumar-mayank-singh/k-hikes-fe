"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useGetCheckoutLeads,
  useGetEvents,
  useGetPdfLeads,
} from "@/hooks/api/authAPIs";
import type {
  CheckoutLeadsPaginatedResponse,
  LeadsListParams,
  LeadType,
  PdfLeadsPaginatedResponse,
} from "@/types/leadConstants";

const PDF_TOAST_ID = "leads-pdf-error";
const CHECKOUT_TOAST_ID = "leads-checkout-error";

const PER_PAGE_OPTIONS = [20, 50, 100] as const;
const DEFAULT_PER_PAGE = 20;

interface EventOption {
  event_id: string;
  name: string;
}

export interface UseLeadsPageReturn {
  activeTab: LeadType;
  setActiveTab: (tab: LeadType) => void;
  eventFilter: string;
  setEventFilter: (id: string) => void;
  events: EventOption[];
  perPageOptions: readonly number[];
  pdfListParams: LeadsListParams;
  checkoutListParams: LeadsListParams;
  pdfLeadsQuery: ReturnType<typeof useGetPdfLeads>;
  checkoutLeadsQuery: ReturnType<typeof useGetCheckoutLeads>;
  pdfTotalCount: number;
  checkoutTotalCount: number;
  setPdfPage: (page: number) => void;
  setPdfPerPage: (perPage: number) => void;
  setCheckoutPage: (page: number) => void;
  setCheckoutPerPage: (perPage: number) => void;
  pdfTotalPages: number;
  checkoutTotalPages: number;
}

function totalPages(total: number, perPage: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / perPage));
}

function paginatedTotal(
  data: PdfLeadsPaginatedResponse | CheckoutLeadsPaginatedResponse | undefined,
): number {
  return data?.total_count ?? 0;
}

export function useLeadsPage(): UseLeadsPageReturn {
  const [activeTab, setActiveTab] = useState<LeadType>("pdf");
  const [eventFilter, setEventFilterState] = useState("");

  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPerPage, setPdfPerPageState] = useState<number>(DEFAULT_PER_PAGE);
  const [checkoutPage, setCheckoutPage] = useState(1);
  const [checkoutPerPage, setCheckoutPerPageState] =
    useState<number>(DEFAULT_PER_PAGE);

  const pdfListParams = useMemo<LeadsListParams>(
    () => ({
      page: pdfPage,
      per_page: pdfPerPage,
      event_id: eventFilter || undefined,
    }),
    [pdfPage, pdfPerPage, eventFilter],
  );

  const checkoutListParams = useMemo<LeadsListParams>(
    () => ({
      page: checkoutPage,
      per_page: checkoutPerPage,
      event_id: eventFilter || undefined,
    }),
    [checkoutPage, checkoutPerPage, eventFilter],
  );

  const pdfLeadsQuery = useGetPdfLeads(pdfListParams);
  const checkoutLeadsQuery = useGetCheckoutLeads(checkoutListParams);

  useEffect(() => {
    if (pdfLeadsQuery.isError && pdfLeadsQuery.error) {
      toast.error((pdfLeadsQuery.error as Error).message, {
        id: PDF_TOAST_ID,
      });
    }
  }, [pdfLeadsQuery.isError, pdfLeadsQuery.error]);

  useEffect(() => {
    if (checkoutLeadsQuery.isError && checkoutLeadsQuery.error) {
      toast.error((checkoutLeadsQuery.error as Error).message, {
        id: CHECKOUT_TOAST_ID,
      });
    }
  }, [checkoutLeadsQuery.isError, checkoutLeadsQuery.error]);

  const { data: eventsPage } = useGetEvents({ page: 1, per_page: 200 });
  const events = useMemo<EventOption[]>(
    () =>
      (eventsPage?.items ?? []).map((e) => ({
        event_id: e.event_id,
        name: e.name,
      })),
    [eventsPage],
  );

  const setEventFilter = useCallback((id: string) => {
    setEventFilterState(id);
    setPdfPage(1);
    setCheckoutPage(1);
  }, []);

  const setPdfPerPage = useCallback((value: number) => {
    setPdfPerPageState(value);
    setPdfPage(1);
  }, []);

  const setCheckoutPerPage = useCallback((value: number) => {
    setCheckoutPerPageState(value);
    setCheckoutPage(1);
  }, []);

  const pdfTotalCount = paginatedTotal(pdfLeadsQuery.data);
  const checkoutTotalCount = paginatedTotal(checkoutLeadsQuery.data);

  const pdfTotalPages = useMemo(
    () => totalPages(pdfTotalCount, pdfPerPage),
    [pdfTotalCount, pdfPerPage],
  );
  const checkoutTotalPages = useMemo(
    () => totalPages(checkoutTotalCount, checkoutPerPage),
    [checkoutTotalCount, checkoutPerPage],
  );

  return {
    activeTab,
    setActiveTab,
    eventFilter,
    setEventFilter,
    events,
    perPageOptions: PER_PAGE_OPTIONS,
    pdfListParams,
    checkoutListParams,
    pdfLeadsQuery,
    checkoutLeadsQuery,
    pdfTotalCount,
    checkoutTotalCount,
    setPdfPage,
    setPdfPerPage,
    setCheckoutPage,
    setCheckoutPerPage,
    pdfTotalPages,
    checkoutTotalPages,
  };
}

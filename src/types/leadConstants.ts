/**
 * Backend always returns a UUID `id` plus an `event_id` for every lead; the
 * concrete shape is "open" (extra fields allowed). We model the two known
 * variants explicitly so the UI can stay strongly typed.
 */
export interface LeadBase {
  id: string;
  event_id: string;
  event_name?: string | null;
  created_on?: string | null;
  updated_on?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

/** Lead captured when a visitor downloads an itinerary PDF. */
export interface PdfLead extends LeadBase {
  /** Backend primary key — `id` is the same value, kept for parity. */
  lead_pdf_id?: string;
  name: string;
  phone: string;
}

/** Lead captured when a visitor abandons a checkout. */
export interface CheckoutLead extends LeadBase {
  lead_checkout_id?: string;
  batch_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  checkout_data?: Record<string, unknown> | null;
}

export interface LeadsListParams {
  page: number;
  per_page: number;
  event_id?: string;
}

export interface PdfLeadsPaginatedResponse {
  items: PdfLead[];
  page: number | null;
  per_page: number | null;
  total_count: number;
}

export interface CheckoutLeadsPaginatedResponse {
  items: CheckoutLead[];
  page: number | null;
  per_page: number | null;
  total_count: number;
}

export type LeadType = "pdf" | "checkout";

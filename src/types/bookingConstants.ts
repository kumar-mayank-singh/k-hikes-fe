import { Category } from "./categoryConstants";
import { EventOtherPhotosField } from "./eventConstants";
import { AddOn, EventFormField, PickupPoint } from "./eventSubConstants";

export type PaymentType = "full" | "partial";

export interface PublicEventListItem {
  event_id: string;
  name: string;
  cover_image_url: string | null;
  description: string | null;
  display_price: number | null;
  strike_price: number | null;
  category_id: string | null;
  categories?: Category[] | null;
  on_sale: boolean;
  is_sold_out: boolean;
  next_date: string | null;
  dates_count: number;
}

export interface PublicEventsResponse {
  items: PublicEventListItem[];
  page: number;
  per_page: number;
  total_count: number;
}

/**
 * Add-on row as embedded in the public event detail response.
 * Distinct from the admin `AddOn` shape (which uses `id`); the public
 * API uses `event_add_on_id` and `file_url`.
 */
export interface PublicAddOn {
  event_add_on_id: string;
  event_id: string;
  name: string;
  price: number;
  file_id: string | null;
  file_url: string | null;
}

export interface PublicEventDetail {
  event_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  other_photos?: EventOtherPhotosField;
  pdf_url: string | null;
  strike_price: number | null;
  display_price: number | null;
  booking_amount_percent: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  inclusions: string | null;
  exclusions: string | null;
  policy: string | null;
  things_to_carry: string | null;
  category_id: string | null;
  categories?: Category[] | null;
  on_sale: boolean;
  is_sold_out: boolean;
  slots: number | null;
  /** Optional add-ons embedded in the event detail response. */
  add_ons?: PublicAddOn[] | null;
}

export interface PublicPriceOption {
  event_price_option_id: string;
  event_id: string;
  batch_id: string | null;
  batch_size: number | null;
  eligible_for_discounts: boolean;
  is_active: boolean;
  name: string;
  price: number;
  /** Extra copy from the API when available. */
  description?: string | null;
  /**
   * `per_person` (default): total = `price × attendees`.
   * `per_booking`: total = `price` (fixed package, e.g. group bundle).
   */
  price_basis?: "per_person" | "per_booking";
}

export interface PublicBatchItineraryItem {
  event_itinerary_day_id?: string;
  day_number: number;
  title: string | null;
  details: string | null;
  highlights: string | null;
  sort_order: number;
}

export interface PublicBatch {
  batch_id: string;
  event_id: string;
  nickname: string | null;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  is_bookable: boolean;
  is_sold_out: boolean;
  batch_size: number | null;
  display_price: number | null;
  strike_price: number | null;
  /** True when batch overrides event-level pricing */
  price_override: boolean;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  booking_amount_percent: number;
  price_options: PublicPriceOption[];
  itinerary: PublicBatchItineraryItem[];
}

/** All sub-resource public endpoints return plain arrays. */
export type BatchesPublicResponse = PublicBatch[];
export type PriceOptionsResponse = PublicPriceOption[];
export type AddOnsResponse = AddOn[];
export type PickupPointsResponseLite = PickupPoint[];

export interface InitiateBookingPayload {
  event_id: string;
  batch_id: string;
  attendees: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  payment_type: PaymentType;
  /** Percentage of the total the customer will pay now. Allowed: 50 or 100. */
  booking_amount_percent: number;
  add_on_ids: string[] | null;
  coupon_code: string | null;
  pickup_point_id: string | null;
  price_option_id: string | null;
}

export interface InitiateBookingResponse {
  booking_id: string;
  booking_number?: string;
  form_token?: string | null;
  razorpay_enabled?: boolean;
  razorpay_key_id?: string;
  subtotal: number;
  gst_amount: number;
  discount_amount: number;
  total_amount: number;
  /** Total billable for the booking (typically equals `total_amount`). */
  amount_due: number;
  /** Amount the customer must pay *now* (full or partial share). */
  amount_to_be_paid: number;
  amount_pending?: number;
  payment_type?: PaymentType;
  currency?: string;
}

export interface CreatePaymentOrderPayload {
  form_token: string;
  payment_type: PaymentType;
}

export interface CreatePaymentOrderVariables extends CreatePaymentOrderPayload {
  bookingId: string;
}

export interface CreatePaymentOrderResponse {
  razorpay_order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string;
}

export interface VerifyPaymentPayload {
  form_token: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentVariables extends VerifyPaymentPayload {
  bookingId: string;
}

export interface VerifyPaymentResponse {
  booking_id: string;
  booking_number?: string;
  status: string;
  confirmed?: boolean;
  /** Token required to read/submit the attendee form (`?token=`). */
  form_token?: string | null;
}

export interface ConfirmBookingPayload {
  form_token?: string | null;
  payment_type?: PaymentType | null;
}

/** Variables for POST `/api/public/bookings/{bookingId}/confirm` */
export interface ConfirmBookingVariables extends ConfirmBookingPayload {
  bookingId: string;
}

export interface ConfirmBookingResponse {
  booking_id: string;
  status: string;
  confirmed: boolean;
  /** Token required to read/submit the attendee form (`?token=`). */
  form_token?: string | null;
}

export interface BookingFormPersonInput {
  form_responses: Record<string, string>;
  name: string;
  person_index: number;
  phone: string;
  email?: string | null;
  pickup_point_id?: string | null;
}

export interface BookingFormSubmitPayload {
  people: BookingFormPersonInput[];
}

export interface BookingFormPersonResponse {
  form_responses?: Record<string, string>;
  name?: string;
  person_index: number;
  phone?: string;
  email?: string | null;
  pickup_point_id?: string | null;
}

export interface BookingFormResponse {
  booking_id: string;
  /** Present so the form page can resolve pickup points from the booking alone. */
  event_id?: string | null;
  attendees?: number;
  fields: EventFormField[];
  people?: BookingFormPersonResponse[];
  /** @deprecated flat single-person values from older API */
  submitted_values?: Record<string, string>;
  is_submitted: boolean;
}

/** POST /api/public/coupons/validate */
export interface ValidatePublicCouponPayload {
  attendees: number;
  batch_id: string | null;
  code: string;
  event_id: string | null;
  subtotal: number | null;
}

export type PublicValidatedCouponApplyType = "flat" | "per_person";
export type PublicValidatedCouponDiscountType = "amount" | "percentage";
export type PublicValidatedCouponValidityType = "fixed" | "relative";

/** Coupon snapshot returned by `/api/public/coupons/validate` when valid. */
export interface PublicValidatedCoupon {
  apply_type: PublicValidatedCouponApplyType;
  batch_id: string | null;
  code: string;
  coupon_id: string;
  created_by: string;
  created_on: string;
  discount_type: PublicValidatedCouponDiscountType;
  discount_value: number;
  event_id: string | null;
  is_active: boolean;
  is_public: boolean;
  min_group_size: number | null;
  scope: string;
  updated_by: string;
  updated_on: string;
  valid_days: number | null;
  valid_from: string;
  valid_till: string;
  validity_type: PublicValidatedCouponValidityType;
}

export interface ValidatePublicCouponResponse {
  coupon: PublicValidatedCoupon | null;
  discount_amount: number | null;
  error: string | null;
  valid: boolean;
}

/** Admin list/detail: API may return extra keys; nested refs are optional. */
export interface AdminBookingEventRef {
  event_id?: string;
  name?: string;
}

export interface AdminBookingDepartureRef {
  nickname?: string | null;
  start_date?: string;
  end_date?: string;
}

/** Participant attached to an admin booking. */
export interface AdminBookingPerson {
  booking_id?: string;
  booking_person_id: string;
  created_on?: string;
  updated_on?: string;
  email?: string | null;
  form_responses?: Record<string, string> | null;
  name: string;
  person_index: number;
  phone: string;
  pickup_point_id?: string | null;
}

export interface AdminBooking {
  id?: string;
  booking_id: string;
  booking_code?: string | null;
  event_id?: string | null;
  batch_id?: string | null;
  event?: AdminBookingEventRef | null;
  batch?: AdminBookingDepartureRef | null;
  departure_date?: AdminBookingDepartureRef | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  attendees?: number;
  amount_paid?: number | null;
  total_amount?: number | null;
  amount_pending?: number | null;
  source?: string;
  status: string;
  people?: AdminBookingPerson[] | null;
}

export interface AdminBookingsPaginatedResponse {
  items: AdminBooking[];
  page: number | null;
  per_page: number | null;
  total_count: number;
}

export interface AdminBookingsListParams {
  page: number;
  per_page: number;
  event_id?: string;
  status?: string;
  batch_id?: string;
}

export type AdminBookingSource = "manual" | "online";

export type AdminBookingCreateStatus = "confirmed" | "pending";

export interface CreateAdminBookingPayload {
  add_on_ids: string[] | null;
  amount_paid: number;
  attendees: number;
  batch_id: string;
  customer_email: string | null;
  customer_name: string;
  customer_phone: string;
  discount_amount: number;
  event_id: string;
  gst_amount: number | null;
  pickup_point_id: string | null;
  price_option_id: string | null;
  source: AdminBookingSource;
  status: AdminBookingCreateStatus;
  subtotal: number | null;
  total_amount: number | null;
}

/**
 * Person update payload nested inside `UpdateAdminBookingPayload.people`.
 * Only mutable fields are exposed; `booking_person_id` identifies the row.
 */
export interface UpdateAdminBookingPersonPayload {
  booking_person_id: string;
  person_index: number;
  name: string;
  phone: string;
  pickup_point_id: string | null;
}

export interface UpdateAdminBookingPayload {
  amount_paid?: number | null;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  status?: string | null;
  people?: UpdateAdminBookingPersonPayload[] | null;
}

export interface ChangeAdminBookingDatePayload {
  batch_id: string;
}

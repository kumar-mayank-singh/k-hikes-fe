import { Category } from "./categoryConstants";
import {
  AddOn,
  DepartureDate,
  EventFormField,
  ItineraryDayItem,
  PickupPoint,
  PriceOption,
} from "./eventSubConstants";

export type EventStatus = "live" | "draft" | "archived";

/** One gallery image on an event (from GET event detail). */
export interface EventOtherPhoto {
  event_id: string;
  event_other_photo_id: string;
  file_id: string;
  sort_order: number;
  url: string;
}

/** Nested `other_photos` field on event responses. */
export interface EventOtherPhotosGroup {
  other_photos: EventOtherPhoto[];
}

/**
 * Backend may serialize the gallery either as a flat array
 * (`other_photos: EventOtherPhoto[]`) or as the nested group
 * (`other_photos: { other_photos: EventOtherPhoto[] }`).
 * Always unwrap via `listEventOtherPhotos()` before reading.
 */
export type EventOtherPhotosField =
  | EventOtherPhoto[]
  | EventOtherPhotosGroup
  | null
  | undefined;

export interface Event {
  event_id: string;
  name: string;
  slug: string;
  description: string;
  slots: number | null;
  strike_price: number | null;
  display_price: number | null;
  booking_amount_percent: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  inclusions: string;
  exclusions: string;
  policy: string;
  things_to_carry: string;
  cover_image_url: string | null;
  cover_image_id: string | null;
  pdf_url: string | null;
  pdf_file_id: string | null;
  other_photos?: EventOtherPhotosField;
  pdf_download_count?: number;
  category_id: string | null;
  categories?: Category[];
  sort_order: number | null;
  is_draft: boolean;
  is_sold_out: boolean;
  on_sale: boolean;
  created_on?: string;
  updated_on?: string;
  created_by?: string | null;
  updated_by?: string | null;
}

/** GET /api/admin/events — paginated list */
export interface EventsPaginatedResponse {
  items: Event[];
  page: number;
  per_page: number;
  total_count: number;
}

export interface CreateEventPayload {
  name: string;
  description: string | null;
  slots: number | null;
  display_price: number | null;
  strike_price: number | null;
  category_ids: string[] | null;
  cover_image_id: string | null;
  pdf_file_id: string | null;
  other_photos: string[] | null;
}

export interface EventEditableFields {
  name: string;
  description: string;
  slots: number | null;
  strike_price: number | null;
  display_price: number | null;
  booking_amount_percent: number;
  gst_percent: number;
  cgst_percent: number;
  sgst_percent: number;
  inclusions: string;
  exclusions: string;
  policy: string;
  things_to_carry: string;
  cover_image_url: string;
  pdf_url: string;
  cover_image_id: string | null;
  pdf_file_id: string | null;
  category_ids: string[] | null;
  sort_order: number | null;
}

export interface UpdateEventPayload extends Partial<EventEditableFields> {
  other_photos?: string[] | null;
}

export interface EventDetail extends Event {
  pickup_points: PickupPoint[];
  price_options: PriceOption[];
  add_ons: AddOn[];
  departure_dates: DepartureDate[];
  form_fields: EventFormField[];
  /** Omitted until populated; each entry is one ordered item within a day. */
  itinerary_days?: ItineraryDayItem[];
}

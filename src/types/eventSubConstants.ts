// Pickup Points
export interface PickupPoint {
  event_pickup_point_id: string;
  event_id: string;
  name: string;
  google_map_link: string | null;
  arrival_time: string | null;
  departure_time: string | null;
  price: number | null;
  sort_order: number;
  is_active: boolean;
  created_by: string;
  created_on: string;
  updated_by: string;
  updated_on: string;
}

export interface PickupPointsResponse {
  items: PickupPoint[];
}

export interface CreatePickupPointPayload {
  name: string;
  arrival_time: string | null;
  departure_time: string | null;
  google_map_link: string | null;
  is_active: boolean;
  price: number | null;
  sort_order: number;
}

export interface UpdatePickupPointPayload {
  name?: string | null;
  arrival_time?: string | null;
  departure_time?: string | null;
  google_map_link?: string | null;
  is_active?: boolean | null;
  price?: number | null;
  sort_order?: number | null;
}

// Price Options
export interface PriceOption {
  id: string;
  name: string;
  price: number;
  batch_id: string | null;
  batch_size: number | null;
  eligible_for_discounts: boolean;
  is_active: boolean;
}

export interface PriceOptionsListResponse {
  items: PriceOption[];
}

// Add Ons
export interface AddOn {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  file_id: string | null;
}

// Departure Dates
export interface DepartureDate {
  id: string;
  start_date: string;
  end_date: string;
  price_override: number | null;
  is_bookable: boolean;
}

// Batches (Departures)
export type BatchStatus = "live" | "draft" | "archived";

export interface Batch {
  batch_id: string;
  event_id: string;
  nickname: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: BatchStatus;
  is_bookable: boolean;
  is_sold_out: boolean;
  batch_size: number | null;
  slots_override: number | null;
  display_price: number | null;
  strike_price: number | null;
  google_drive_link: string | null;
  whatsapp_group_link: string | null;
  who_will_go: string | null;
  comment: string | null;
  created_by?: string;
  created_on?: string;
  updated_by?: string;
  updated_on?: string;
}

export interface BatchesResponse {
  items: Batch[];
}

export interface CreateBatchPayload {
  batch_size: number | null;
  comment: string | null;
  display_price: number | null;
  end_date: string;
  end_time: string;
  google_drive_link: string | null;
  is_bookable: boolean;
  is_sold_out: boolean;
  nickname: string | null;
  slots_override: number | null;
  start_date: string;
  start_time: string;
  status: BatchStatus;
  strike_price: number | null;
  whatsapp_group_link: string | null;
  who_will_go: string | null;
}

export interface UpdateBatchPayload {
  batch_size?: number | null;
  comment?: string | null;
  display_price?: number | null;
  end_date?: string | null;
  end_time?: string | null;
  google_drive_link?: string | null;
  is_bookable?: boolean | null;
  is_sold_out?: boolean | null;
  nickname?: string | null;
  slots_override?: number | null;
  start_date?: string | null;
  start_time?: string | null;
  status?: BatchStatus | null;
  strike_price?: number | null;
  whatsapp_group_link?: string | null;
  who_will_go?: string | null;
}

// Form Fields
export type FormFieldType = "text" | "number" | "date" | "choice" | "file";

export interface EventFormField {
  form_field_id: string;
  event_id: string;
  label: string;
  field_type: FormFieldType;
  is_required: boolean;
  options: string[] | null;
  created_by: string;
  created_on: string;
  updated_by: string;
  updated_on: string;
}

export interface FormFieldsResponse {
  items: EventFormField[];
}

export interface CreateFormFieldPayload {
  label: string;
  field_type: FormFieldType;
  is_required: boolean;
  options: string[] | null;
}

export interface UpdateFormFieldPayload {
  label?: string | null;
  field_type?: FormFieldType | null;
  is_required?: boolean | null;
  options?: string[] | null;
}

// Itinerary Days
/** One itinerary entry; days are implied by `day_number` (no empty days). */
export interface ItineraryDayItem {
  id: string;
  /** Some API responses use this instead of `id`. */
  event_itinerary_day_id?: string;
  day_number: number;
  title: string | null;
  details: string | null;
  highlights: string | null;
  sort_order: number;
}

/** POST /api/admin/events/{event_id}/itinerary-days */
export interface ItineraryDayPayload {
  day_number: number;
  details: string | null;
  highlights: string | null;
  sort_order: number;
  title: string | null;
}

export interface ItineraryDayResponse {
  event_itinerary_day_id: string;
}

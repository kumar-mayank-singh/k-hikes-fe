import { EventDetail, EventEditableFields, UpdateEventPayload } from "@/types/eventConstants";


export type EventEditForm = {
  [K in Exclude<keyof EventEditableFields, "category_ids">]: string;
} & {
  category_ids: string[];
};

const NUMERIC_EDIT_FIELDS = [
  "slots",
  "strike_price",
  "display_price",
  "sort_order",
] as const;

export function eventToForm(e: EventDetail): EventEditForm {
  const fromList = e.categories?.map((c) => c.category_id) ?? [];
  const category_ids =
    fromList.length > 0
      ? fromList
      : e.category_id
        ? [e.category_id]
        : [];

  return {
    name: e.name,
    description: e.description ?? "",
    slots: e.slots?.toString() ?? "",
    strike_price: e.strike_price?.toString() ?? "",
    display_price: e.display_price?.toString() ?? "",
    booking_amount_percent: (e.booking_amount_percent ?? 50).toString(),
    gst_percent: (e.gst_percent ?? 5).toString(),
    cgst_percent: (e.cgst_percent ?? 0).toString(),
    sgst_percent: (e.sgst_percent ?? 0).toString(),
    inclusions: e.inclusions ?? "",
    exclusions: e.exclusions ?? "",
    policy: e.policy ?? "",
    things_to_carry: e.things_to_carry ?? "",
    cover_image_url: e.cover_image_url ?? "",
    pdf_url: e.pdf_url ?? "",
    cover_image_id: e.cover_image_id ?? "",
    pdf_file_id: e.pdf_file_id ?? "",
    sort_order: e.sort_order?.toString() ?? "",
    category_ids,
  };
}

function toNullableNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function formToPayload(f: EventEditForm): UpdateEventPayload {
  // Files are referenced by id only; their URLs are short-lived and resolved
  // on demand via GET /api/admin/files/{file_id}, so we never send URLs back.
  const payload: UpdateEventPayload = {
    name: f.name,
    description: f.description,
    booking_amount_percent: Number(f.booking_amount_percent),
    gst_percent: Number(f.gst_percent),
    cgst_percent: Number(f.cgst_percent),
    sgst_percent: Number(f.sgst_percent),
    inclusions: f.inclusions,
    exclusions: f.exclusions,
    policy: f.policy,
    things_to_carry: f.things_to_carry,
    cover_image_id: f.cover_image_id || null,
    pdf_file_id: f.pdf_file_id || null,
    category_ids: f.category_ids.length > 0 ? f.category_ids : null,
  };

  for (const key of NUMERIC_EDIT_FIELDS) {
    payload[key] = toNullableNumber(f[key]);
  }

  return payload;
}

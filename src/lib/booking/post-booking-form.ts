import type { PostBookingFormInput } from "@/lib/validation/schema";
import type {
  BookingFormPersonInput,
  BookingFormPersonResponse,
} from "@/types/bookingConstants";
import type { EventFormField, PickupPoint } from "@/types/eventSubConstants";

export interface PrimaryContact {
  name: string;
  phone: string;
  email?: string;
}

export function formatPickupOptionLabel(point: PickupPoint): string {
  return `${point.name}${point.price ? ` (+₹${point.price.toLocaleString("en-IN")})` : ""}`;
}

export function resolvePickupPointValue(
  saved: string | undefined,
  points: PickupPoint[],
): string {
  const trimmed = saved?.trim() ?? "";
  if (!trimmed) return "";
  if (points.some((p) => p.event_pickup_point_id === trimmed)) {
    return trimmed;
  }
  const byName = points.find((p) => p.name === trimmed);
  return byName?.event_pickup_point_id ?? "";
}

export function buildDefaultPeople(
  attendees: number,
  pickupPoints: PickupPoint[],
  primary?: PrimaryContact,
  existing?: BookingFormPersonResponse[],
  defaultPickupPointId?: string,
): PostBookingFormInput["people"] {
  const count = Math.max(1, attendees);
  return Array.from({ length: count }, (_, i) => {
    const personIndex = i + 1;
    const saved = existing?.find((p) => p.person_index === personIndex);
    const savedPickup = resolvePickupPointValue(
      saved?.pickup_point_id ?? undefined,
      pickupPoints,
    );
    const primaryPickup =
      personIndex === 1
        ? resolvePickupPointValue(defaultPickupPointId, pickupPoints)
        : "";
    return {
      name:
        saved?.name?.trim() ??
        (personIndex === 1 ? (primary?.name.trim() ?? "") : ""),
      phone:
        saved?.phone?.trim() ??
        (personIndex === 1 ? (primary?.phone.trim() ?? "") : ""),
      email:
        saved?.email?.trim() ??
        (personIndex === 1 ? (primary?.email?.trim() ?? "") : ""),
      pickup_point_id: savedPickup || primaryPickup,
      form_responses: saved?.form_responses ?? {},
    };
  });
}

export function validateRequiredFormFields(
  fields: EventFormField[],
  people: PostBookingFormInput["people"],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    for (const field of fields) {
      if (!field.is_required) continue;
      const value = person.form_responses[field.form_field_id]?.trim() ?? "";
      if (!value) {
        errors[`people.${i}.form_responses.${field.form_field_id}`] =
          `${field.label} is required for attendee ${i + 1}`;
      }
    }
  }
  return errors;
}

export function toSubmitPayload(
  people: PostBookingFormInput["people"],
): BookingFormPersonInput[] {
  return people.map((person, index) => {
    const email = person.email?.trim() ?? "";
    const pickup = person.pickup_point_id?.trim() ?? "";
    return {
      person_index: index + 1,
      name: person.name.trim(),
      phone: person.phone.trim(),
      email: email || null,
      pickup_point_id: pickup || null,
      form_responses: Object.fromEntries(
        Object.entries(person.form_responses).filter(([, v]) => v.trim()),
      ),
    };
  });
}

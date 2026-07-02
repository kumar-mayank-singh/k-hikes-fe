import type { PublicEventDetail } from "@/types/bookingConstants";
import type {
  EventOtherPhoto,
  EventOtherPhotosField,
} from "@/types/eventConstants";

function isOtherPhoto(value: unknown): value is EventOtherPhoto {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as EventOtherPhoto).file_id === "string"
  );
}

/**
 * Normalise the gallery field into a sorted `EventOtherPhoto[]`.
 * Accepts either the flat array shape or the nested `{ other_photos: [...] }` group.
 */
export function listEventOtherPhotos(
  field: EventOtherPhotosField,
): EventOtherPhoto[] {
  if (!field) return [];

  const raw: unknown[] = Array.isArray(field)
    ? field
    : Array.isArray(field.other_photos)
      ? field.other_photos
      : [];

  const photos = raw.filter(isOtherPhoto);
  return [...photos].sort((a, b) => a.sort_order - b.sort_order);
}

/** File IDs for create/update payloads (sorted by `sort_order`). */
export function eventOtherPhotoFileIds(field: EventOtherPhotosField): string[] {
  return listEventOtherPhotos(field).map((p) => p.file_id);
}

/** Cover + gallery URLs for public event display (deduped, non-empty). */
export function getEventGalleryUrls(event: PublicEventDetail): string[] {
  const urls: string[] = [];
  if (event.cover_image_url) urls.push(event.cover_image_url);
  for (const photo of listEventOtherPhotos(event.other_photos)) {
    if (photo.url && !urls.includes(photo.url)) urls.push(photo.url);
  }
  return urls;
}

import {
  ItineraryDayItem,
  ItineraryDayPayload,
} from "@/types/eventSubConstants";

export function getItineraryItemId(item: ItineraryDayItem): string {
  return item.id || item.event_itinerary_day_id || "";
}

/** Groups items by `day_number`, sorts days ascending; items per day by `sort_order`. */
export function groupItineraryByDay(
  items: ItineraryDayItem[],
): [number, ItineraryDayItem[]][] {
  const map = new Map<number, ItineraryDayItem[]>();
  for (const item of items) {
    const day = item.day_number;
    const list = map.get(day);
    if (list) {
      list.push(item);
    } else {
      map.set(day, [item]);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export function nextItemOrderForDay(
  items: ItineraryDayItem[],
  dayNumber: number,
): number {
  const inDay = items.filter((i) => i.day_number === dayNumber);
  if (inDay.length === 0) {
    return 1;
  }
  return Math.max(...inDay.map((i) => i.sort_order)) + 1;
}

export function buildItineraryPayload(
  dayNumber: number,
  title: string,
  details: string,
  highlights: string,
  itemOrderRaw: string,
  items: ItineraryDayItem[],
  excludeItemId?: string,
): ItineraryDayPayload {
  const pool =
    excludeItemId === undefined
      ? items
      : items.filter((i) => getItineraryItemId(i) !== excludeItemId);
  const trimmedOrder = itemOrderRaw.trim();
  let sortOrder: number;
  if (trimmedOrder === "") {
    sortOrder = nextItemOrderForDay(pool, dayNumber);
  } else {
    const parsed = parseInt(trimmedOrder, 10);
    sortOrder = Number.isNaN(parsed)
      ? nextItemOrderForDay(pool, dayNumber)
      : parsed;
  }
  return {
    day_number: dayNumber,
    title: title.trim() || null,
    details: details.trim() || null,
    highlights: highlights.trim() || null,
    sort_order: sortOrder,
  };
}

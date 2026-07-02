import { useGetEventDetail, useEventSubResource } from "@/hooks/api/authAPIs";
import { ItineraryDayItem, ItineraryDayPayload } from "@/types/eventSubConstants";

export function useItineraryDays(eventId: string): {
  event: ReturnType<typeof useGetEventDetail>["data"];
  items: ItineraryDayItem[];
  isLoading: boolean;
  isError: boolean;
  error: ReturnType<typeof useGetEventDetail>["error"];
  add: ReturnType<typeof useEventSubResource<ItineraryDayPayload>>["add"];
  remove: ReturnType<typeof useEventSubResource<ItineraryDayPayload>>["remove"];
  update: ReturnType<typeof useEventSubResource<ItineraryDayPayload>>["update"];
} {
  const { data: event, isLoading, isError, error } = useGetEventDetail(eventId);
  const { add, remove, update } = useEventSubResource<ItineraryDayPayload>(
    eventId,
    "itinerary-days",
  );
  const items = event?.itinerary_days ?? [];
  return {
    event,
    items,
    isLoading,
    isError,
    error,
    add,
    remove,
    update,
  };
}

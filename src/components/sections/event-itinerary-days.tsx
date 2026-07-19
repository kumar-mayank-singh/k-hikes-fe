import { CalendarDays } from "lucide-react";

import { groupItineraryByDay } from "@/lib/itinerary-utils";
import { PublicBatchItineraryItem } from "@/types/bookingConstants";

interface EventItineraryDaysProps {
  items: PublicBatchItineraryItem[];
}

export function EventItineraryDays({
  items,
}: EventItineraryDaysProps): React.ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  const grouped = groupItineraryByDay(items);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100">
      <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-emerald-600" />
        Itinerary
      </h2>

      <div className="space-y-8">
        {grouped.map(([day, dayItems]) => (
          <section key={day} aria-labelledby={`itinerary-day-${day}`}>
            <h3
              id={`itinerary-day-${day}`}
              className="text-sm font-semibold uppercase tracking-wider text-emerald-700 mb-3"
            >
              Day {day}
            </h3>

            <ol className="space-y-4 list-none p-0 m-0">
              {dayItems.map((item, index) => (
                <li
                  key={
                    item.event_itinerary_day_id ??
                    `${day}-${item.sort_order}-${index}`
                  }
                  className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-emerald-500"
                >
                  {item.title && (
                    <p className="font-semibold text-stone-900 text-sm mb-1">
                      {item.title}
                    </p>
                  )}
                  {item.details && (
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                      {item.details}
                    </p>
                  )}
                  {item.highlights && (
                    <p className="mt-2 text-emerald-700 text-sm leading-relaxed whitespace-pre-line">
                      {item.highlights}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}

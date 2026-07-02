"use client";

import Link from "next/link";
import {
  ArrowRight,
  Backpack,
  Calendar,
  CheckCircle,
  Compass,
  FileText,
  Mountain,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetPublicEvent,
  useGetPublicEventBatches,
} from "@/hooks/api/publicAPIs";
import { cn } from "@/lib/utils";

interface EventDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
}

const SECTION_TITLE_CLS =
  "flex items-center gap-2 text-base font-bold text-stone-900";

function formatDateRange(start: string, end: string): string {
  try {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const s = new Date(start).toLocaleDateString("en-IN", opts);
    const e = new Date(end).toLocaleDateString("en-IN", opts);
    return s === e ? s : `${s} → ${e}`;
  } catch {
    return start;
  }
}

export function EventDetailsModal({
  open,
  onOpenChange,
  eventId,
}: EventDetailsModalProps): React.ReactElement {
  const enabled = open && Boolean(eventId);
  const { data: event, isLoading, isError, error } = useGetPublicEvent(
    enabled ? eventId ?? undefined : undefined,
  );
  const { data: batches = [] } = useGetPublicEventBatches(event?.event_id);

  const bookableBatches = batches.filter(
    (b) => b.is_bookable && !b.is_sold_out,
  );

  const targetEventId = event?.event_id ?? eventId ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-stone-50 max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">
          {event?.name ?? "Event details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Event preview with description, pricing and book-now action.
        </DialogDescription>

        {isLoading ? (
          <ModalSkeleton />
        ) : isError || !event ? (
          <div className="p-10 text-center">
            <Mountain className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-700 font-semibold">
              Could not load this event
            </p>
            <p className="text-stone-500 text-sm mt-1">
              {error instanceof Error
                ? error.message
                : "Please try again in a moment."}
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-56 sm:h-64 shrink-0">
              {event.cover_image_url ? (
                <img
                  src={event.cover_image_url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-emerald-600 via-emerald-700 to-stone-900 flex items-center justify-center">
                  <Mountain className="w-20 h-20 text-emerald-300/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-stone-900/85 via-stone-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                {event.on_sale && (
                  <span className="inline-block bg-amber-500 text-white text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold mb-2">
                    On sale
                  </span>
                )}
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white drop-shadow">
                  {event.name}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <PriceTag
                  display={event.display_price}
                  strike={event.strike_price}
                />
                <BookableSummary
                  count={bookableBatches.length}
                  nextDate={
                    bookableBatches[0]
                      ? formatDateRange(
                          bookableBatches[0].start_date,
                          bookableBatches[0].end_date,
                        )
                      : null
                  }
                />
              </div>

              {event.description && (
                <Section
                  icon={<Compass className="w-4 h-4 text-emerald-600" />}
                  title="About this trek"
                >
                  <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-line line-clamp-6">
                    {event.description}
                  </p>
                </Section>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {event.inclusions && (
                  <Section
                    icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                    title="Inclusions"
                  >
                    <p className="text-stone-600 text-sm whitespace-pre-line line-clamp-5">
                      {event.inclusions}
                    </p>
                  </Section>
                )}
                {event.exclusions && (
                  <Section
                    icon={<XCircle className="w-4 h-4 text-rose-500" />}
                    title="Exclusions"
                  >
                    <p className="text-stone-600 text-sm whitespace-pre-line line-clamp-5">
                      {event.exclusions}
                    </p>
                  </Section>
                )}
                {event.things_to_carry && (
                  <Section
                    icon={<Backpack className="w-4 h-4 text-amber-600" />}
                    title="Things to carry"
                  >
                    <p className="text-stone-600 text-sm whitespace-pre-line line-clamp-5">
                      {event.things_to_carry}
                    </p>
                  </Section>
                )}
                {event.policy && (
                  <Section
                    icon={<FileText className="w-4 h-4 text-stone-500" />}
                    title="Cancellation policy"
                  >
                    <p className="text-stone-600 text-sm whitespace-pre-line line-clamp-5">
                      {event.policy}
                    </p>
                  </Section>
                )}
              </div>
            </div>

            <div className="border-t border-stone-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-stone-500">
                Free cancellation up to 7 days before the trek.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Close
                </button>
                <Link
                  href={`/events/${targetEventId}`}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-colors",
                    bookableBatches.length > 0
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-stone-700 hover:bg-stone-800",
                  )}
                >
                  {bookableBatches.length > 0 ? "Book Now" : "View Details"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModalSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse">
      <div className="h-56 sm:h-64 bg-stone-200" />
      <div className="px-6 py-5 space-y-4">
        <div className="h-6 bg-stone-200 rounded w-1/2" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-4/5" />
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="h-24 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function PriceTag({
  display,
  strike,
}: {
  display: number | null;
  strike: number | null;
}): React.ReactElement {
  if (display == null) {
    return <span className="text-stone-500 text-sm">Price on request</span>;
  }
  return (
    <div className="flex items-baseline gap-2">
      {strike != null && (
        <span className="text-stone-400 line-through text-base">
          ₹{strike.toLocaleString()}
        </span>
      )}
      <span className="text-emerald-700 font-extrabold text-2xl">
        ₹{display.toLocaleString()}
      </span>
      <span className="text-stone-400 text-xs">per person</span>
    </div>
  );
}

function BookableSummary({
  count,
  nextDate,
}: {
  count: number;
  nextDate: string | null;
}): React.ReactElement {
  if (count === 0 || !nextDate) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-medium bg-amber-50 px-3 py-1.5 rounded-full">
        <Calendar className="w-3.5 h-3.5" /> Dates coming soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
      <Calendar className="w-3.5 h-3.5" /> Next: {nextDate}
      {count > 1 && (
        <span className="text-emerald-600/80">+{count - 1} more</span>
      )}
    </span>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section>
      <h3 className={SECTION_TITLE_CLS}>
        {icon}
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

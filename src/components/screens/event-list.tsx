"use client";

import { ChevronLeft, ChevronRight, Mountain } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useGetCategories, useGetEvents } from "@/hooks/api/authAPIs";
import { useEventsUIStore } from "@/store/events-store";
import { CreateEventForm } from "../sections/create-event-form";
import { EventCard } from "../components/event-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/eventConstants";

const PER_PAGE = 12;
const ALL = "__all__";

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function EventsList() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [status, setStatus] = useState<EventStatus | undefined>();

  const {
    data: categories = [],
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategories();

  const {
    data: eventsPage,
    error: eventsError,
    isLoading: eventsLoading,
  } = useGetEvents({
    page,
    per_page: PER_PAGE,
    category_id: categoryId,
    status,
  });

  const events = eventsPage?.items ?? [];
  const totalCount = eventsPage?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const { isCreateFormOpen, closeCreateForm } = useEventsUIStore();

  useEffect(() => {
    if (eventsError) toast.error(eventsError.message);
    if (categoriesError) toast.error(categoriesError.message);
  }, [eventsError, categoriesError]);

  const isLoading = eventsLoading || categoriesLoading;

  const hasFilters = Boolean(categoryId || status);

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return "";
    const start = (page - 1) * PER_PAGE + 1;
    const end = Math.min(page * PER_PAGE, totalCount);
    return `${start}–${end} of ${totalCount}`;
  }, [page, totalCount]);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center text-gray-500">
        Loading events...
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isCreateFormOpen && (
          <CreateEventForm categories={categories} onCancel={closeCreateForm} />
        )}

        <div className="mb-4 flex flex-wrap items-end gap-8">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="events-filter-category"
            className="text-sm font-medium text-muted-foreground px-1"
          >
            Category
          </label>
          <Select
            value={categoryId ?? ALL}
            onValueChange={(v) => {
              setCategoryId(v === ALL ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger
              id="events-filter-category"
              className="w-[min(100%,220px)]"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.category_id} value={c.category_id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label
            htmlFor="events-filter-status"
            className="text-sm font-medium text-muted-foreground px-1"
          >
            Status
          </label>
          <Select
            value={status ?? ALL}
            onValueChange={(v) => {
              setStatus(v === ALL ? undefined : (v as EventStatus));
              setPage(1);
            }}
          >
            <SelectTrigger
              id="events-filter-status"
              className="w-[min(100%,180px)]"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white py-10 text-center shadow-sm">
              <Mountain className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                {hasFilters
                  ? "No events match the selected filters."
                  : "No events yet. Create your first event!"}
              </p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.event_id}
                event={event}
                categories={categories}
              />
            ))
          )}
        </div>
      </div>

      {totalCount > 0 && (
        <div
          className={cn(
            "mt-4 flex shrink-0 flex-wrap items-center justify-end gap-4",
            "border-t border-gray-200 bg-white py-3",
          )}
        >
          <span className="text-sm text-muted-foreground">{rangeLabel}</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm tabular-nums px-2 min-w-22 text-center">
              Page {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

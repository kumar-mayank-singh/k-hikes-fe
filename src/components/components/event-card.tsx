"use client";

import Link from "next/link";
import { Mountain, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDeleteEvent, useToggleEventStatus, useToggleOnSale } from "@/hooks/api/authAPIs";
import { AdminFileImage } from "@/components/components/admin-file-image";
import { Category } from "@/types/categoryConstants";
import { Event } from "@/types/eventConstants";

interface EventCardProps {
  event: Event;
  categories: Category[];
}

export function EventCard({ event, categories }: EventCardProps) {
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: toggleStatus, isPending: isTogglingStatus } =
    useToggleEventStatus();
  const { mutate: toggleOnSale, isPending: isTogglingOnSale } =
    useToggleOnSale();

  const categoryName = categories.find((c) => c.category_id === event.category_id)?.name;

  const draftStatus = event.is_draft ? "draft" : "live";

  const handleDelete = () => {
    if (!confirm("Delete this event?")) return;
    deleteEvent(event.event_id, {
      onSuccess: () => toast.success("Event deleted"),
      onError: () => toast.error("Failed to delete event"),
    });
  };

  const handleToggleStatus = () => {
    toggleStatus(
      { event_id: event.event_id, currentStatus: draftStatus },
      { onError: () => toast.error("Failed to update status") }
    );
  };

  const handleToggleOnSale = () => {
    toggleOnSale(
      { event_id: event.event_id, currentOnSale: event.on_sale },
      { onError: () => toast.error("Failed to update sale status") }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between gap-4">
      {/* Left: thumbnail + info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-lg bg-linear-to-br from-green-400 to-green-700 flex items-center justify-center shrink-0 overflow-hidden">
          <AdminFileImage
            fileId={event.cover_image_id}
            alt={event.name}
            className="w-full h-full object-cover"
            fallback={<Mountain className="w-8 h-8 text-green-200" />}
          />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{event.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              variant="secondary"
              className={
                draftStatus === "live"
                  ? "bg-green-100 text-green-700"
                  : draftStatus === "draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
              }
            >
              {draftStatus}
            </Badge>
            {categoryName && (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700"
              >
                {categoryName}
              </Badge>
            )}
            {event.display_price != null && (
              <span className="text-sm text-gray-500">
                ₹{event.display_price.toLocaleString()}
              </span>
            )}
            {event.slots != null && (
              <span className="text-sm text-gray-500">{event.slots} slots</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={handleToggleStatus}
          disabled={isTogglingStatus}
          variant="outline"
          className={`text-xs px-3 py-1 rounded-full border transition-colors disabled:opacity-50 ${
            draftStatus === "live"
              ? "border-green-300 text-green-700 hover:border-green-700"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {draftStatus === "live" ? "Set Draft" : "Go Live"}
        </Button>

        <Button
          onClick={handleToggleOnSale}
          disabled={isTogglingOnSale}
          variant="outline"
          className={`text-xs px-3 py-1 rounded-full border transition-colors disabled:opacity-50 ${
            event.on_sale
              ? "border-blue-300 text-blue-700 bg-blue-50"
              : "border-gray-300 text-gray-600"
          }`}
        >
          {event.on_sale ? "On Sale" : "Sold Out"}
        </Button>

        <Link
          href={`/admin/events/${event.event_id}`}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </Link>

        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="outline"
          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useItineraryDays } from "@/hooks/useItineraryDays";
import {
  buildItineraryPayload,
  getItineraryItemId,
  groupItineraryByDay,
  nextItemOrderForDay,
} from "@/lib/itinerary-utils";
import { cn } from "@/lib/utils";
import { INPUT_CLS, LABEL_CLS } from "./event-edit-shared";

type ItemFormState = {
  day_number: string;
  title: string;
  details: string;
  highlights: string;
  item_order: string;
};

function emptyForm(defaultDay: number): ItemFormState {
  return {
    day_number: String(defaultDay),
    title: "",
    details: "",
    highlights: "",
    item_order: "",
  };
}

function formFromItem(item: {
  day_number: number;
  title: string | null;
  details: string | null;
  highlights: string | null;
  sort_order: number;
}): ItemFormState {
  return {
    day_number: String(item.day_number),
    title: item.title ?? "",
    details: item.details ?? "",
    highlights: item.highlights ?? "",
    item_order: String(item.sort_order),
  };
}

export function EventEditItinerarySection({
  eventId,
}: {
  eventId: string;
}) {
  const { items, isLoading, isError, event, add, remove, update } =
    useItineraryDays(eventId);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [addForm, setAddForm] = useState<ItemFormState>(() => emptyForm(1));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>(() => emptyForm(1));

  const grouped = useMemo(() => groupItineraryByDay(items), [items]);

  const defaultDayForNewItem = (): number => {
    if (items.length === 0) {
      return 1;
    }
    return Math.max(...items.map((i) => i.day_number));
  };

  const showForm = items.length > 0 || addPanelOpen;

  const parseDayNumber = (raw: string): number | null => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 1) {
      return null;
    }
    return n;
  };

  const handleOpenAdd = (): void => {
    setAddForm(emptyForm(defaultDayForNewItem()));
    setAddPanelOpen(true);
  };

  const handleSaveNew = (): void => {
    const day = parseDayNumber(addForm.day_number);
    if (day === null) {
      toast.error("Day number must be a positive integer");
      return;
    }
    if (!addForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = buildItineraryPayload(
      day,
      addForm.title,
      addForm.details,
      addForm.highlights,
      addForm.item_order,
      items,
    );
    add.mutate(payload, {
      onSuccess: () => {
        toast.success("Itinerary item added");
        setAddForm(emptyForm(day));
      },
    });
  };

  const startEdit = (item: (typeof items)[number]): void => {
    const id = getItineraryItemId(item);
    if (!id) {
      toast.error("Missing item id");
      return;
    }
    setEditingId(id);
    setEditForm(formFromItem(item));
  };

  const handleSaveEdit = (): void => {
    if (!editingId) {
      return;
    }
    const day = parseDayNumber(editForm.day_number);
    if (day === null) {
      toast.error("Day number must be a positive integer");
      return;
    }
    if (!editForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = buildItineraryPayload(
      day,
      editForm.title,
      editForm.details,
      editForm.highlights,
      editForm.item_order,
      items,
      editingId,
    );
    update.mutate(
      { itemId: editingId, payload: { ...payload } as Record<string, unknown> },
      {
        onSuccess: () => {
          toast.success("Itinerary item updated");
          setEditingId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="text-gray-500 text-center py-10">Loading itinerary…</div>
    );
  }
  if (isError || !event) {
    return (
      <div className="text-gray-500 text-center py-10">
        Could not load itinerary
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h2 className="font-bold text-gray-900 text-lg">Itinerary</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add itinerary details per day.
        </p>
      </div>

      {!showForm && (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center space-y-4">
          <p className="text-gray-600">No itinerary details yet.</p>
          <Button
            type="button"
            onClick={handleOpenAdd}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add itinerary details
          </Button>
        </div>
      )}

      {showForm && (
        <>
          {grouped.length === 0 ? (
            <p className="text-sm text-gray-500">
              Add your first item for day {addForm.day_number}.
            </p>
          ) : (
            <div className="space-y-8">
              {grouped.map(([day, dayItems]) => (
                <section key={day} aria-labelledby={`itinerary-day-${day}`}>
                  <h3
                    id={`itinerary-day-${day}`}
                    className="text-base font-semibold text-gray-900 mb-3"
                  >
                    Day {day}
                  </h3>
                  <ul className="space-y-3 list-none p-0 m-0">
                    {dayItems.map((item) => {
                      const itemId = getItineraryItemId(item);
                      const isEditing = editingId === itemId;
                      return (
                        <li
                          key={itemId || `${day}-${item.sort_order}`}
                          className="border border-gray-100 rounded-lg bg-gray-50/80 p-4"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label
                                    className={LABEL_CLS}
                                    htmlFor={`edit-day-${itemId}`}
                                  >
                                    Day number
                                  </label>
                                  <input
                                    id={`edit-day-${itemId}`}
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    value={editForm.day_number}
                                    onChange={(e) =>
                                      setEditForm((f) => ({
                                        ...f,
                                        day_number: e.target.value,
                                      }))
                                    }
                                    className={INPUT_CLS}
                                  />
                                </div>
                                <div>
                                  <label
                                    className={LABEL_CLS}
                                    htmlFor={`edit-order-${itemId}`}
                                  >
                                    Item order
                                  </label>
                                  <input
                                    id={`edit-order-${itemId}`}
                                    type="number"
                                    min={0}
                                    inputMode="numeric"
                                    placeholder={`Auto: ${nextItemOrderForDay(items.filter((i) => getItineraryItemId(i) !== editingId), parseInt(editForm.day_number, 10) || 1)}`}
                                    value={editForm.item_order}
                                    onChange={(e) =>
                                      setEditForm((f) => ({
                                        ...f,
                                        item_order: e.target.value,
                                      }))
                                    }
                                    className={INPUT_CLS}
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  className={LABEL_CLS}
                                  htmlFor={`edit-title-${itemId}`}
                                >
                                  Title
                                </label>
                                <input
                                  id={`edit-title-${itemId}`}
                                  value={editForm.title}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      title: e.target.value,
                                    }))
                                  }
                                  className={INPUT_CLS}
                                />
                              </div>
                              <div>
                                <label
                                  className={LABEL_CLS}
                                  htmlFor={`edit-details-${itemId}`}
                                >
                                  Details
                                </label>
                                <textarea
                                  id={`edit-details-${itemId}`}
                                  rows={4}
                                  value={editForm.details}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      details: e.target.value,
                                    }))
                                  }
                                  className={INPUT_CLS}
                                />
                              </div>
                              <div>
                                <label
                                  className={LABEL_CLS}
                                  htmlFor={`edit-highlights-${itemId}`}
                                >
                                  Highlights
                                </label>
                                <textarea
                                  id={`edit-highlights-${itemId}`}
                                  rows={3}
                                  value={editForm.highlights}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      highlights: e.target.value,
                                    }))
                                  }
                                  className={INPUT_CLS}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-green-700 hover:bg-green-800 text-white"
                                  disabled={update.isPending}
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900">
                                    {item.title?.trim() || "Untitled"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Item order {item.sort_order}
                                  </p>
                                </div>
                                <div className="flex items-start gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(item)}
                                    className="text-gray-600 hover:bg-gray-200 p-2 rounded"
                                    aria-label="Edit item"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!itemId) {
                                        toast.error("Missing item id");
                                        return;
                                      }
                                      remove.mutate(itemId);
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                                    aria-label="Delete item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {item.details?.trim() ? (
                                <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                                  {item.details}
                                </p>
                              ) : null}
                              {item.highlights?.trim() ? (
                                <p className="text-sm text-amber-900/90 mt-2 whitespace-pre-wrap">
                                  <span className="font-medium">
                                    Highlights:{" "}
                                  </span>
                                  {item.highlights}
                                </p>
                              ) : null}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div
            className={cn(
              "rounded-xl border border-gray-200 p-4 space-y-3",
              grouped.length > 0 && "pt-2",
            )}
          >
            <h3 className="text-sm font-semibold text-gray-800">
              {grouped.length === 0
                ? "Add day 1 details"
                : "Add another item"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS} htmlFor="new-itinerary-day">
                  Day number
                </label>
                <input
                  id="new-itinerary-day"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={addForm.day_number}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, day_number: e.target.value }))
                  }
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS} htmlFor="new-itinerary-order">
                  Item order
                </label>
                <input
                  id="new-itinerary-order"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={`Auto: ${nextItemOrderForDay(items, parseInt(addForm.day_number, 10) || 1)}`}
                  value={addForm.item_order}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, item_order: e.target.value }))
                  }
                  className={INPUT_CLS}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLS} htmlFor="new-itinerary-title">
                Title
              </label>
              <input
                id="new-itinerary-title"
                value={addForm.title}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, title: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS} htmlFor="new-itinerary-details">
                Details
              </label>
              <textarea
                id="new-itinerary-details"
                rows={4}
                value={addForm.details}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, details: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS} htmlFor="new-itinerary-highlights">
                Highlights
              </label>
              <textarea
                id="new-itinerary-highlights"
                rows={3}
                value={addForm.highlights}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, highlights: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                type="button"
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={add.isPending}
                onClick={handleSaveNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Save item
              </Button>
              {items.length === 0 && addPanelOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddPanelOpen(false)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Clock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetBatches,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
} from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS } from "./event-edit-shared";
import { BatchDeparturePriceOptions } from "./batch-departure-price-options";
import {
  Batch,
  BatchStatus,
  CreateBatchPayload,
} from "@/types/eventSubConstants";

interface BatchFormState {
  nickname: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: BatchStatus;
  is_bookable: boolean;
  is_sold_out: boolean;
  slots_override: string;
  showPriceOverride: boolean;
  display_price: string;
  strike_price: string;
  google_drive_link: string;
  whatsapp_group_link: string;
  who_will_go: string;
  comment: string;
}

const STATUS_OPTIONS: { value: BatchStatus; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const EMPTY_FORM: BatchFormState = {
  nickname: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  status: "live",
  is_bookable: true,
  is_sold_out: false,
  slots_override: "",
  showPriceOverride: false,
  display_price: "",
  strike_price: "",
  google_drive_link: "",
  whatsapp_group_link: "",
  who_will_go: "",
  comment: "",
};

function nullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Normalize API time (`HH:MM:SS` or `HH:MM`) for `<input type="time">`. */
function toTimeInputValue(time: string | null | undefined): string {
  if (!time?.trim()) return "";
  return time.trim().slice(0, 5);
}

function batchToForm(b: Batch): BatchFormState {
  return {
    nickname: b.nickname ?? "",
    start_date: b.start_date ?? "",
    end_date: b.end_date ?? "",
    start_time: toTimeInputValue(b.start_time),
    end_time: toTimeInputValue(b.end_time),
    status: b.status ?? "live",
    is_bookable: b.is_bookable,
    is_sold_out: b.is_sold_out,
    slots_override: b.slots_override != null ? String(b.slots_override) : "",
    showPriceOverride: b.price_override === true,
    display_price: b.display_price != null ? String(b.display_price) : "",
    strike_price: b.strike_price != null ? String(b.strike_price) : "",
    google_drive_link: b.google_drive_link ?? "",
    whatsapp_group_link: b.whatsapp_group_link ?? "",
    who_will_go: b.who_will_go ?? "",
    comment: b.comment ?? "",
  };
}

function formToCreatePayload(f: BatchFormState): CreateBatchPayload {
  const payload: CreateBatchPayload = {
    nickname: nullableString(f.nickname),
    start_date: f.start_date.trim(),
    end_date: f.end_date.trim(),
    start_time: nullableString(f.start_time),
    end_time: nullableString(f.end_time),
    status: f.status,
    is_bookable: f.is_bookable,
    is_sold_out: f.is_sold_out,
    slots_override: nullableNumber(f.slots_override),
    price_override: f.showPriceOverride,
    display_price: f.showPriceOverride
      ? nullableNumber(f.display_price)
      : null,
    strike_price: f.showPriceOverride ? nullableNumber(f.strike_price) : null,
    google_drive_link: nullableString(f.google_drive_link),
    whatsapp_group_link: nullableString(f.whatsapp_group_link),
    who_will_go: nullableString(f.who_will_go),
    comment: nullableString(f.comment),
  };
  return payload;
}

function validateForm(f: BatchFormState): string | null {
  if (!f.start_date.trim()) return "Start date is required";
  if (!f.end_date.trim()) return "End date is required";
  if (f.end_date < f.start_date) {
    return "End cannot be before start";
  }
  if (
    f.end_date === f.start_date &&
    f.start_time.trim() &&
    f.end_time.trim() &&
    f.end_time < f.start_time
  ) {
    return "End cannot be before start";
  }
  return null;
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatDayMonth(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const startLabel = sameYear
    ? formatDayMonth(s)
    : s.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  const endLabel = e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

function formatTimeRange(
  start: string | null,
  end: string | null,
): string | null {
  const s = start?.trim().slice(0, 5) ?? "";
  const e = end?.trim().slice(0, 5) ?? "";
  if (!s && !e) return null;
  if (s && e) return `${s} - ${e}`;
  return s || e;
}

function getDateParts(dateStr: string): { month: string; day: string } {
  const date = parseLocalDate(dateStr);
  return {
    month: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: String(date.getDate()),
  };
}

export function EventEditDatesSection({
  eventId,
}: {
  eventId: string;
}): React.ReactNode {
  const {
    data: batches = [],
    isLoading,
    isError,
    error,
  } = useGetBatches(eventId);
  const createBatch = useCreateBatch(eventId);
  const updateBatch = useUpdateBatch(eventId);
  const deleteBatch = useDeleteBatch(eventId);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<BatchFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BatchFormState>(EMPTY_FORM);

  const cancelEdit = useCallback((): void => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const openAddForm = useCallback((): void => {
    setIsAdding(true);
    setAddForm(EMPTY_FORM);
    cancelEdit();
  }, [cancelEdit]);

  const cancelAdd = useCallback((): void => {
    setIsAdding(false);
    setAddForm(EMPTY_FORM);
  }, []);

  const handleAdd = useCallback((): void => {
    const errorMsg = validateForm(addForm);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    createBatch.mutate(formToCreatePayload(addForm), {
      onSuccess: () => cancelAdd(),
    });
  }, [addForm, createBatch, cancelAdd]);

  const startEdit = useCallback((b: Batch): void => {
    setEditingId(b.batch_id);
    setEditForm(batchToForm(b));
    setIsAdding(false);
  }, []);

  const handleUpdate = useCallback((): void => {
    if (!editingId) return;
    const errorMsg = validateForm(editForm);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    updateBatch.mutate(
      { batchId: editingId, payload: formToCreatePayload(editForm) },
      { onSuccess: () => cancelEdit() },
    );
  }, [editingId, editForm, updateBatch, cancelEdit]);

  const handleDelete = useCallback(
    (id: string): void => {
      deleteBatch.mutate(id);
      if (editingId === id) cancelEdit();
    },
    [deleteBatch, editingId, cancelEdit],
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading departures…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-600">
          Failed to load departures{error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-4">Departures</h2>

      {batches.length === 0 && (
        <p className="text-gray-500 text-sm mb-4">
          No departures yet. Add one below.
        </p>
      )}

      {batches.map((b) => {
        const id = b.batch_id;
        const isEditing = editingId === id;
        const timeRange = formatTimeRange(b.start_time, b.end_time);

        if (isEditing) {
          return (
            <div
              key={id}
              className="p-4 border-2 border-green-200 bg-green-50/30 rounded-lg mb-3"
            >
              <BatchFormFields form={editForm} onChange={setEditForm} />
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateBatch.isPending}
                  className={cn(
                    "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {updateBatch.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        }

        const { month, day } = getDateParts(b.start_date);
        const nickname = b.nickname?.trim() ?? "";
        const dateRangeLabel = formatDateRange(b.start_date, b.end_date);

        return (
          <article
            key={id}
            className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-start gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {month}
                </span>
                <span className="text-xl font-bold leading-none text-green-800">
                  {day}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {nickname ? (
                  <h3 className="truncate text-sm font-bold uppercase tracking-wide text-gray-900">
                    {nickname}
                  </h3>
                ) : null}
                <p
                  className={cn(
                    "text-sm",
                    nickname
                      ? "mt-0.5 text-gray-500"
                      : "font-semibold text-gray-900",
                  )}
                >
                  {dateRangeLabel}
                </p>
                {timeRange && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-green-800">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{timeRange}</span>
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(b)}
                  className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                  aria-label="Edit departure"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50"
                  aria-label="Delete departure"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mx-4 border-t border-gray-200" />

            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    b.status === "live"
                      ? "bg-green-50 text-green-700"
                      : b.status === "draft"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-gray-100 text-gray-600",
                  )}
                >
                  {b.status}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    b.is_sold_out
                      ? "bg-red-50 text-red-700"
                      : b.is_bookable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500",
                  )}
                >
                  {b.is_sold_out
                    ? "Sold Out"
                    : b.is_bookable
                      ? "On Sale"
                      : "Not Bookable"}
                </span>
              </div>
              {b.display_price != null && (
                <span className="shrink-0 text-lg font-bold text-green-800">
                  ₹{b.display_price.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <BatchDeparturePriceOptions
              eventId={eventId}
              batchId={id}
              priceOverride={b.price_override === true}
            />
          </article>
        );
      })}

      {isAdding ? (
        <div className="mt-4 p-4 border-2 border-green-200 bg-green-50/30 rounded-lg">
          <BatchFormFields form={addForm} onChange={setAddForm} />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={createBatch.isPending}
              className={cn(
                "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {createBatch.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAddForm}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Add Departure
        </button>
      )}
    </div>
  );
}

function BatchFormFields({
  form,
  onChange,
}: {
  form: BatchFormState;
  onChange: (next: BatchFormState) => void;
}): React.ReactNode {
  const set = <K extends keyof BatchFormState>(
    key: K,
    value: BatchFormState[K],
  ): void => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Nickname</label>
          <input
            placeholder="e.g. Long Weekend Special"
            value={form.nickname}
            onChange={(e) => set("nickname", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as BatchStatus)}
            className={INPUT_CLS}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Start date *</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            className={INPUT_CLS}
            required
          />
        </div>
        <div>
          <label className={LABEL_CLS}>End date *</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            className={INPUT_CLS}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Start time</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => set("start_time", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>End time</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => set("end_time", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>Slots Override</label>
        <input
          type="number"
          placeholder="Override available slots"
          value={form.slots_override}
          onChange={(e) => set("slots_override", e.target.value)}
          className={INPUT_CLS}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => {
            if (form.showPriceOverride) {
              onChange({
                ...form,
                showPriceOverride: false,
                display_price: "",
                strike_price: "",
              });
            } else {
              set("showPriceOverride", true);
            }
          }}
          className={cn(
            "px-4 py-2 text-sm rounded-lg",
            form.showPriceOverride
              ? "text-gray-600 hover:bg-gray-100"
              : "bg-green-700 text-white hover:bg-green-800",
          )}
        >
          {form.showPriceOverride ? "Remove Price Override" : "Price Override"}
        </button>
      </div>

      {form.showPriceOverride && (
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Display Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={form.display_price}
            onChange={(e) => set("display_price", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Strike Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={form.strike_price}
            onChange={(e) => set("strike_price", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>WhatsApp Group Link</label>
          <input
            type="url"
            placeholder="https://chat.whatsapp.com/..."
            value={form.whatsapp_group_link}
            onChange={(e) => set("whatsapp_group_link", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Google Drive Link</label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={form.google_drive_link}
            onChange={(e) => set("google_drive_link", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* <div>
        <label className={LABEL_CLS}>Who Will Go</label>
        <textarea
          rows={2}
          placeholder="Who is going on this departure?"
          value={form.who_will_go}
          onChange={(e) => set("who_will_go", e.target.value)}
          className={INPUT_CLS}
        />
      </div> */}

      <div>
        <label className={LABEL_CLS}>Internal Comment</label>
        <textarea
          rows={2}
          placeholder="Notes for the team (not shown to customers)"
          value={form.comment}
          onChange={(e) => set("comment", e.target.value)}
          className={INPUT_CLS}
        />
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_bookable}
            onChange={(e) => set("is_bookable", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
          />
          Bookable
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_sold_out}
            onChange={(e) => set("is_sold_out", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
          />
          Sold Out
        </label>
      </div>
    </div>
  );
}

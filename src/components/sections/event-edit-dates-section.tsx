"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetBatches,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
} from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS, ItemRow } from "./event-edit-shared";
import {
  Batch,
  BatchStatus,
  CreateBatchPayload,
} from "@/types/eventSubConstants";

interface BatchFormState {
  nickname: string;
  start: string;
  end: string;
  status: BatchStatus;
  is_bookable: boolean;
  is_sold_out: boolean;
  batch_size: string;
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
  start: "",
  end: "",
  status: "live",
  is_bookable: true,
  is_sold_out: false,
  batch_size: "",
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

function combineDateTime(date: string | null, time: string | null): string {
  if (!date) return "";
  const t = (time ?? "").slice(0, 5) || "00:00";
  return `${date}T${t}`;
}

function splitDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

function batchToForm(b: Batch): BatchFormState {
  return {
    nickname: b.nickname ?? "",
    start: combineDateTime(b.start_date, b.start_time),
    end: combineDateTime(b.end_date, b.end_time),
    status: b.status ?? "live",
    is_bookable: b.is_bookable,
    is_sold_out: b.is_sold_out,
    batch_size: b.batch_size != null ? String(b.batch_size) : "",
    slots_override: b.slots_override != null ? String(b.slots_override) : "",
    showPriceOverride:
      b.display_price != null || b.strike_price != null,
    display_price: b.display_price != null ? String(b.display_price) : "",
    strike_price: b.strike_price != null ? String(b.strike_price) : "",
    google_drive_link: b.google_drive_link ?? "",
    whatsapp_group_link: b.whatsapp_group_link ?? "",
    who_will_go: b.who_will_go ?? "",
    comment: b.comment ?? "",
  };
}

function formToCreatePayload(f: BatchFormState): CreateBatchPayload {
  const start = splitDateTime(f.start);
  const end = splitDateTime(f.end);
  return {
    nickname: nullableString(f.nickname),
    start_date: start.date,
    end_date: end.date,
    start_time: start.time,
    end_time: end.time,
    status: f.status,
    is_bookable: f.is_bookable,
    is_sold_out: f.is_sold_out,
    batch_size: nullableNumber(f.batch_size),
    slots_override: nullableNumber(f.slots_override),
    display_price: f.showPriceOverride
      ? nullableNumber(f.display_price)
      : null,
    strike_price: f.showPriceOverride ? nullableNumber(f.strike_price) : null,
    google_drive_link: nullableString(f.google_drive_link),
    whatsapp_group_link: nullableString(f.whatsapp_group_link),
    who_will_go: nullableString(f.who_will_go),
    comment: nullableString(f.comment),
  };
}

function validateForm(f: BatchFormState): string | null {
  if (!f.start) return "Start date and time are required";
  if (!f.end) return "End date and time are required";
  if (new Date(f.end) < new Date(f.start)) {
    return "End cannot be before start";
  }
  return null;
}

function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const s = new Date(start).toLocaleDateString("en-IN", opts);
  const e = new Date(end).toLocaleDateString("en-IN", opts);
  return s === e ? s : `${s} — ${e}`;
}

function formatTimeRange(start: string, end: string): string {
  const trim = (t: string): string => t.slice(0, 5);
  return `${trim(start)} – ${trim(end)}`;
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

        return (
          <ItemRow
            key={id}
            onDelete={() => handleDelete(id)}
            onEdit={() => startEdit(b)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {b.nickname && (
                <span className="font-medium">{b.nickname}</span>
              )}
              <span className={cn(b.nickname ? "text-sm text-gray-700" : "font-medium")}>
                {formatDateRange(b.start_date, b.end_date)}
              </span>
              <span className="text-sm text-gray-500">
                {formatTimeRange(b.start_time, b.end_time)}
              </span>
              {b.display_price != null && (
                <span className="text-sm text-green-700">
                  ₹{b.display_price.toLocaleString("en-IN")}
                </span>
              )}
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  b.status === "live"
                    ? "bg-green-100 text-green-700"
                    : b.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600",
                )}
              >
                {b.status}
              </span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  b.is_sold_out
                    ? "bg-red-100 text-red-700"
                    : b.is_bookable
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {b.is_sold_out
                  ? "Sold Out"
                  : b.is_bookable
                    ? "On Sale"
                    : "Not Bookable"}
              </span>
              {b.batch_size != null && (
                <span className="text-xs text-gray-500">
                  Size: {b.batch_size}
                </span>
              )}
            </div>
          </ItemRow>
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
          <label className={LABEL_CLS}>Start *</label>
          <input
            type="datetime-local"
            value={form.start}
            onChange={(e) => set("start", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>End *</label>
          <input
            type="datetime-local"
            value={form.end}
            onChange={(e) => set("end", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Batch Size</label>
          <input
            type="number"
            placeholder="Total seats for this batch"
            value={form.batch_size}
            onChange={(e) => set("batch_size", e.target.value)}
            className={INPUT_CLS}
          />
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

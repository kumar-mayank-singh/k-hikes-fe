"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetPickupPoints,
  useCreatePickupPoint,
  useUpdatePickupPoint,
  useDeletePickupPoint,
} from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS, ItemRow } from "./event-edit-shared";
import { PickupPoint } from "@/types/eventSubConstants";

interface PickupFormState {
  name: string;
  google_map_link: string;
  arrival_time: string;
  departure_time: string;
  price: string;
  sort_order: string;
  is_active: boolean;
}

const EMPTY_FORM: PickupFormState = {
  name: "",
  google_map_link: "",
  arrival_time: "",
  departure_time: "",
  price: "",
  sort_order: "0",
  is_active: true,
};

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function datetimeLocalToZulu(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function pickupToForm(p: PickupPoint): PickupFormState {
  return {
    name: p.name,
    google_map_link: p.google_map_link ?? "",
    arrival_time: isoToDatetimeLocal(p.arrival_time),
    departure_time: isoToDatetimeLocal(p.departure_time),
    price: p.price != null ? String(p.price) : "",
    sort_order: String(p.sort_order),
    is_active: p.is_active,
  };
}

function formToCreatePayload(f: PickupFormState) {
  return {
    name: f.name,
    google_map_link: f.google_map_link || null,
    arrival_time: datetimeLocalToZulu(f.arrival_time),
    departure_time: datetimeLocalToZulu(f.departure_time),
    price: f.price ? parseFloat(f.price) : null,
    sort_order: parseInt(f.sort_order, 10) || 0,
    is_active: f.is_active,
  };
}

export function EventEditPickupSection({ eventId }: { eventId: string }): React.ReactNode {
  const { data: pickupPoints = [], isLoading, isError, error } = useGetPickupPoints(eventId);
  const createPickup = useCreatePickupPoint(eventId);
  const updatePickup = useUpdatePickupPoint(eventId);
  const deletePickup = useDeletePickupPoint(eventId);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<PickupFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PickupFormState>(EMPTY_FORM);

  const openAddForm = useCallback((): void => {
    setIsAdding(true);
    setAddForm(EMPTY_FORM);
    cancelEdit();
  }, []);

  const cancelAdd = useCallback((): void => {
    setIsAdding(false);
    setAddForm(EMPTY_FORM);
  }, []);

  const handleAdd = useCallback((): void => {
    if (!addForm.name.trim()) {
      toast.error("Pickup point name is required");
      return;
    }
    createPickup.mutate(formToCreatePayload(addForm), {
      onSuccess: () => cancelAdd(),
    });
  }, [addForm, createPickup, cancelAdd]);

  const startEdit = useCallback((p: PickupPoint): void => {
    setEditingId(p.event_pickup_point_id);
    setEditForm(pickupToForm(p));
    setIsAdding(false);
  }, []);

  const cancelEdit = useCallback((): void => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const handleUpdate = useCallback((): void => {
    if (!editingId) return;
    if (!editForm.name.trim()) {
      toast.error("Pickup point name is required");
      return;
    }
    updatePickup.mutate(
      { pickupPointId: editingId, payload: formToCreatePayload(editForm) },
      { onSuccess: () => cancelEdit() },
    );
  }, [editingId, editForm, updatePickup, cancelEdit]);

  const handleDelete = useCallback(
    (id: string): void => {
      deletePickup.mutate(id);
      if (editingId === id) cancelEdit();
    },
    [deletePickup, editingId, cancelEdit],
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading pickup points…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-600">
          Failed to load pickup points{error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-4">Pickup Points</h2>

      {pickupPoints.length === 0 && (
        <p className="text-gray-500 text-sm mb-4">No pickup points yet. Add one below.</p>
      )}

      {pickupPoints.map((p) => {
        const id = p.event_pickup_point_id;
        const isEditing = editingId === id;

        if (isEditing) {
          return (
            <div key={id} className="p-4 border-2 border-green-200 bg-green-50/30 rounded-lg mb-3">
              <PickupFormFields form={editForm} onChange={setEditForm} />
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updatePickup.isPending}
                  className={cn(
                    "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {updatePickup.isPending ? "Saving…" : "Save"}
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
          <ItemRow key={id} onDelete={() => handleDelete(id)} onEdit={() => startEdit(p)}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium">{p.name}</span>
              {p.price != null && (
                <span className="text-sm text-green-700">₹{p.price}</span>
              )}
              {p.arrival_time && (
                <span className="text-sm text-gray-500">
                  Arr: {new Date(p.arrival_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              {p.departure_time && (
                <span className="text-sm text-gray-500">
                  Dep: {new Date(p.departure_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  p.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {p.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </ItemRow>
        );
      })}

      {isAdding ? (
        <div className="mt-4 p-4 border-2 border-green-200 bg-green-50/30 rounded-lg">
          <PickupFormFields form={addForm} onChange={setAddForm} />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={createPickup.isPending}
              className={cn(
                "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {createPickup.isPending ? "Saving…" : "Save"}
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
          <Plus className="w-4 h-4" /> Add Pickup Point
        </button>
      )}
    </div>
  );
}

function PickupFormFields({
  form,
  onChange,
}: {
  form: PickupFormState;
  onChange: (next: PickupFormState) => void;
}): React.ReactNode {
  const set = <K extends keyof PickupFormState>(key: K, value: PickupFormState[K]): void => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <label className={LABEL_CLS}>Name *</label>
        <input
          placeholder="e.g. HSR Layout"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Google Maps Link</label>
        <input
          placeholder="https://maps.google.com/..."
          value={form.google_map_link}
          onChange={(e) => set("google_map_link", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Arrival Time</label>
        <input
          type="datetime-local"
          value={form.arrival_time}
          onChange={(e) => set("arrival_time", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Departure Time</label>
        <input
          type="datetime-local"
          value={form.departure_time}
          onChange={(e) => set("departure_time", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Price (₹)</label>
        <input
          type="number"
          placeholder="0"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Pickup Point Order</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => set("sort_order", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          id="is_active"
          checked={form.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Active
        </label>
      </div>
    </div>
  );
}

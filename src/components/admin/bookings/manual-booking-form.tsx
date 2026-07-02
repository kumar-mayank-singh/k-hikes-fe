"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ManualBookingFormProps } from "./types";

export function ManualBookingForm({
  events,
  createForm,
  createBatchesQuery,
  createPickupPointsQuery,
  createPriceOptionsQuery,
  onCreateSubmit,
  createBooking,
  onClose,
  className,
}: ManualBookingFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = createForm;

  const createBatches = createBatchesQuery.data ?? [];
  const createPickupPoints = createPickupPointsQuery.data ?? [];
  const createPriceOptions = createPriceOptionsQuery.data ?? [];
  const activePickupPoints = createPickupPoints.filter((p) => p.is_active);
  const activePriceOptions = createPriceOptions.filter((o) => o.is_active);
  const selectedEventId = watch("event_id");

  const batchLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const batch of createBatches) {
      const label =
        batch.nickname?.trim() ||
        (batch.start_date
          ? `${batch.start_date}${batch.end_date ? ` — ${batch.end_date}` : ""}`
          : batch.batch_id);
      map.set(batch.batch_id, label);
    }
    return map;
  }, [createBatches]);

  return (
    <form
      onSubmit={handleSubmit(onCreateSubmit)}
      className={cn(
        "mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Create manual booking
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Event *
          </label>
          <select
            {...register("event_id")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">Select event</option>
            {events.map((ev) => (
              <option key={ev.event_id} value={ev.event_id}>
                {ev.name}
              </option>
            ))}
          </select>
          {errors.event_id && (
            <p className="mt-1 text-xs text-red-600">
              {errors.event_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Departure (batch) *
          </label>
          <select
            {...register("batch_id")}
            disabled={!selectedEventId || createBatchesQuery.isLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">Select batch</option>
            {createBatches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.start_date} — {b.end_date}
                {b.nickname ? ` (${b.nickname})` : ""}
              </option>
            ))}
          </select>
          {errors.batch_id && (
            <p className="mt-1 text-xs text-red-600">
              {errors.batch_id.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Customer name *
          </label>
          <input
            {...register("customer_name")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.customer_name && (
            <p className="mt-1 text-xs text-red-600">
              {errors.customer_name.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            {...register("customer_phone")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.customer_phone && (
            <p className="mt-1 text-xs text-red-600">
              {errors.customer_phone.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("customer_email")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.customer_email && (
            <p className="mt-1 text-xs text-red-600">
              {errors.customer_email.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Attendees
          </label>
          <input
            type="number"
            min={1}
            {...register("attendees", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.attendees && (
            <p className="mt-1 text-xs text-red-600">
              {errors.attendees.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Amount paid
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            {...register("amount_paid", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          {errors.amount_paid && (
            <p className="mt-1 text-xs text-red-600">
              {errors.amount_paid.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Discount amount
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            {...register("discount_amount", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Subtotal (optional)
          </label>
          <input
            {...register("subtotal")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Total amount (optional)
          </label>
          <input
            {...register("total_amount")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            GST amount (optional)
          </label>
          <input
            {...register("gst_amount")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Pickup point (optional)
          </label>
          <select
            {...register("pickup_point_id")}
            disabled={
              !selectedEventId || createPickupPointsQuery.isLoading
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">None</option>
            {activePickupPoints.map((p) => (
              <option
                key={p.event_pickup_point_id}
                value={p.event_pickup_point_id}
              >
                {p.name}
                {p.arrival_time ? ` · ${p.arrival_time}` : ""}
              </option>
            ))}
          </select>
          {selectedEventId &&
            !createPickupPointsQuery.isLoading &&
            activePickupPoints.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No active pickup points for this event.
              </p>
            )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price option (optional)
          </label>
          <select
            {...register("price_option_id")}
            disabled={!selectedEventId || createPriceOptionsQuery.isLoading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
          >
            <option value="">None</option>
            {activePriceOptions.map((opt) => {
              const batchHint = opt.batch_id
                ? (batchLabelById.get(opt.batch_id) ?? opt.batch_id)
                : null;
              return (
                <option key={opt.id} value={opt.id}>
                  {opt.name} — ₹{opt.price.toLocaleString("en-IN")}
                  {batchHint ? ` (${batchHint})` : ""}
                </option>
              );
            })}
          </select>
          {selectedEventId &&
            !createPriceOptionsQuery.isLoading &&
            activePriceOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No active price options for this event.
              </p>
            )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={createBooking.isPending}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-2 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {createBooking.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Create
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-6 py-2"
        >
          Close
        </button>
      </div>
    </form>
  );
}

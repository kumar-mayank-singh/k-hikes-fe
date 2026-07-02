"use client";

import { Calendar, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PublicBatch, PublicEventDetail } from "@/types/bookingConstants";
import type { WizardStep } from "@/store/use-booking-wizard-store";

export function formatBatchDateTime(date: string, time: string): string {
  const dt = new Date(`${date}T${time}`);
  if (Number.isNaN(dt.getTime())) return `${date} ${time}`;
  return dt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export interface BatchPricing {
  display: number | null;
  strike: number | null;
  gstPercent: number;
  bookingPercent: number;
}

export function batchEffectivePricing(
  batch: PublicBatch | undefined,
  event: PublicEventDetail,
): BatchPricing {
  return {
    display: batch?.display_price ?? event.display_price ?? null,
    strike: batch?.strike_price ?? event.strike_price ?? null,
    gstPercent: batch?.gst_percent ?? event.gst_percent ?? 0,
    bookingPercent:
      batch?.booking_amount_percent ?? event.booking_amount_percent ?? 50,
  };
}

const STEP_LABELS = ["Contact", "Departure", "Payment"] as const;

export function StepIndicator({
  step,
}: {
  step: WizardStep;
}): React.ReactElement {
  return (
    <ol className="flex items-center gap-2 pt-2" aria-label="Booking progress">
      {STEP_LABELS.map((label, idx) => {
        const active = step === idx;
        const done = step > idx;
        return (
          <li
            key={label}
            className="flex items-center gap-2 flex-1"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                done && "bg-emerald-600 text-white",
                active && "bg-emerald-700 text-white ring-4 ring-emerald-100",
                !done && !active && "bg-stone-200 text-stone-500",
              )}
            >
              {idx + 1}
            </span>
            <span
              className={cn(
                "text-xs font-medium tracking-wide",
                active || done ? "text-stone-900" : "text-stone-400",
              )}
            >
              {label}
            </span>
            {idx < STEP_LABELS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  done ? "bg-emerald-400" : "bg-stone-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function StepField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function DepartureCard({
  batch,
  selected,
  onSelect,
}: {
  batch: PublicBatch;
  selected: boolean;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "p-3 rounded-xl border text-left transition-all",
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
          : "border-stone-200 hover:border-emerald-300 bg-white",
      )}
    >
      {batch.nickname?.trim() && (
        <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 mb-1">
          {batch.nickname}
        </div>
      )}
      <div className="text-xs font-medium text-stone-800 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {formatBatchDateTime(batch.start_date, batch.start_time)}
      </div>
      <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
        <Clock className="w-3 h-3 shrink-0" />
        until {formatBatchDateTime(batch.end_date, batch.end_time)}
      </div>
      {batch.display_price != null && (
        <div className="mt-2 flex items-baseline gap-1.5">
          {batch.strike_price != null && (
            <span className="text-stone-400 line-through text-[11px]">
              ₹{batch.strike_price.toLocaleString()}
            </span>
          )}
          <span className="text-emerald-700 font-bold text-sm">
            ₹{batch.display_price.toLocaleString()}
          </span>
        </div>
      )}
    </button>
  );
}

export function RadioRow({
  selected,
  label,
  trailing,
  onSelect,
  disabled = false,
}: {
  selected: boolean;
  label: string;
  trailing: string;
  onSelect: () => void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
        selected
          ? "border-emerald-500 bg-emerald-50 shadow-sm"
          : "border-stone-200 hover:border-emerald-300",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            selected ? "border-emerald-600" : "border-stone-300",
          )}
        >
          {selected && (
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          )}
        </span>
        <span className="font-medium text-sm">{label}</span>
      </span>
      <span className="font-bold text-emerald-700 text-sm">{trailing}</span>
    </button>
  );
}

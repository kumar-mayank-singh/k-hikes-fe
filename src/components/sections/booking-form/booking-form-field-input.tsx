"use client";

import { cn } from "@/lib/utils";
import type { EventFormField } from "@/types/eventSubConstants";

interface BookingFormFieldInputProps {
  field: EventFormField;
  personIdx: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BookingFormFieldInput({
  field,
  personIdx,
  value,
  onChange,
  error,
}: BookingFormFieldInputProps): React.ReactElement {
  const inputCls = cn(
    "w-full px-3 py-2.5 border rounded-xl",
    error ? "border-rose-400" : "border-stone-300",
  );
  const id = `person-${personIdx}-field-${field.form_field_id}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-stone-700 mb-1"
      >
        {field.label}
        {field.is_required && <span className="text-rose-500"> *</span>}
      </label>
      {field.field_type === "choice" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">Select {field.label}</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={
            field.field_type === "number"
              ? "number"
              : field.field_type === "date"
                ? "date"
                : "text"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

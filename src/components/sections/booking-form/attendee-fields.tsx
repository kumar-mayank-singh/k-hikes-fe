"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPickupOptionLabel } from "@/lib/booking/post-booking-form";
import type { PostBookingFormInput } from "@/lib/validation/schema";
import type { EventFormField, PickupPoint } from "@/types/eventSubConstants";

import { BookingFormFieldInput } from "./booking-form-field-input";

interface AttendeeFieldsProps {
  form: UseFormReturn<PostBookingFormInput>;
  personIdx: number;
  pickupPoints: PickupPoint[];
  fields: EventFormField[];
  customFieldErrors: Record<string, string>;
  onClearCustomFieldError: (key: string) => void;
}

export function AttendeeFields({
  form,
  personIdx,
  pickupPoints,
  fields,
  customFieldErrors,
  onClearCustomFieldError,
}: AttendeeFieldsProps): React.ReactElement {
  const hasCustomFields = fields.length > 0;

  const handleCustomFieldChange = (fieldId: string, value: string): void => {
    const current = form.getValues("people");
    const next = [...current];
    next[personIdx] = {
      ...next[personIdx],
      form_responses: {
        ...next[personIdx].form_responses,
        [fieldId]: value,
      },
    };
    form.setValue("people", next, { shouldDirty: true });
    onClearCustomFieldError(
      `people.${personIdx}.form_responses.${fieldId}`,
    );
  };

  return (
    <section className="space-y-4 rounded-xl bg-stone-50 p-4 border border-stone-100">
      <h5 className="text-sm font-semibold text-stone-800">
        Attendee {personIdx + 1}
        {personIdx === 0 ? (
          <span className="font-normal text-stone-500"> (primary)</span>
        ) : null}
      </h5>

      <FieldGroup className="gap-4">
        <Controller
          name={`people.${personIdx}.name`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`person-${personIdx}-name`}>
                Full name
              </FieldLabel>
              <Input
                {...field}
                id={`person-${personIdx}-name`}
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name={`people.${personIdx}.phone`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`person-${personIdx}-phone`}>
                Phone
              </FieldLabel>
              <Input
                {...field}
                id={`person-${personIdx}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name={`people.${personIdx}.email`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`person-${personIdx}-email`}>
                Email (optional)
              </FieldLabel>
              <Input
                {...field}
                id={`person-${personIdx}-email`}
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        {pickupPoints.length > 0 ? (
          <Controller
            name={`people.${personIdx}.pickup_point_id`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`person-${personIdx}-pickup`}>
                  Pickup point (optional)
                </FieldLabel>
                <select
                  id={`person-${personIdx}-pickup`}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    "w-full px-3 py-2.5 border border-stone-300 rounded-xl bg-white text-sm",
                    fieldState.invalid && "border-rose-400",
                  )}
                >
                  <option value="">No pickup</option>
                  {pickupPoints.map((p) => (
                    <option
                      key={p.event_pickup_point_id}
                      value={p.event_pickup_point_id}
                    >
                      {formatPickupOptionLabel(p)}
                    </option>
                  ))}
                </select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : null}
      </FieldGroup>

      {hasCustomFields ? (
        <div className="space-y-3 pt-2 border-t border-stone-200">
          {fields.map((formField) => (
            <BookingFormFieldInput
              key={`${personIdx}-${formField.form_field_id}`}
              field={formField}
              personIdx={personIdx}
              value={
                form.watch("people")[personIdx]?.form_responses[
                  formField.form_field_id
                ] ?? ""
              }
              onChange={(v) =>
                handleCustomFieldChange(formField.form_field_id, v)
              }
              error={
                customFieldErrors[
                  `people.${personIdx}.form_responses.${formField.form_field_id}`
                ]
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

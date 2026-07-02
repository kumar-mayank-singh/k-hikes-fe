"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useGetPublicBookingForm,
  useGetPublicEventPickupPoints,
  useSubmitPublicBookingFormMutation,
} from "@/hooks/api/publicAPIs";
import {
  buildDefaultPeople,
  toSubmitPayload,
  validateRequiredFormFields,
  type PrimaryContact,
} from "@/lib/booking/post-booking-form";
import {
  postBookingFormSchema,
  type PostBookingFormInput,
} from "@/lib/validation/schema";

import { AttendeeFields } from "./attendee-fields";

interface EventPostBookingFormProps {
  /** Optional: when absent it is resolved from the fetched booking form. */
  eventId?: string;
  bookingId: string;
  attendees?: number;
  formToken?: string;
  primaryContact?: PrimaryContact;
  defaultPickupPointId?: string;
}

export function EventPostBookingForm({
  eventId,
  bookingId,
  attendees = 1,
  formToken,
  primaryContact,
  defaultPickupPointId,
}: EventPostBookingFormProps): React.ReactElement {
  const { data, isLoading, isError, error } = useGetPublicBookingForm(
    bookingId,
    formToken,
  );
  const resolvedEventId = eventId ?? data?.event_id ?? undefined;
  const { data: pickupPoints = [] } =
    useGetPublicEventPickupPoints(resolvedEventId);
  const submit = useSubmitPublicBookingFormMutation(bookingId, {
    method: data?.is_submitted ? "PATCH" : "POST",
    formToken,
  });

  const attendeeCount = Math.max(1, data?.attendees ?? attendees);

  const defaultValues = useMemo(
    () => ({
      people: buildDefaultPeople(
        attendeeCount,
        pickupPoints,
        primaryContact,
        data?.people,
        defaultPickupPointId,
      ),
    }),
    [
      attendeeCount,
      pickupPoints,
      primaryContact,
      data?.people,
      defaultPickupPointId,
    ],
  );

  const [customFieldErrors, setCustomFieldErrors] = useState<
    Record<string, string>
  >({});

  const form = useForm<PostBookingFormInput>({
    resolver: zodResolver(postBookingFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  if (isLoading) {
    return <div className="text-stone-500 text-sm">Loading form…</div>;
  }
  if (isError) {
    return (
      <div className="text-rose-600 text-sm">
        {error instanceof Error ? error.message : "Failed to load form"}
      </div>
    );
  }
  if (submit.isSuccess || data?.is_submitted) {
    return (
      <div className="flex items-start gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl text-sm font-medium">
        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Attendee details submitted successfully.</span>
      </div>
    );
  }

  const fields = data?.fields ?? [];
  const hasCustomFields = fields.length > 0;

  const clearCustomFieldError = (key: string): void => {
    setCustomFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onSubmit = (values: PostBookingFormInput): void => {
    if (hasCustomFields) {
      const nextErrors = validateRequiredFormFields(fields, values.people);
      setCustomFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }
    setCustomFieldErrors({});

    submit.mutate({ people: toSubmitPayload(values.people) });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      <div>
        <h4 className="font-bold text-stone-900">Attendee details</h4>
        <p className="text-stone-500 text-sm mt-1">
          Add details for each person on this booking
          {hasCustomFields ? ", including any custom fields below." : "."}
        </p>
      </div>

      {form.watch("people").map((_, personIdx) => (
        <AttendeeFields
          key={personIdx}
          form={form}
          personIdx={personIdx}
          pickupPoints={pickupPoints}
          fields={fields}
          customFieldErrors={customFieldErrors}
          onClearCustomFieldError={clearCustomFieldError}
        />
      ))}

      <Button
        type="submit"
        disabled={submit.isPending}
        className="w-full h-12 bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/25"
      >
        {submit.isPending ? "Submitting…" : "Submit attendee details"}
      </Button>
      {submit.isError && (
        <p className="text-rose-600 text-xs" role="alert">
          {submit.error instanceof Error
            ? submit.error.message
            : "Failed to submit"}
        </p>
      )}
    </form>
  );
}

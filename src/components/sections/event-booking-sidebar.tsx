"use client";

import { Calendar } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EventBookingWizard } from "@/components/sections/booking-wizard/event-booking-wizard";
import { useGetPublicEventBatches } from "@/hooks/api/publicAPIs";
import {
  bookingContactSchema,
  type BookingContactInput,
} from "@/lib/validation/schema";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";
import type { PublicEventDetail } from "@/types/bookingConstants";

interface EventBookingSidebarProps {
  event: PublicEventDetail;
}

const EMPTY_CONTACT: BookingContactInput = {
  name: "",
  email: "",
  phone: "",
};

export function EventBookingSidebar({
  event,
}: EventBookingSidebarProps): React.ReactElement {
  const { data: batches = [] } = useGetPublicEventBatches(event.event_id);
  const openWizard = useBookingWizardStore((s) => s.open);

  const form = useForm<BookingContactInput>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: EMPTY_CONTACT,
  });

  const bookableCount = batches.filter(
    (b) => b.is_bookable && !b.is_sold_out,
  ).length;

  const onSubmit = (data: BookingContactInput): void => {
    openWizard({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    });
  };

  if (bookableCount === 0) {
    return (
      <>
        <div className="text-center py-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
          <Calendar className="w-5 h-5 mx-auto mb-1" />
          <p className="font-medium text-sm">Dates coming soon</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Check back for upcoming departures
          </p>
        </div>
        <EventBookingWizard event={event} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Book this trek
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Share your details — we&apos;ll take it from here.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sidebar-name">Full name</FieldLabel>
                  <Input
                    {...field}
                    id="sidebar-name"
                    placeholder="Your full name"
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sidebar-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="sidebar-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sidebar-phone">Phone</FieldLabel>
                  <Input
                    {...field}
                    id="sidebar-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+91 98XXXXXXXX"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/25"
          >
            Book now
          </Button>
        </form>
      </div>

      <EventBookingWizard event={event} />
    </>
  );
}

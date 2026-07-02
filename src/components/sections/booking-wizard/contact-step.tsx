"use client";

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
import {
  bookingContactSchema,
  type BookingContactInput,
} from "@/lib/validation/schema";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";

export function ContactStep(): React.ReactElement {
  const contact = useBookingWizardStore((s) => s.contact);
  const setContact = useBookingWizardStore((s) => s.setContact);
  const next = useBookingWizardStore((s) => s.next);
  const close = useBookingWizardStore((s) => s.close);

  const form = useForm<BookingContactInput>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: contact,
  });

  const onSubmit = (values: BookingContactInput): void => {
    setContact({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
    next();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="wizard-name">Full name</FieldLabel>
              <Input
                {...field}
                id="wizard-name"
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
              <FieldLabel htmlFor="wizard-email">Email</FieldLabel>
              <Input
                {...field}
                id="wizard-email"
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
              <FieldLabel htmlFor="wizard-phone">Phone number</FieldLabel>
              <Input
                {...field}
                id="wizard-phone"
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

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-emerald-700 text-white hover:bg-emerald-800"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

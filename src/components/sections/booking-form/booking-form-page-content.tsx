"use client";

import { useParams, useSearchParams } from "next/navigation";

import { ConfirmationShell } from "@/components/sections/booking-confirmation/confirmation-shell";

import { EventPostBookingForm } from "./event-post-booking-form";

export function BookingFormPageContent(): React.ReactElement {
  const params = useParams();
  const searchParams = useSearchParams();

  const bookingId = (params.booking_id as string)?.trim() ?? "";
  const formToken = searchParams.get("token")?.trim() ?? "";

  if (!bookingId) {
    return (
      <ConfirmationShell>
        <p className="text-stone-600 text-sm">
          Missing booking reference. Please use the link from your booking
          confirmation.
        </p>
      </ConfirmationShell>
    );
  }

  return (
    <ConfirmationShell>
      <EventPostBookingForm
        bookingId={bookingId}
        formToken={formToken || undefined}
      />
    </ConfirmationShell>
  );
}

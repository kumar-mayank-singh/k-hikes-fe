"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { EventPostBookingForm } from "@/components/sections/booking-form/event-post-booking-form";
import type { PrimaryContact } from "@/lib/booking/post-booking-form";
import { useGetPublicEvent } from "@/hooks/api/publicAPIs";

import { BookingSuccessHeader } from "./booking-success-header";
import { ConfirmationShell } from "./confirmation-shell";

export function BookingConfirmationContent(): React.ReactElement {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.event_id as string;

  const bookingId = searchParams.get("booking_id")?.trim() ?? "";
  const bookingNumber = searchParams.get("booking_number")?.trim() ?? "";
  const formToken = searchParams.get("token")?.trim() ?? "";
  const attendees = Math.max(
    1,
    parseInt(searchParams.get("attendees") ?? "1", 10) || 1,
  );
  const contactName = searchParams.get("contact_name")?.trim() ?? "";
  const contactPhone = searchParams.get("contact_phone")?.trim() ?? "";
  const contactEmail = searchParams.get("contact_email")?.trim() ?? "";
  const pickupPointId = searchParams.get("pickup_point_id")?.trim() ?? "";

  const { data: event, isLoading } = useGetPublicEvent(eventId);

  if (!bookingId) {
    return (
      <ConfirmationShell eventName={event?.name}>
        <p className="text-stone-600 text-sm">
          Missing booking reference. Return to the event page and try again.
        </p>
        <Link
          href={`/events/${eventId}`}
          className="inline-block mt-6 text-emerald-700 font-medium hover:underline"
        >
          Back to event
        </Link>
      </ConfirmationShell>
    );
  }

  const primaryContact: PrimaryContact | undefined =
    contactName || contactPhone || contactEmail
      ? { name: contactName, phone: contactPhone, email: contactEmail }
      : undefined;

  return (
    <ConfirmationShell eventName={isLoading ? undefined : event?.name}>
      <BookingSuccessHeader bookingNumber={bookingNumber || undefined} />

      <div className="border-t border-stone-200 pt-8">
        <EventPostBookingForm
          eventId={eventId}
          bookingId={bookingId}
          attendees={attendees}
          formToken={formToken || undefined}
          primaryContact={primaryContact}
          defaultPickupPointId={pickupPointId || undefined}
        />
      </div>

      <Link
        href={`/events/${eventId}`}
        className="mt-8 block w-full text-center py-3 border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 transition-colors"
      >
        Back to {event?.name ?? "event"}
      </Link>
    </ConfirmationShell>
  );
}

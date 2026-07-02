"use client";

import type { ReactElement } from "react";

import type { AdminBooking } from "@/types/bookingConstants";

interface BookingDetailOverviewProps {
  booking: AdminBooking;
}

export function BookingDetailOverview({
  booking,
}: BookingDetailOverviewProps): ReactElement {
  const batchLabel =
    booking.batch?.nickname?.trim() ||
    (booking.batch?.start_date
      ? `${booking.batch.start_date}${
          booking.batch.end_date ? ` — ${booking.batch.end_date}` : ""
        }`
      : null) ||
    booking.batch_id ||
    "—";

  return (
    <>
      <div className="mb-6 space-y-2 text-sm text-gray-800">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Event</span>
          <span className="text-right">{booking.event?.name ?? "—"}</span>
        </div>
        {/* Batch is Depature in the context of a booking */}
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Departure</span>
          <span className="text-right">{batchLabel}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Attendees</span>
          <span>{booking.attendees ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total</span>
          <span>₹{booking.total_amount?.toLocaleString() ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Paid</span>
          <span>₹{booking.amount_paid?.toLocaleString() ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Pending</span>
          <span>₹{booking.amount_pending?.toLocaleString() ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Source</span>
          <span>{booking.source ?? "—"}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Status</span>
          <span>{booking.status ?? "—"}</span>
        </div>
      </div>

      <div className="mb-6 border-t border-gray-100 pt-4">
        <h4 className="mb-3 font-semibold text-gray-900">Booked by</h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-right text-gray-900">
              {booking.customer_name || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Phone Number</dt>
            <dd className="text-right text-gray-900">
              {booking.customer_phone || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-right break-all text-gray-900">
              {booking.customer_email?.trim() || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}

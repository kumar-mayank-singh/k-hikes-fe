"use client";

import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UseBookingsPageReturn } from "@/hooks/useBookingsPage";

import { BookingDetailDepartureForm } from "./booking-detail-departure-form";
import { BookingDetailOverview } from "./booking-detail-overview";
import { BookingDetailParticipantsForm } from "./booking-detail-participants-form";
import type { BookingDetailDialogProps } from "./types";

type BookingDetailFooterProps = Pick<
  UseBookingsPageReturn,
  "cancelBooking" | "onCancelBooking"
> & {
  isCancelled: boolean;
  onClose: () => void;
};

function BookingDetailFooter({
  isCancelled,
  onCancelBooking,
  cancelBooking,
  onClose,
}: BookingDetailFooterProps): ReactElement {
  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
      {!isCancelled ? (
        <button
          type="button"
          onClick={onCancelBooking}
          disabled={cancelBooking.isPending}
          className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {cancelBooking.isPending ? "Cancelling…" : "Cancel booking"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-lg bg-gray-100 py-2 text-sm"
      >
        Close
      </button>
    </div>
  );
}

export function BookingDetailDialog({
  bookingId,
  onClose,
  detailQuery,
  editForm,
  detailPickupPointsQuery,
  changeDateForm,
  changeDateBatchesQuery,
  onSaveDetail,
  onChangeDateSubmit,
  onCancelBooking,
  updateBooking,
  changeDate,
  cancelBooking,
}: BookingDetailDialogProps): ReactElement {
  const booking = detailQuery.data;
  const isCancelled = booking?.status === "cancelled";

  return (
    <Dialog
      open={Boolean(bookingId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="mx-4 max-h-[85vh] overflow-y-auto">
        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : detailQuery.isError ? (
          <p className="text-sm text-red-600">
            {(detailQuery.error as Error).message}
          </p>
        ) : booking ? (
          <>
            <DialogTitle className="mb-4 text-lg font-bold text-gray-900">
              Booking {booking.booking_code}
            </DialogTitle>

            <BookingDetailOverview booking={booking} />

            <BookingDetailParticipantsForm
              booking={booking}
              editForm={editForm}
              detailPickupPointsQuery={detailPickupPointsQuery}
              updateBooking={updateBooking}
              onSaveDetail={onSaveDetail}
              isCancelled={isCancelled}
            />

            <BookingDetailDepartureForm
              changeDateForm={changeDateForm}
              changeDateBatchesQuery={changeDateBatchesQuery}
              changeDate={changeDate}
              onChangeDateSubmit={onChangeDateSubmit}
              isCancelled={isCancelled}
            />

            <BookingDetailFooter
              isCancelled={isCancelled}
              onCancelBooking={onCancelBooking}
              cancelBooking={cancelBooking}
              onClose={onClose}
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

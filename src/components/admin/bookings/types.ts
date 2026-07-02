import type { UseBookingsPageReturn } from "@/hooks/useBookingsPage";

export interface BookingEventOption {
  event_id: string;
  name: string;
}

export type ManualBookingFormProps = Pick<
  UseBookingsPageReturn,
  | "events"
  | "createForm"
  | "createBatchesQuery"
  | "createPickupPointsQuery"
  | "createPriceOptionsQuery"
  | "onCreateSubmit"
  | "createBooking"
> & {
  onClose: () => void;
  className?: string;
};

export type BookingDetailDialogProps = Pick<
  UseBookingsPageReturn,
  | "detailQuery"
  | "editForm"
  | "detailPickupPointsQuery"
  | "changeDateForm"
  | "changeDateBatchesQuery"
  | "onSaveDetail"
  | "onChangeDateSubmit"
  | "onCancelBooking"
  | "updateBooking"
  | "changeDate"
  | "cancelBooking"
> & {
  bookingId: string;
  onClose: () => void;
};

export interface BookingConfirmationParams {
  eventId: string;
  bookingId: string;
  bookingNumber?: string;
  attendees: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  pickupPointId?: string;
  /** Token required to read/submit the attendee form on the confirmation page. */
  formToken?: string;
}

export function buildBookingConfirmationUrl(
  params: BookingConfirmationParams,
): string {
  const search = new URLSearchParams({
    booking_id: params.bookingId,
    attendees: String(params.attendees),
  });
  if (params.bookingNumber) {
    search.set("booking_number", params.bookingNumber);
  }
  if (params.contactName?.trim()) {
    search.set("contact_name", params.contactName.trim());
  }
  if (params.contactPhone?.trim()) {
    search.set("contact_phone", params.contactPhone.trim());
  }
  if (params.contactEmail?.trim()) {
    search.set("contact_email", params.contactEmail.trim());
  }
  if (params.pickupPointId?.trim()) {
    search.set("pickup_point_id", params.pickupPointId.trim());
  }
  if (params.formToken?.trim()) {
    search.set("token", params.formToken.trim());
  }
  return `/events/${params.eventId}/booking/confirmation?${search.toString()}`;
}

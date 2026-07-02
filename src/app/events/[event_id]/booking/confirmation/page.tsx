import { Suspense } from "react";

import { BookingConfirmationContent } from "@/components/sections/booking-confirmation/booking-confirmation-content";

export default function EventBookingConfirmationPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-stone-500">
          Loading…
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}

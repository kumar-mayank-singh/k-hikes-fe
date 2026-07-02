import { Suspense } from "react";

import { BookingFormPageContent } from "@/components/sections/booking-form/booking-form-page-content";

export default function BookingFormPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-stone-500">
          Loading…
        </div>
      }
    >
      <BookingFormPageContent />
    </Suspense>
  );
}

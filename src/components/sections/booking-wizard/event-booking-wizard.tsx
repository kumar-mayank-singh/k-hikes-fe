"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";
import type { PublicEventDetail } from "@/types/bookingConstants";

import { BookingPaymentOverlay } from "./booking-payment-overlay";
import { DepartureStep } from "./departure-step";
import { PaymentStep } from "./payment-step";
import { StepIndicator } from "./wizard-shared";

interface EventBookingWizardProps {
  event: PublicEventDetail;
}

export function EventBookingWizard({
  event,
}: EventBookingWizardProps): React.ReactElement {
  const isOpen = useBookingWizardStore((s) => s.isOpen);
  const step = useBookingWizardStore((s) => s.step);
  const close = useBookingWizardStore((s) => s.close);
  const paymentPhase = useBookingWizardStore((s) => s.paymentPhase);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {event.name}</DialogTitle>
            <DialogDescription>Complete your booking.</DialogDescription>
          </DialogHeader>

          <StepIndicator step={step} />

          <div className="pt-4">
            {step === 0 && <DepartureStep event={event} />}
            {step === 1 && <PaymentStep event={event} />}
          </div>
        </DialogContent>
      </Dialog>
      {paymentPhase !== "idle" ? <BookingPaymentOverlay /> : null}
    </>
  );
}

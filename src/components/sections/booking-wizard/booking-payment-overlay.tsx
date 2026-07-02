"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useConfirmBookingMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} from "@/hooks/api/publicAPIs";
import { buildBookingConfirmationUrl } from "@/lib/booking/confirmation-navigation";
import { openRazorpayCheckout } from "@/lib/razorpay/checkout";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";
import type { PaymentPhase } from "@/store/use-booking-wizard-store";

const PHASE_COPY: Record<Exclude<PaymentPhase, "idle">, string> = {
  "creating-order": "Opening secure payment…",
  "razorpay-open": "Complete payment in the secure window",
  verifying: "Verifying your payment…",
  confirming: "Confirming your booking…",
  redirecting: "Redirecting to your booking…",
};

/**
 * Lives next to the booking wizard dialog and survives its close so the
 * payment flow can run without competing with Radix Dialog's focus trap.
 *
 * It listens to `paymentPhase` on the wizard store: when the wizard
 * transitions to `creating-order`, the overlay drives the rest of the
 * flow (Razorpay or direct confirm), surfaces phase-appropriate copy,
 * and navigates to the confirmation page on success. Failures and
 * dismissals fall back to a toast.
 */
export function BookingPaymentOverlay(): React.ReactElement | null {
  const router = useRouter();
  const phase = useBookingWizardStore((s) => s.paymentPhase);
  const request = useBookingWizardStore((s) => s.paymentRequest);
  const setPhase = useBookingWizardStore((s) => s.setPaymentPhase);
  const endPayment = useBookingWizardStore((s) => s.endPayment);

  const createPaymentOrder = useCreatePaymentOrderMutation();
  const verifyPayment = useVerifyPaymentMutation();
  const confirm = useConfirmBookingMutation();

  // Guard against React strict-mode / re-entrancy double runs.
  const runningRef = useRef(false);

  useEffect(() => {
    if (!request) return;
    if (phase !== "creating-order") return;
    if (runningRef.current) return;
    runningRef.current = true;

    const run = async (): Promise<void> => {
      try {
        // The attendee form on the confirmation page is gated behind a
        // `form_token` returned by confirm/verify. Fall back to the
        // initiate token if the server omits one.
        let formAccessToken = request.formToken;

        if (request.razorpayEnabled) {
          const order = await createPaymentOrder.mutateAsync({
            bookingId: request.bookingId,
            form_token: request.formToken,
            payment_type: request.paymentType,
          });

          setPhase("razorpay-open");

          await openRazorpayCheckout({
            order,
            bookingLabel: `Booking ${request.bookingNumber || request.bookingId}`,
            onSuccess: async (response) => {
              setPhase("verifying");
              const verified = await verifyPayment.mutateAsync({
                bookingId: request.bookingId,
                form_token: request.formToken,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verified.form_token) {
                formAccessToken = verified.form_token;
              }
            },
          });
        } else {
          setPhase("confirming");
          const confirmed = await confirm.mutateAsync({
            bookingId: request.bookingId,
            form_token: request.formToken,
            payment_type: request.paymentType,
          });
          if (confirmed.form_token) {
            formAccessToken = confirmed.form_token;
          }
        }

        setPhase("redirecting");
        router.push(
          buildBookingConfirmationUrl({
            eventId: request.eventId,
            bookingId: request.bookingId,
            bookingNumber: request.bookingNumber,
            attendees: request.attendees,
            contactName: request.contactName,
            contactPhone: request.contactPhone,
            contactEmail: request.contactEmail,
            pickupPointId: request.pickupPointId || undefined,
            formToken: formAccessToken || undefined,
          }),
        );
        // Tear down the overlay once navigation has been kicked off so it
        // can't get stuck on "Redirecting…" if the destination route
        // mounts before the source page unmounts (or vice versa).
        endPayment();
      } catch (err) {
        // The individual mutations already surface their own toasts via
        // their `onError` handlers, so only show a fallback when the
        // failure didn't originate from a mutation (e.g. Razorpay
        // cancellation, script load failure).
        const message =
          err instanceof Error && err.message
            ? err.message
            : "Payment failed. Please try again.";
        const isMutationError =
          createPaymentOrder.isError ||
          verifyPayment.isError ||
          confirm.isError;
        if (!isMutationError) {
          toast.error(message);
        }
        endPayment();
      } finally {
        runningRef.current = false;
      }
    };

    void run();
  }, [
    phase,
    request,
    createPaymentOrder,
    verifyPayment,
    confirm,
    router,
    setPhase,
    endPayment,
  ]);

  if (phase === "idle" || !request) return null;

  const copy = PHASE_COPY[phase];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl px-8 py-7 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4 text-center">
        <div
          aria-hidden
          className="h-10 w-10 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin"
        />
        <p className="text-sm font-semibold text-stone-900">{copy}</p>
        <p className="text-xs text-stone-500">
          Please don&apos;t close or refresh this page.
        </p>
      </div>
    </div>
  );
}

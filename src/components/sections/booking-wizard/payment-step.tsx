"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetPublicEventBatches,
  useInitiateBookingMutation,
  useValidatePublicCouponMutation,
} from "@/hooks/api/publicAPIs";
import { cn } from "@/lib/utils";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";
import type {
  InitiateBookingResponse,
  PaymentType,
  PublicAddOn,
  PublicBatch,
  PublicEventDetail,
  PublicPriceOption,
} from "@/types/bookingConstants";

import {
  batchEffectivePricing,
  RadioRow,
  StepField,
} from "./wizard-shared";

function formatInrAmount(value: number): string {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface PaymentStepProps {
  event: PublicEventDetail;
}

interface BookingBillDetailsPanelProps {
  data: InitiateBookingResponse;
  paymentType: PaymentType;
  razorpayEnabled: boolean;
}

function BookingBillDetailsPanel({
  data,
  paymentType,
  razorpayEnabled,
}: BookingBillDetailsPanelProps): React.ReactElement {
  const payNow = data.amount_to_be_paid ?? data.total_amount;
  const remaining = Math.max(0, data.total_amount - payNow);
  const isPartial = paymentType === "partial" && remaining > 0;

  return (
    <div className="space-y-3 pt-1">
      <dl className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Subtotal</dt>
          <dd className="font-medium text-stone-900 tabular-nums">
            {formatInrAmount(data.subtotal)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">GST</dt>
          <dd className="font-medium text-stone-900 tabular-nums">
            {formatInrAmount(data.gst_amount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Discount</dt>
          <dd className="font-medium text-stone-900 tabular-nums">
            {data.discount_amount > 0
              ? `−${formatInrAmount(data.discount_amount)}`
              : formatInrAmount(0)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-stone-200 pt-2 mt-2 text-stone-900">
          <dt>Total</dt>
          <dd className="tabular-nums font-medium">
            {formatInrAmount(data.total_amount)}
          </dd>
        </div>
        {isPartial && (
          <div className="flex justify-between gap-4 text-stone-600">
            <dt>Remaining (collected before the trip)</dt>
            <dd className="tabular-nums">{formatInrAmount(remaining)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-stone-200 pt-2 mt-2 text-base font-semibold text-emerald-700">
          <dt>Pay now</dt>
          <dd className="tabular-nums">{formatInrAmount(payNow)}</dd>
        </div>
      </dl>
      {isPartial ? (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          You only need to pay <strong>{formatInrAmount(payNow)}</strong> now
          to confirm your booking. The remaining{" "}
          <strong>{formatInrAmount(remaining)}</strong> will be collected
          before the trip.
        </p>
      ) : null}
      <p className="text-xs text-stone-500">
        {razorpayEnabled
          ? "You will complete payment securely via Razorpay."
          : "Direct confirm is enabled on this server (no Razorpay)."}
      </p>
    </div>
  );
}

function bookingDiscountFingerprint(input: {
  batchId: string;
  attendees: number;
  priceOptionId: string;
  grossSubtotal: number;
  couponCode: string;
  addOnIds: string[];
}): string {
  const sortedAddOns = [...input.addOnIds].sort().join(",");
  return `${input.batchId}|${input.attendees}|${input.priceOptionId}|${input.grossSubtotal}|${input.couponCode.trim().toLowerCase()}|${sortedAddOns}`;
}

export function PaymentStep({
  event,
}: PaymentStepProps): React.ReactElement {
  const batchId = useBookingWizardStore((s) => s.batchId);
  const pickupPointId = useBookingWizardStore((s) => s.pickupPointId);
  const priceOptionId = useBookingWizardStore((s) => s.priceOptionId);
  const addOnIds = useBookingWizardStore((s) => s.addOnIds);
  const attendees = useBookingWizardStore((s) => s.attendees);
  const couponCode = useBookingWizardStore((s) => s.couponCode);
  const paymentType = useBookingWizardStore((s) => s.paymentType);
  const bookingAmountPercent = useBookingWizardStore(
    (s) => s.bookingAmountPercent,
  );
  const contact = useBookingWizardStore((s) => s.contact);
  const update = useBookingWizardStore((s) => s.update);
  const prev = useBookingWizardStore((s) => s.prev);
  const startPayment = useBookingWizardStore((s) => s.startPayment);

  const { data: batches = [] } = useGetPublicEventBatches(event.event_id);

  const initiate = useInitiateBookingMutation();
  const validateCoupon = useValidatePublicCouponMutation();
  const [showBillDetails, setShowBillDetails] = useState(false);

  const selectedBatch = useMemo<PublicBatch | undefined>(
    () => batches.find((b) => b.batch_id === batchId),
    [batches, batchId],
  );

  const priceOptions = useMemo<PublicPriceOption[]>(
    () => (selectedBatch?.price_options ?? []).filter((p) => p.is_active),
    [selectedBatch],
  );

  const addOns = useMemo<PublicAddOn[]>(() => event.add_ons ?? [], [event]);

  useEffect(() => {
    if (
      priceOptionId &&
      (priceOptions.length === 0 ||
        !priceOptions.some((p) => p.event_price_option_id === priceOptionId))
    ) {
      update({ priceOptionId: "" });
    }
  }, [priceOptions, priceOptionId, update]);

  const selectedPriceOption = useMemo<PublicPriceOption | undefined>(
    () =>
      priceOptions.find((p) => p.event_price_option_id === priceOptionId),
    [priceOptions, priceOptionId],
  );

  const pricing = batchEffectivePricing(selectedBatch, event);

  const couponAllowed = selectedPriceOption
    ? selectedPriceOption.eligible_for_discounts
    : true;

  // Clear any applied discount when switching to a non-discountable price option.
  useEffect(() => {
    if (!couponAllowed) {
      const s = useBookingWizardStore.getState();
      if (s.couponCode || s.discountAmount || s.discountCartFingerprint) {
        update({
          couponCode: "",
          discountAmount: 0,
          discountCartFingerprint: null,
        });
        validateCoupon.reset();
      }
    }
  }, [couponAllowed, update, validateCoupon]);

  const grossSubtotal = useMemo(() => {
    if (selectedPriceOption) return selectedPriceOption.price * attendees;
    const base = pricing.display ?? 0;
    return base * attendees;
  }, [selectedPriceOption, pricing.display, attendees]);

  const addOnsTotal = useMemo(() => {
    if (addOns.length === 0 || addOnIds.length === 0) return 0;
    return addOns
      .filter((a) => addOnIds.includes(a.event_add_on_id))
      .reduce((sum, a) => sum + a.price, 0);
  }, [addOns, addOnIds]);

  const fingerprint = useMemo(
    () =>
      bookingDiscountFingerprint({
        batchId,
        attendees,
        priceOptionId,
        grossSubtotal,
        couponCode,
        addOnIds,
      }),
    [batchId, attendees, priceOptionId, grossSubtotal, couponCode, addOnIds],
  );

  useEffect(() => {
    validateCoupon.reset();
    initiate.reset();
    const s = useBookingWizardStore.getState();
    if (
      s.discountCartFingerprint != null &&
      s.discountCartFingerprint !== fingerprint
    ) {
      update({ discountAmount: 0, discountCartFingerprint: null });
    }
  }, [fingerprint, validateCoupon.reset, initiate.reset, update]);

  useEffect(() => {
    return () => {
      initiate.reset();
    };
  }, [initiate.reset]);

  const maxAttendees = event.slots ?? 50;
  const showConfirmPay = initiate.isSuccess && Boolean(initiate.data);

  useEffect(() => {
    if (!showConfirmPay) {
      setShowBillDetails(false);
    }
  }, [showConfirmPay]);
  const canBookNow =
    Boolean(batchId) &&
    attendees >= 1 &&
    (priceOptions.length === 0 || Boolean(priceOptionId)) &&
    !initiate.isPending &&
    !showConfirmPay;

  const toggleAddOn = (id: string): void => {
    if (showConfirmPay || initiate.isPending) return;
    const next = addOnIds.includes(id)
      ? addOnIds.filter((existing) => existing !== id)
      : [...addOnIds, id];
    update({ addOnIds: next });
  };

  const handleApplyCoupon = (): void => {
    const code = couponCode.trim();
    if (!code || !batchId || !couponAllowed) return;
    validateCoupon.reset();
    const fp = bookingDiscountFingerprint({
      batchId,
      attendees,
      priceOptionId,
      grossSubtotal,
      couponCode: code,
      addOnIds,
    });
    void validateCoupon
      .mutateAsync({
        attendees,
        batch_id: batchId.trim() || null,
        code,
        event_id: event.event_id,
        subtotal: grossSubtotal,
      })
      .then((data) => {
        const raw =
          typeof data.discount_amount === "number"
            ? Math.max(0, data.discount_amount)
            : 0;
        const capped = Math.min(raw, grossSubtotal);
        update({ discountAmount: capped, discountCartFingerprint: fp });
      })
      .catch(() => {
        update({ discountAmount: 0, discountCartFingerprint: null });
      });
  };

  const handleSelectBookingPercent = (percent: 50 | 100): void => {
    update({
      bookingAmountPercent: percent,
      paymentType: percent === 100 ? "full" : "partial",
    });
  };

  const handleBookNow = async (): Promise<void> => {
    await initiate.mutateAsync({
      event_id: event.event_id,
      batch_id: batchId,
      attendees,
      customer_name: contact.name,
      customer_phone: contact.phone,
      customer_email: contact.email || null,
      payment_type: paymentType,
      booking_amount_percent: bookingAmountPercent,
      add_on_ids: addOnIds.length > 0 ? addOnIds : null,
      coupon_code: couponAllowed ? couponCode.trim() || null : null,
      pickup_point_id: pickupPointId || null,
      price_option_id: priceOptionId || null,
    });
  };

  const handleConfirmPay = (): void => {
    const booking = initiate.data;
    if (!booking?.form_token) return;

    startPayment({
      eventId: event.event_id,
      bookingId: booking.booking_id,
      bookingNumber: booking.booking_number ?? "",
      formToken: booking.form_token,
      paymentType,
      amountToPay: booking.amount_to_be_paid ?? booking.total_amount,
      razorpayEnabled: booking.razorpay_enabled !== false,
      attendees,
      pickupPointId,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
    });
  };

  const razorpayEnabled = initiate.data?.razorpay_enabled !== false;

  return (
    <div className="space-y-5">
      <StepField label="Pricing">
        <p className="text-xs text-stone-500 mb-3">
          {priceOptions.length > 0
            ? "Select a ticket rate below to continue. Options are priced per person — set your attendee count below."
            : "Standard departure pricing applies, priced per person. Set your attendee count below."}
        </p>
        <div className="space-y-2">
          {priceOptions.length === 0 ? (
            <button
              type="button"
              onClick={() => update({ priceOptionId: "" })}
              disabled={showConfirmPay || initiate.isPending}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all",
                !priceOptionId
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-stone-200 hover:border-emerald-300",
                (showConfirmPay || initiate.isPending) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <div className="font-medium text-stone-900">
                    Standard pricing
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Per-person rate. Pick your own attendee count below.
                  </p>
                </div>
                <div className="text-sm font-semibold text-emerald-700 tabular-nums sm:text-right shrink-0">
                  {pricing.display != null ? (
                    <>
                      <div>{formatInrAmount(pricing.display)} / person</div>
                      <div className="text-xs font-normal text-stone-600 mt-0.5">
                        → {formatInrAmount(pricing.display * attendees)} for{" "}
                        {attendees}{" "}
                        {attendees === 1 ? "person" : "people"}
                      </div>
                    </>
                  ) : (
                    <span className="text-stone-500 font-normal text-xs">
                      Rate set at checkout
                    </span>
                  )}
                </div>
              </div>
            </button>
          ) : (
            priceOptions.map((opt) => {
              const selected = priceOptionId === opt.event_price_option_id;
              return (
                <button
                  key={opt.event_price_option_id}
                  type="button"
                  onClick={() =>
                    update({ priceOptionId: opt.event_price_option_id })
                  }
                  disabled={showConfirmPay || initiate.isPending}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all",
                    selected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-stone-200 hover:border-emerald-300",
                    (showConfirmPay || initiate.isPending) &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="font-medium text-stone-900">
                        {opt.name}
                      </div>
                      {opt.description ? (
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {opt.description}
                        </p>
                      ) : null}
                      <p className="text-xs text-stone-500">
                        {opt.eligible_for_discounts
                          ? "Coupon codes can apply (if valid)."
                          : "Coupon discounts do not apply to this option."}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-emerald-700 tabular-nums sm:text-right shrink-0">
                      <div>{formatInrAmount(opt.price)} / person</div>
                      <div className="text-xs font-normal text-stone-600 mt-0.5">
                        → {formatInrAmount(opt.price * attendees)} for{" "}
                        {attendees}{" "}
                        {attendees === 1 ? "person" : "people"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </StepField>

      {addOns.length > 0 && (
        <StepField label="Add-ons (optional)">
          <p className="text-xs text-stone-500 mb-3">
            Optional extras that get added to your booking total.
          </p>
          <div className="space-y-2">
            {addOns.map((addOn) => {
              const selected = addOnIds.includes(addOn.event_add_on_id);
              return (
                <button
                  key={addOn.event_add_on_id}
                  type="button"
                  onClick={() => toggleAddOn(addOn.event_add_on_id)}
                  disabled={showConfirmPay || initiate.isPending}
                  aria-pressed={selected}
                  className={cn(
                    "w-full text-left rounded-xl border p-3 transition-all flex items-center gap-3",
                    selected
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-stone-200 hover:border-emerald-300",
                    (showConfirmPay || initiate.isPending) &&
                      "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                      selected
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-stone-300 bg-white",
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {addOn.file_url ? (
                    <img
                      src={addOn.file_url}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover shrink-0"
                    />
                  ) : null}
                  <span className="flex-1 min-w-0 font-medium text-stone-900 text-sm">
                    {addOn.name}
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 tabular-nums shrink-0">
                    {formatInrAmount(addOn.price)}
                  </span>
                </button>
              );
            })}
          </div>
          {addOnsTotal > 0 && (
            <p className="text-xs text-stone-500 mt-2">
              {addOnIds.length} add-on{addOnIds.length === 1 ? "" : "s"}{" "}
              selected · {formatInrAmount(addOnsTotal)}
            </p>
          )}
        </StepField>
      )}

      <StepField label="Number of attendees">
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={maxAttendees}
            value={attendees}
            onChange={(e) =>
              update({
                attendees: Math.max(1, parseInt(e.target.value, 10) || 1),
              })
            }
            className="w-28 text-center"
            disabled={showConfirmPay || initiate.isPending}
          />
        </div>
      </StepField>

      <StepField label="Payment option">
        <p className="text-xs text-stone-500 mb-3">
          Choose how much of the total you would like to pay right now. The
          remainder is collected closer to the trip.
        </p>
        <div className="space-y-2">
          <RadioRow
            selected={bookingAmountPercent === 100}
            label="Pay full amount now"
            trailing="100%"
            onSelect={() => handleSelectBookingPercent(100)}
            disabled={showConfirmPay || initiate.isPending}
          />
          <RadioRow
            selected={bookingAmountPercent === 50}
            label="Pay half now, rest later"
            trailing="50%"
            onSelect={() => handleSelectBookingPercent(50)}
            disabled={showConfirmPay || initiate.isPending}
          />
        </div>
      </StepField>

      <StepField label="Coupon code (optional)">
        <div className="space-y-1.5">
          <div className="flex gap-2 items-stretch">
            <Input
              value={couponCode}
              onChange={(e) => update({ couponCode: e.target.value })}
              placeholder={
                couponAllowed
                  ? "ENTER CODE"
                  : "Not available for this package"
              }
              className="flex-1 uppercase"
              autoComplete="off"
              disabled={
                !couponAllowed ||
                showConfirmPay ||
                initiate.isPending
              }
              aria-invalid={validateCoupon.isError}
              aria-describedby={
                !couponAllowed ||
                validateCoupon.isError ||
                validateCoupon.isSuccess
                  ? "coupon-code-feedback"
                  : undefined
              }
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0 px-4"
              disabled={
                !couponAllowed ||
                !couponCode.trim() ||
                !batchId ||
                validateCoupon.isPending ||
                showConfirmPay ||
                initiate.isPending
              }
              onClick={handleApplyCoupon}
              aria-busy={validateCoupon.isPending}
            >
              {validateCoupon.isPending ? "Applying…" : "Apply"}
            </Button>
          </div>
          {!couponAllowed ? (
            <p
              id="coupon-code-feedback"
              role="status"
              className="text-xs text-stone-500"
            >
              The selected package isn&apos;t eligible for coupon discounts.
            </p>
          ) : (validateCoupon.isError || validateCoupon.isSuccess) && (
            <p
              id="coupon-code-feedback"
              role="status"
              className={cn(
                "text-xs",
                validateCoupon.isError && "text-rose-600",
                validateCoupon.isSuccess && "text-emerald-700",
              )}
            >
              {validateCoupon.isError
                ? validateCoupon.error.message
                : (() => {
                    const d = validateCoupon.data;
                    if (!d) return "Coupon applied.";
                    const amt =
                      typeof d.discount_amount === "number"
                        ? d.discount_amount
                        : 0;
                    const label = d.coupon?.code?.trim() || "Coupon";
                    return `${label} applied — ₹${amt.toLocaleString("en-IN")} off.`;
                  })()}
            </p>
          )}
        </div>
      </StepField>

      {showConfirmPay && initiate.data && (
        <div className="rounded-xl bg-stone-50 p-4 text-sm border border-stone-100 text-stone-700 space-y-3">
          {initiate.data.booking_number ? (
            <p className="text-stone-600">
              Booking reference{" "}
              <strong className="text-stone-900">
                {initiate.data.booking_number}
              </strong>
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBillDetails((open) => !open)}
            aria-expanded={showBillDetails}
          >
            {showBillDetails ? "Hide bill details" : "Bill details"}
          </Button>
          {showBillDetails ? (
            <BookingBillDetailsPanel
              data={initiate.data}
              paymentType={paymentType}
              razorpayEnabled={razorpayEnabled}
            />
          ) : null}
        </div>
      )}

      {initiate.isError && (
        <p className="text-rose-600 text-xs" role="alert">
          {initiate.error instanceof Error
            ? initiate.error.message
            : "Could not start booking"}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={prev}
          disabled={initiate.isPending}
        >
          Back
        </Button>
        {!showConfirmPay ? (
          <Button
            type="button"
            onClick={() => void handleBookNow()}
            disabled={!canBookNow}
            className="bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/25"
          >
            {initiate.isPending ? "Booking…" : "Book now"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleConfirmPay}
            disabled={!initiate.data?.form_token}
            className="bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/25"
          >
            {`Pay ${formatInrAmount(
              initiate.data!.amount_to_be_paid ??
                initiate.data!.total_amount,
            )}`}
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  useGetPublicEventBatches,
  useGetPublicEventPickupPoints,
} from "@/hooks/api/publicAPIs";
import { useBookingWizardStore } from "@/store/use-booking-wizard-store";
import type { PublicEventDetail } from "@/types/bookingConstants";

import { DepartureCard, StepField } from "./wizard-shared";

interface DepartureStepProps {
  event: PublicEventDetail;
}

export function DepartureStep({
  event,
}: DepartureStepProps): React.ReactElement {
  const batchId = useBookingWizardStore((s) => s.batchId);
  const pickupPointId = useBookingWizardStore((s) => s.pickupPointId);
  const update = useBookingWizardStore((s) => s.update);
  const next = useBookingWizardStore((s) => s.next);
  const prev = useBookingWizardStore((s) => s.prev);

  const { data: batches = [], isLoading: batchesLoading } =
    useGetPublicEventBatches(event.event_id);
  const { data: pickupPoints = [] } = useGetPublicEventPickupPoints(
    event.event_id,
  );

  const bookable = useMemo(
    () => batches.filter((b) => b.is_bookable && !b.is_sold_out),
    [batches],
  );

  useEffect(() => {
    if (!batchId && bookable.length > 0) {
      update({ batchId: bookable[0]!.batch_id, priceOptionId: "" });
    }
  }, [bookable, batchId, update]);

  const canContinue = Boolean(batchId);

  return (
    <div className="space-y-5">
      <StepField label="Select departure">
        {batchesLoading ? (
          <p className="text-sm text-stone-500">Loading departures…</p>
        ) : bookable.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            No bookable departures available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bookable.map((b) => (
              <DepartureCard
                key={b.batch_id}
                batch={b}
                selected={batchId === b.batch_id}
                onSelect={() =>
                  update({ batchId: b.batch_id, priceOptionId: "" })
                }
              />
            ))}
          </div>
        )}
      </StepField>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={prev}>
          Back
        </Button>
        <Button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="bg-emerald-700 text-white hover:bg-emerald-800"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

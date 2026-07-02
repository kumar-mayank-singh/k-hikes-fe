"use client";

import type { ReactElement } from "react";
import { Calendar } from "lucide-react";

import type { UseBookingsPageReturn } from "@/hooks/useBookingsPage";

type BookingDetailDepartureFormProps = Pick<
  UseBookingsPageReturn,
  "changeDateForm" | "changeDateBatchesQuery" | "changeDate" | "onChangeDateSubmit"
> & {
  isCancelled: boolean;
};

export function BookingDetailDepartureForm({
  changeDateForm,
  changeDateBatchesQuery,
  changeDate,
  onChangeDateSubmit,
  isCancelled,
}: BookingDetailDepartureFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors: changeDateErrors },
  } = changeDateForm;

  const changeDateBatches = changeDateBatchesQuery.data ?? [];

  return (
    <form
      onSubmit={handleSubmit(onChangeDateSubmit)}
      className="mb-6 border-t border-gray-100 pt-4"
    >
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
        <Calendar className="h-4 w-4" />
        Change departure
      </h4>
      <p className="mb-2 text-xs text-gray-500">
        Select another batch for this event.
      </p>
      <select
        {...register("batch_id")}
        disabled={
          isCancelled ||
          !changeDateBatches.length ||
          changeDateBatchesQuery.isLoading
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
      >
        <option value="">Select batch</option>
        {changeDateBatches.map((batch) => (
          <option key={batch.batch_id} value={batch.batch_id}>
            {batch.start_date} — {batch.end_date}
            {batch.nickname ? ` (${batch.nickname})` : ""}
          </option>
        ))}
      </select>
      {changeDateErrors.batch_id && (
        <p className="mt-1 text-xs text-red-600">
          {changeDateErrors.batch_id.message}
        </p>
      )}
      <button
        type="submit"
        disabled={
          isCancelled || changeDate.isPending || !changeDateBatches.length
        }
        className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
      >
        {changeDate.isPending ? "Updating…" : "Apply new batch"}
      </button>
    </form>
  );
}

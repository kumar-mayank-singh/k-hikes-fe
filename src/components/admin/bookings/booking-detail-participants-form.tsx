"use client";

import type { ReactElement } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Users } from "lucide-react";

import type { UseBookingsPageReturn } from "@/hooks/useBookingsPage";
import type { AdminBooking } from "@/types/bookingConstants";

type BookingDetailParticipantsFormProps = Pick<
  UseBookingsPageReturn,
  "editForm" | "detailPickupPointsQuery" | "updateBooking" | "onSaveDetail"
> & {
  booking: AdminBooking;
  isCancelled: boolean;
};

export function BookingDetailParticipantsForm({
  booking,
  editForm,
  detailPickupPointsQuery,
  updateBooking,
  onSaveDetail,
  isCancelled,
}: BookingDetailParticipantsFormProps): ReactElement {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors: editErrors },
  } = editForm;

  const { fields: peopleFields } = useFieldArray({
    control,
    name: "people",
    keyName: "fieldId",
  });

  return (
    <form
      onSubmit={handleSubmit(onSaveDetail)}
      className="mb-6 border-t border-gray-100 pt-4"
    >
      <h4 className="mb-3 font-semibold text-gray-900">Edit booking</h4>

      <div className="border-t border-gray-100 pt-4">
        <h5 className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
          <Users className="h-4 w-4" />
          Participants
        </h5>
        {peopleFields.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-gray-500">
            No participants submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {peopleFields.map((personField, personIdx) => {
              const source = booking.people?.find(
                (p) => p.booking_person_id === personField.booking_person_id,
              );
              const formResponses = source?.form_responses ?? {};
              const formResponseEntries = Object.entries(formResponses).filter(
                ([, v]) => v?.trim?.(),
              );
              const nameError = editErrors.people?.[personIdx]?.name?.message;
              const phoneError = editErrors.people?.[personIdx]?.phone?.message;

              return (
                <div
                  key={personField.fieldId}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">
                      Attendee {personField.person_index}
                      {personField.person_index === 1 ? (
                        <span className="ml-1 font-normal text-gray-500">
                          (primary)
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="hidden"
                      {...register(`people.${personIdx}.booking_person_id`)}
                    />
                    <input
                      type="hidden"
                      {...register(`people.${personIdx}.person_index`, {
                        valueAsNumber: true,
                      })}
                    />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Attendee name
                      </label>
                      <input
                        {...register(`people.${personIdx}.name`)}
                        disabled={isCancelled}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:bg-gray-100"
                      />
                      {nameError && (
                        <p className="mt-1 text-xs text-red-600">{nameError}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Attendee phone
                      </label>
                      <input
                        {...register(`people.${personIdx}.phone`)}
                        disabled={isCancelled}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:bg-gray-100"
                      />
                      {phoneError && (
                        <p className="mt-1 text-xs text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Pickup point
                      </label>
                      <Controller
                        control={control}
                        name={`people.${personIdx}.pickup_point_id`}
                        render={({ field }) => (
                          <select
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value,
                              )
                            }
                            onBlur={field.onBlur}
                            ref={field.ref}
                            disabled={
                              isCancelled || detailPickupPointsQuery.isLoading
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:bg-gray-100"
                          >
                            <option value="">No pickup</option>
                            {(detailPickupPointsQuery.data ?? []).map((p) => (
                              <option
                                key={p.event_pickup_point_id}
                                value={p.event_pickup_point_id}
                              >
                                {p.name}
                                {p.arrival_time ? ` · ${p.arrival_time}` : ""}
                                {p.is_active ? "" : " (inactive)"}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-1 text-xs text-gray-600 sm:grid-cols-2">
                      <div>
                        <span className="text-gray-500">Email</span>
                        <div className="break-all text-gray-800">
                          {source?.email?.trim() || "—"}
                        </div>
                      </div>
                      {formResponseEntries.length > 0 ? (
                        <div>
                          <span className="text-gray-500">Form responses</span>
                          <ul className="space-y-0.5 text-gray-800">
                            {formResponseEntries.map(([fieldId, value]) => (
                              <li key={fieldId} className="break-all">
                                <span className="font-mono text-[10px] text-gray-400">
                                  {fieldId.slice(0, 8)}:
                                </span>{" "}
                                {value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isCancelled || updateBooking.isPending}
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {updateBooking.isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

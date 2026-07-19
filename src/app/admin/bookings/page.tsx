"use client";

import type { ReactElement } from "react";
import { BookOpen, Eye, Loader2, Plus, XCircle } from "lucide-react";

import { BookingDetailDialog } from "@/components/admin/bookings/booking-detail-dialog";
import { ManualBookingForm } from "@/components/admin/bookings/manual-booking-form";
import { Pagination } from "@/components/components/Pagination";
import { MultiSelect } from "@/components/ui/multi-select";
import { useBookingsPage } from "@/hooks/useBookingsPage";
import { cn } from "@/lib/utils";
import type { AdminBooking } from "@/types/bookingConstants";

function bookingRowId(b: AdminBooking): string {
  const id = b.booking_id?.trim() || b.id?.trim();
  return id ?? "";
}

function departureLabel(b: AdminBooking): string {
  const dep = b.departure_date;
  if (dep?.start_date) {
    return new Date(dep.start_date).toLocaleDateString("en-IN");
  }
  const batch = b.batch;
  if (batch?.start_date) {
    return new Date(batch.start_date).toLocaleDateString("en-IN");
  }
  return "—";
}

export default function BookingsPage(): ReactElement {
  const {
    listParams,
    statusFilter,
    eventFilter,
    batchIdFilter,
    setPage,
    setPerPage,
    setStatusFilter,
    setEventFilter,
    setBatchIdFilter,
    bookingsQuery,
    events,
    batchOptions,
    showManual,
    setShowManual,
    createForm,
    createBatchesQuery,
    createPickupPointsQuery,
    createPriceOptionsQuery,
    onCreateSubmit,
    createBooking,
    selectedBookingId,
    openDetail,
    closeDetail,
    detailQuery,
    editForm,
    detailPickupPointsQuery,
    changeDateForm,
    changeDateBatchesQuery,
    onSaveDetail,
    onChangeDateSubmit,
    onCancelBooking,
    updateBooking,
    changeDate,
    cancelBooking,
    perPageOptions,
  } = useBookingsPage();

  const items = bookingsQuery.data?.items ?? [];
  const totalCount = bookingsQuery.data?.total_count ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <Plus className="h-4 w-4" /> Manual booking
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] max-w-sm flex-1">
          <span className="mb-1 block text-xs font-medium text-gray-600">
            Events
          </span>
          <MultiSelect
            options={events.map((ev) => ({
              value: ev.event_id,
              label: ev.name,
            }))}
            value={eventFilter}
            onChange={setEventFilter}
            placeholder="All events"
            emptyMessage="No events"
          />
        </div>
        <div className="min-w-[220px] max-w-sm flex-1">
          <span className="mb-1 block text-xs font-medium text-gray-600">
            Batches
          </span>
          <MultiSelect
            options={batchOptions}
            value={batchIdFilter}
            onChange={setBatchIdFilter}
            placeholder={
              eventFilter.length === 0
                ? "Select events first"
                : "All batches"
            }
            emptyMessage={
              eventFilter.length === 0
                ? "Select events to load batches"
                : "No batches for selected events"
            }
            disabled={eventFilter.length === 0}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["", "confirmed", "pending", "cancelled"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
              )}
            >
              {s === "" ? "All status" : s}
            </button>
          ))}
        </div>
      </div>

      {showManual ? (
        <ManualBookingForm
          events={events}
          createForm={createForm}
          createBatchesQuery={createBatchesQuery}
          createPickupPointsQuery={createPickupPointsQuery}
          createPriceOptionsQuery={createPriceOptionsQuery}
          onCreateSubmit={onCreateSubmit}
          createBooking={createBooking}
          onClose={() => setShowManual(false)}
        />
      ) : null}

      {bookingsQuery.isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {(bookingsQuery.error as Error).message}
        </div>
      )}

      {bookingsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading bookings…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white py-10 text-center shadow-sm">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Booking code</th>
                  <th className="px-4 py-3 text-left">Event</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((b) => {
                  const rid = bookingRowId(b);
                  return (
                    <tr key={rid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {b.booking_code?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3">{b.event?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{b.customer_name}</div>
                        <div className="text-xs text-gray-400">
                          {b.customer_phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{departureLabel(b)}</td>
                      <td className="px-4 py-3">
                        ₹{b.amount_paid?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            b.source === "online"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {b.source ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : b.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label="View booking"
                            disabled={!rid}
                            onClick={() => rid && openDetail(rid)}
                            className="rounded p-1 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          {b.status !== "cancelled" && rid ? (
                            <button
                              type="button"
                              aria-label="Cancel booking"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    "Cancel this booking? The customer may be notified.",
                                  )
                                ) {
                                  return;
                                }
                                await cancelBooking.mutateAsync(rid);
                              }}
                              className="rounded p-1 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={listParams.page}
            totalItems={totalCount}
            itemsPerPage={listParams.per_page}
            onPageChange={setPage}
            onItemsPerPageChange={setPerPage}
            perPageOptions={[...perPageOptions]}
          />
        </>
      )}

      {selectedBookingId ? (
        <BookingDetailDialog
          bookingId={selectedBookingId}
          onClose={closeDetail}
          detailQuery={detailQuery}
          editForm={editForm}
          detailPickupPointsQuery={detailPickupPointsQuery}
          changeDateForm={changeDateForm}
          changeDateBatchesQuery={changeDateBatchesQuery}
          onSaveDetail={onSaveDetail}
          onChangeDateSubmit={onChangeDateSubmit}
          onCancelBooking={onCancelBooking}
          updateBooking={updateBooking}
          changeDate={changeDate}
          cancelBooking={cancelBooking}
        />
      ) : null}
    </div>
  );
}

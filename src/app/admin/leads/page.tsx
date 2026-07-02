"use client";

import type { ReactElement } from "react";
import { Download, ShoppingCart } from "lucide-react";

import { LeadsCheckoutTable } from "@/components/sections/leads-checkout-table";
import { LeadsPagination } from "@/components/sections/leads-pagination";
import { LeadsPdfTable } from "@/components/sections/leads-pdf-table";
import { useLeadsPage } from "@/hooks/useLeadsPage";
import type { LeadType } from "@/types/leadConstants";

const TABS: { id: LeadType; label: string; icon: typeof Download }[] = [
  { id: "pdf", label: "Channel Leads", icon: Download },
  { id: "checkout", label: "Missed Checkouts", icon: ShoppingCart },
];

export default function LeadsPage(): ReactElement {
  const {
    activeTab,
    setActiveTab,
    eventFilter,
    setEventFilter,
    events,
    perPageOptions,
    pdfListParams,
    checkoutListParams,
    pdfLeadsQuery,
    checkoutLeadsQuery,
    pdfTotalCount,
    checkoutTotalCount,
    setPdfPage,
    setPdfPerPage,
    setCheckoutPage,
    setCheckoutPerPage,
    pdfTotalPages,
    checkoutTotalPages,
  } = useLeadsPage();

  const pdfItems = pdfLeadsQuery.data?.items ?? [];
  const checkoutItems = checkoutLeadsQuery.data?.items ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Leads</h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === "pdf" ? pdfTotalCount : checkoutTotalCount;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <label className="flex items-end gap-2 text-sm">
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Event
            </span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="">All events</option>
              {events.map((ev) => (
                <option key={ev.event_id} value={ev.event_id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      {activeTab === "pdf" && (
        <>
          <LeadsPdfTable
            items={pdfItems}
            isLoading={pdfLeadsQuery.isLoading}
            isError={pdfLeadsQuery.isError}
            errorMessage={(pdfLeadsQuery.error as Error | null)?.message}
          />
          {pdfItems.length > 0 && (
            <LeadsPagination
              page={pdfListParams.page}
              perPage={pdfListParams.per_page}
              totalCount={pdfTotalCount}
              totalPages={pdfTotalPages}
              itemsOnPage={pdfItems.length}
              perPageOptions={perPageOptions}
              onPageChange={setPdfPage}
              onPerPageChange={setPdfPerPage}
            />
          )}
        </>
      )}

      {activeTab === "checkout" && (
        <>
          <LeadsCheckoutTable
            items={checkoutItems}
            isLoading={checkoutLeadsQuery.isLoading}
            isError={checkoutLeadsQuery.isError}
            errorMessage={(checkoutLeadsQuery.error as Error | null)?.message}
          />
          {checkoutItems.length > 0 && (
            <LeadsPagination
              page={checkoutListParams.page}
              perPage={checkoutListParams.per_page}
              totalCount={checkoutTotalCount}
              totalPages={checkoutTotalPages}
              itemsOnPage={checkoutItems.length}
              perPageOptions={perPageOptions}
              onPageChange={setCheckoutPage}
              onPerPageChange={setCheckoutPerPage}
            />
          )}
        </>
      )}
    </div>
  );
}

"use client";

import type { ReactElement } from "react";

interface LeadsPaginationProps {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
  itemsOnPage: number;
  perPageOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function LeadsPagination({
  page,
  perPage,
  totalCount,
  totalPages,
  itemsOnPage,
  perPageOptions,
  onPageChange,
  onPerPageChange,
}: LeadsPaginationProps): ReactElement {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
      <div>
        Showing {itemsOnPage} of {totalCount} · Page {page} of {totalPages}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          Per page
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1"
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

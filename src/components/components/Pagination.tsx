"use client";

import React from "react";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items displayed per page */
  itemsPerPage: number;
  
  /** Callback fired when the page changes */
  onPageChange: (page: number) => void;
  /** Callback fired when items per page changes (omit to hide selector) */
  onItemsPerPageChange?: (perPage: number) => void;
  
  /** Options for the per-page dropdown */
  perPageOptions?: number[];
  /** Toggle visibility of the summary text (e.g., "Showing 1-10 of 100") */
  showSummary?: boolean;
  /** Toggle visibility of the per-page selector */
  showPerPageSelector?: boolean;
  
  /** Optional className to override or extend the wrapper styles */
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  perPageOptions = [10, 20, 50, 100],
  showSummary = true,
  showPerPageSelector = true,
  className = "",
}: PaginationProps) {
  // Calculate derived state
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 ${className}`}
    >
      {showSummary && (
        <div aria-live="polite" className="whitespace-nowrap">
          Showing {startItem}–{endItem} of {totalItems} · Page {currentPage} of{" "}
          {totalPages}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {showPerPageSelector && onItemsPerPageChange && (
          <label className="flex items-center gap-2 whitespace-nowrap">
            Per page
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Items per page"
            >
              {perPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isFirstPage}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={isLastPage}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      </div>
    </nav>
  );
}
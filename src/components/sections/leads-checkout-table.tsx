"use client";

import type { ReactElement } from "react";
import { Loader2, ShoppingCart } from "lucide-react";

import type { CheckoutLead } from "@/types/leadConstants";

interface LeadsCheckoutTableProps {
  items: CheckoutLead[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function attendeeCount(lead: CheckoutLead): string {
  const raw = lead.checkout_data?.["attendees"];
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "—";
}

export function LeadsCheckoutTable({
  items,
  isLoading,
  isError,
  errorMessage,
}: LeadsCheckoutTableProps): ReactElement {
  // if (isError) {
  //   return (
  //     <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
  //       {errorMessage ?? "Failed to load missed checkouts."}
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading missed checkouts…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white py-10 text-center shadow-sm">
        <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">No missed checkouts yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Event</th>
            <th className="px-4 py-3 text-left">Attendees</th>
            <th className="px-4 py-3 text-left">Captured</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((lead, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.customer_name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {lead.customer_phone || "—"}
              </td>
              <td className="px-4 py-3 break-all text-gray-700">
                {lead.customer_email || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {lead.event_name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {attendeeCount(lead)}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {formatDate(lead.created_on ?? lead.updated_on)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

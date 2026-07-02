"use client";

import type { ReactElement } from "react";
import { Download, Loader2 } from "lucide-react";

import type { PdfLead } from "@/types/leadConstants";

interface LeadsPdfTableProps {
  items: PdfLead[];
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

export function LeadsPdfTable({
  items,
  isLoading,
  isError,
  errorMessage,
}: LeadsPdfTableProps): ReactElement {
  // if (isError) {
  //   return (
  //     <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
  //       {errorMessage ?? "Failed to load PDF leads."}
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading PDF leads…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white py-10 text-center shadow-sm">
        <Download className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">No PDF leads yet.</p>
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
            <th className="px-4 py-3 text-left">Event</th>
            <th className="px-4 py-3 text-left">Captured</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((lead, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {lead.name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700">{lead.phone || "—"}</td>
              <td className="px-4 py-3 text-gray-700">
                {lead.event_name || "—"}
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

"use client";

import { useGetDashboardSummary } from "@/hooks/api/authAPIs";
import { IndianRupee, Users, TrendingUp, Clock } from "lucide-react";

function formatInr(amount: number): string {
  return `₹${Number(amount).toLocaleString()}`;
}

export default function AdminDashboard() {
  const { data, isPending, isError, error } = useGetDashboardSummary();

  const cards = [
    {
      label: "Total Revenue",
      value: isPending ? "..." : data ? formatInr(data.total_revenue) : "—",
      icon: IndianRupee,
      color: "bg-green-500",
    },
    {
      label: "Today's Bookings",
      value: isPending ? "..." : data?.today_bookings_count ?? "—",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Today's Revenue",
      value: isPending ? "..." : data ? formatInr(data.today_revenue) : "—",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      label: "Pending Balance",
      value: isPending ? "..." : data ? formatInr(data.pending_balance) : "—",
      icon: Clock,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {isError ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error instanceof Error
            ? error.message
            : "Could not load dashboard statistics."}
        </p>
      ) : null}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-500">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

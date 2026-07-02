"use client";

import { useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Tag,
  BookOpen,
  LogOut,
  Menu,
  Ticket,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUserSync } from "@/hooks/useCurrentUserSync";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "My Events", icon: Calendar },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/leads", label: "Leads", icon: UserCheck },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, error } = useCurrentUserSync();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex h-dvh min-h-0 items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    toast.error(error.message);
    redirect("/auth");
  }

  const handleLogout = async () => {
    logout();
    router.push("/auth");
  };

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-64 min-h-0 flex-col bg-slate-800 text-slate-200 transform transition-transform duration-200 ease-out lg:static lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="shrink-0 border-b border-slate-700 p-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Karnataka Hikes" className="w-10 h-10" />
            <span className="font-bold text-white">Karnataka Hikes</span>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-slate-700 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0">
        <header className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-900">Karnataka Hikes</span>
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

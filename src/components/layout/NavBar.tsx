import type { ReactElement } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

type NavPath = (typeof NAV_ITEMS)[number]["href"];

interface NavBarProps {
  activePath: NavPath;
}

export function NavBar({ activePath }: NavBarProps): ReactElement {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Karnataka Hikes"
              className="w-10 h-10"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Karnataka Hikes
            </h1>
            <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-semibold">
              Treks & Adventures
            </p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === activePath;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg transition-all",
                  isActive
                    ? "font-medium text-white bg-white/10"
                    : "text-stone-400 hover:text-white hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

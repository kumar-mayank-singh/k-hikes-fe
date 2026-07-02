import { CouponScope } from "@/types/couponConstants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryDescription(description: string) {
  return description.length > 100
    ? description.substring(0, 100) + "..."
    : description;
}

export function scopeLabel(scope: CouponScope): string {
  switch (scope) {
    case "company":
      return "Company-wide";
    case "event":
      return "Event";
    case "batch":
      return "Batch";
    default:
      return scope;
  }
}

export function formatValidity(
  validFrom: string,
  validTill: string,
): string | null {
  if (!validFrom && !validTill) return null;
  try {
    const from = validFrom ? new Date(validFrom).toLocaleDateString() : "—";
    const till = validTill ? new Date(validTill).toLocaleDateString() : "—";
    return `${from} → ${till}`;
  } catch {
    return null;
  }
}

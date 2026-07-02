"use client";

import { cn } from "@/lib/utils";

export interface CouponsEmptyStateProps {
  hasCoupons: boolean;
  onCreateCoupon: () => void;
  className?: string;
}

export function CouponsEmptyState({
  hasCoupons,
  onCreateCoupon,
  className,
}: CouponsEmptyStateProps): React.ReactElement {
  if (hasCoupons) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card py-10 text-center text-muted-foreground shadow-sm",
        className
      )}
    >
      <p>No coupons yet.</p>
      <button
        type="button"
        onClick={onCreateCoupon}
        className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Create your first coupon
      </button>
    </div>
  );
}

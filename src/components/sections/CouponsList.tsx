"use client";

import { CouponCard } from "@/components/components/CouponCard";
import { CouponsListProps } from "@/types/couponConstants";
import { cn } from "@/lib/utils";

export function CouponsList({
  coupons,
  isLoading,
  error,
  onToggleActive,
  onRequestDelete,
  isToggling = false,
  className,
}: CouponsListProps): React.ReactElement {
  if (isLoading) {
    return (
      <p
        className={cn(
          "py-12 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Loading coupons…
      </p>
    );
  }

  if ((coupons.length === 0) || error) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.coupon_id}
          coupon={coupon}
          onToggleActive={onToggleActive}
          onRequestDelete={onRequestDelete}
          isToggling={isToggling}
        />
      ))}
    </div>
  );
}

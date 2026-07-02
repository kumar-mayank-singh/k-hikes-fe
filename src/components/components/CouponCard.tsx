"use client";

import { memo } from "react";
import { Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { formatValidity, scopeLabel } from "@/lib/utils";
import type { CouponCardProps } from "@/types/couponConstants";

function CouponCardComponent({
  coupon,
  onToggleActive,
  onRequestDelete,
  isToggling = false,
}: CouponCardProps): React.ReactElement {
  const discountLabel =
    coupon.discount_type === "percentage"
      ? `${coupon.discount_value}%`
      : `₹${coupon.discount_value}`;
  const applyLabel = coupon.apply_type === "per_person" ? "Per Person" : "Flat";
  const validity = formatValidity(coupon.valid_from, coupon.valid_till);

  const metaParts = [discountLabel, applyLabel, scopeLabel(coupon.scope)];
  if (coupon.min_group_size != null) {
    metaParts.push(`min ${coupon.min_group_size} people`);
  }
  if (validity) {
    metaParts.push(validity);
  }
  if (coupon.is_public) {
    metaParts.push("Public");
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
        >
          <Ticket className="size-5 text-green-600" />
        </div>
        <div>
          <span className="font-mono text-lg font-bold">{coupon.code}</span>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {metaParts.join(" · ")}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className={
            coupon.is_active
              ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-gray-300 text-gray-500"
          }
          onClick={() => onToggleActive(coupon.coupon_id, coupon.is_active)}
          disabled={isToggling}
        >
          {coupon.is_active ? "Active" : "Inactive"}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onRequestDelete(coupon)}
          aria-label="Delete coupon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export const CouponCard = memo(CouponCardComponent);

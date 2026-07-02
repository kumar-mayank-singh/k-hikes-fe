"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CouponsHeaderProps {
  onCreateClick: () => void;
  className?: string;
}

export function CouponsHeader({
  onCreateClick,
  className,
}: CouponsHeaderProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className
      )}
    >
      <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
      <Button
        className="gap-2 bg-green-700 px-4 py-4 text-sm font-medium text-white hover:bg-green-800"
        onClick={onCreateClick}
      >
        <Plus className="size-4" />
        Create Coupon
      </Button>
    </div>
  );
}

import { type UseFormReturn } from "react-hook-form";
import { CreateCouponFormValues } from "@/lib/validation/schema";
import { Event } from "./eventConstants";

export type CouponDiscountType = "amount" | "percentage";
export type CouponApplyType = "flat" | "per_person";
export type CouponScope = "company" | "event" | "batch";
export type CouponValidityType = "fixed" | "relative";

export interface Coupon {
  coupon_id: string;
  code: string;
  scope: CouponScope;
  event_id: string | null;
  batch_id: string | null;
  discount_type: CouponDiscountType;
  apply_type: CouponApplyType;
  discount_value: number;
  min_group_size: number | null;
  is_public: boolean;
  is_active: boolean;
  validity_type: CouponValidityType;
  valid_from: string;
  valid_till: string;
  valid_days: number | null;
  created_on?: string | null;
  updated_on?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CouponsResponse {
  items: Coupon[];
  total_count: number;
}

export interface CreateCouponPayload {
  code: string;
  scope: CouponScope;
  discount_type: CouponDiscountType;
  apply_type: CouponApplyType;
  discount_value: number;
  event_id?: string | null;
  batch_id?: string | null;
  min_group_size?: number | null;
  is_public: boolean;
  validity_type: CouponValidityType;
  valid_from?: string | null;
  valid_till?: string | null;
  valid_days?: number | null;
}

export interface UpdateCouponPayload {
  is_active?: boolean;
}

export interface CouponCardProps {
  coupon: Coupon;
  onToggleActive: (couponId: string, current: boolean) => void;
  onRequestDelete: (coupon: Coupon) => void;
  isToggling?: boolean;
}

export interface CouponsListProps {
  coupons: Coupon[];
  isLoading: boolean;
  error: Error | null;
  onToggleActive: (id: string, current: boolean) => void;
  onRequestDelete: (coupon: Coupon) => void;
  isToggling?: boolean;
  className?: string;
}

export interface CreateCouponFormProps {
  form: UseFormReturn<CreateCouponFormValues>;
  events: Pick<Event, "event_id" | "name">[];
  onSubmit: (values: CreateCouponFormValues) => void | Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  className?: string;
}

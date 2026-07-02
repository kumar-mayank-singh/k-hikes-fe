"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useGetCoupons,
  useGetEvents,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/hooks/api/authAPIs";
import {
  createCouponSchema,
  type CreateCouponFormValues,
} from "@/lib/validation/schema";
import { Coupon, CreateCouponPayload } from "@/types/couponConstants";

export function useCouponsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading, error } = useGetCoupons();
  const { data: eventsPage } = useGetEvents({ page: 1, per_page: 100 });
  const events = useMemo(() => eventsPage?.items ?? [], [eventsPage]);

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const form = useForm<CreateCouponFormValues>({
    resolver: zodResolver(createCouponSchema),
    defaultValues: {
      code: "",
      discount_type: "amount",
      discount_value: "",
      apply_type: "flat",
      scope: "company",
      event_id: "",
      batch_id: "",
      min_group_size: "",
      validity_type: "fixed",
      valid_from: "",
      valid_till: "",
      valid_days: "",
      is_public: false,
    },
  });

  const handleCreateSubmit = useCallback(
    async (values: CreateCouponFormValues) => {
      const base: Omit<
        CreateCouponPayload,
        "valid_from" | "valid_till" | "valid_days"
      > = {
        code: values.code.trim(),
        scope: values.scope,
        discount_type: values.discount_type,
        apply_type: values.apply_type,
        discount_value: parseFloat(values.discount_value),
        is_public: values.is_public,
        event_id:
          values.scope === "company" ? null : values.event_id?.trim() || null,
        batch_id:
          values.scope === "batch" ? values.batch_id?.trim() || null : null,
        min_group_size: values.min_group_size?.trim()
          ? parseInt(values.min_group_size, 10)
          : null,
        validity_type: values.validity_type,
      };

      const payload: CreateCouponPayload =
        values.validity_type === "relative"
          ? {
              ...base,
              valid_from: values.valid_from,
              valid_days: parseInt(values.valid_days.trim(), 10),
            }
          : {
              ...base,
              valid_from: values.valid_from,
              valid_till: values.valid_till,
            };

      await createCoupon.mutateAsync(payload);
      form.reset();
      setShowCreateForm(false);
    },
    [createCoupon, form],
  );

  const handleToggleActive = useCallback(
    async (coupon_id: string, current: boolean) => {
      await updateCoupon.mutateAsync({
        coupon_id,
        is_active: !current,
      });
    },
    [updateCoupon],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCoupon.mutateAsync(deleteTarget.coupon_id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCoupon]);

  const toggleShowCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  return {
    coupons,
    events,
    isLoading,
    error: error ?? null,
    showCreateForm,
    toggleShowCreateForm,
    deleteTarget,
    setDeleteTarget,
    form,
    handleCreateSubmit,
    handleToggleActive,
    handleDelete,
    createCoupon,
    updateCoupon,
  };
}

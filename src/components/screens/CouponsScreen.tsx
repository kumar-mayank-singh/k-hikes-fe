"use client";

import { useCouponsPage } from "@/hooks/useCouponsPage";
import { CouponsHeader } from "../sections/CouponsHeader";
import { CreateCouponForm } from "../sections/CreateCouponForm";
import { CouponsList } from "../sections/CouponsList";
import { CouponsEmptyState } from "../sections/CouponsEmptyState";
import { CouponDeleteDialog } from "../sections/CouponDeleteDialog";

export function CouponsScreen(): React.ReactElement {
  const {
    coupons,
    events,
    isLoading,
    error,
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
  } = useCouponsPage();

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <CouponsHeader onCreateClick={toggleShowCreateForm} />

      {showCreateForm && (
        <CreateCouponForm
          form={form}
          events={events}
          onSubmit={handleCreateSubmit}
          onCancel={() => toggleShowCreateForm()}
          isPending={createCoupon.isPending}
        />
      )}

      <div className="space-y-2">
        <CouponsList
          coupons={coupons}
          isLoading={isLoading}
          error={error}
          onToggleActive={handleToggleActive}
          onRequestDelete={setDeleteTarget}
          isToggling={updateCoupon.isPending}
        />
      </div>

      {!isLoading && (
        <CouponsEmptyState
          hasCoupons={coupons.length > 0}
          onCreateCoupon={toggleShowCreateForm}
        />
      )}

      <CouponDeleteDialog
        coupon={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleDelete}
      />
    </div>
  );
}

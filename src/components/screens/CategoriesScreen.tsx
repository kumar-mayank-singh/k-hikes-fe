"use client";

import { useCategoriesPage } from "@/hooks/useCategoriesPage";
import { CategoriesHeader } from "../sections/CategoriesHeader";
import { CategoriesList } from "../sections/CategoriesList";
import { CategoriesEmptyState } from "../sections/CategoriesEmptyState";
import { CategoryCreateDialog } from "../sections/CategoryCreateDialog";
import { CategoryDeleteDialog } from "../sections/CategoryDeleteDialog";

export function CategoriesScreen(): React.ReactElement {
  const {
    categories,
    isLoading,
    error,
    editingId,
    editForm,
    setEditForm,
    deleteTarget,
    createDialogOpen,
    form,
    handleCreateSubmit,
    handleUpdate,
    handleDelete,
    startEditing,
    cancelEditing,
    openCreateDialog,
    setCreateDialogOpen,
    setDeleteTarget,
    setDeleteDialogOpen,
    createCategory,
    updateCategory,
  } = useCategoriesPage();

  return (
    <div className="space-y-6">
      <CategoriesHeader onNewCategory={openCreateDialog} />

      <div className="space-y-3">
        <CategoriesList
          categories={categories}
          isLoading={isLoading}
          error={error}
          editingId={editingId}
          editForm={editForm}
          onEditFormChange={setEditForm}
          onStartEdit={startEditing}
          onCancelEdit={cancelEditing}
          onUpdate={handleUpdate}
          onRequestDelete={setDeleteTarget}
          isUpdating={updateCategory.isPending}
        />
      </div>

      <CategoriesEmptyState
        hasCategories={categories.length > 0}
        onCreateCategory={openCreateDialog}
      />

      <CategoryCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        form={form}
        onSubmit={handleCreateSubmit}
        isPending={createCategory.isPending}
      />

      <CategoryDeleteDialog
        category={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}

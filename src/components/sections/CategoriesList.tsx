"use client";

import { useMemo } from "react";

import { Category, CategoriesListProps } from "@/types/categoryConstants";
import { CategoryCard } from "../components/CategoryCard";

function sortCategoriesByOrder(items: Category[]): Category[] {
  return [...items].sort((a, b) => {
    const orderDiff = a.sort_order - b.sort_order;
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });
}

export function CategoriesList({
  categories,
  isLoading,
  error,
  editingId,
  editForm,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onRequestDelete,
  isUpdating,
}: CategoriesListProps): React.ReactElement {
  const sortedCategories = useMemo(
    () => sortCategoriesByOrder(categories),
    [categories],
  );

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        Loading categories...
      </p>
    );
  }

  if (sortedCategories.length === 0 || error) {
    return null;
  }

  return (
    <div className="space-y-3">
      {sortedCategories.map((cat) => (
        <CategoryCard
          key={cat.category_id}
          category={cat}
          isEditing={editingId === cat.category_id}
          editForm={editForm}
          onEditFormChange={onEditFormChange}
          onSave={() => onUpdate(cat.category_id)}
          onCancel={onCancelEdit}
          onStartEdit={() => onStartEdit(cat)}
          onRequestDelete={() => onRequestDelete(cat)}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}

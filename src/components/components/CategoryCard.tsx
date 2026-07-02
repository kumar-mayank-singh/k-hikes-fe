"use client";

import React, { memo } from "react";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategoryDescription } from "@/lib/utils";
import { CategoryCardProps } from "@/types/categoryConstants";

function CategoryCardComponent({
  category,
  isEditing,
  editForm,
  onEditFormChange,
  onSave,
  onCancel,
  onStartEdit,
  onRequestDelete,
  isUpdating,
}: CategoryCardProps): React.ReactElement {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-transparent bg-white p-4 shadow-sm">
      {isEditing ? (
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={editForm.name}
            onChange={(e) =>
              onEditFormChange({ ...editForm, name: e.target.value })
            }
            placeholder="Name"
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            value={editForm.sort_order}
            onChange={(e) =>
              onEditFormChange({
                ...editForm,
                sort_order: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            placeholder="Sort order"
            className="w-28"
            aria-label="Sort order"
          />
          <Input
            value={editForm.description}
            onChange={(e) =>
              onEditFormChange({ ...editForm, description: e.target.value })
            }
            placeholder="Description"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onSave}
              disabled={isUpdating}
              className="bg-green-700 text-white hover:opacity-90"
            >
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
          >
            <Tag className="size-5" style={{ color: "#10b981" }} />
          </div>
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold" style={{ color: "#1e293b" }}>
                {category.name}
              </span>
              <span
                className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-md"
                style={{ color: "#64748b", backgroundColor: "#f1f5f9" }}
              >
                Priority {category.sort_order}
              </span>
            </div>
            {/* Slug is same as of name so not showing it */}
            {/* <span className="text-xs truncate" style={{ color: "#94a3b8" }}>
              {category.slug}
            </span> */}
            {category.description ? (
              <span className="text-sm" style={{ color: "#64748b" }}>
                {getCategoryDescription(category.description)}
              </span>
            ) : null}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onStartEdit}
              aria-label="Edit category"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onRequestDelete}
              aria-label="Delete category"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export const CategoryCard = memo(CategoryCardComponent);

"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoriesEmptyStateProps } from "@/types/categoryConstants";


export function CategoriesEmptyState({
  hasCategories,
  onCreateCategory,
}: CategoriesEmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 border-[#e2e8f0] bg-[rgba(248,250,252,0.5)]",
        hasCategories ? "mt-4" : "",
      )}
    >
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[rgba(16,185,129,0.1)]">
        <Plus className="size-6 text-emerald-500" />
      </div>

      <p className="mb-1 text-center text-sm font-medium text-slate-800">
        Ready to expand your catalog?
      </p>

      <button
        type="button"
        className="text-sm font-medium text-green-700 underline-offset-4 hover:underline"
        onClick={onCreateCategory}
      >
        Define a custom trail category
      </button>
    </div>
  );
}

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CategoriesHeaderProps } from "@/types/categoryConstants";


export function CategoriesHeader({ onNewCategory }: CategoriesHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
        Category
      </h1>
      <Button
        className="gap-2 px-4 py-4 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm font-medium"
        onClick={onNewCategory}
      >
        <Plus className="size-4" />
        New Category
      </Button>
    </div>
  );
}

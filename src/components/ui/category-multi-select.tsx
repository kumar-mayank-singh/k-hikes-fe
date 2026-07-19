"use client";

import type { ReactElement } from "react";

import {
  MultiSelect,
  type MultiSelectProps,
} from "@/components/ui/multi-select";
import { Category } from "@/types/categoryConstants";

export interface CategoryMultiSelectProps {
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

export function CategoryMultiSelect({
  categories,
  value,
  onChange,
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: CategoryMultiSelectProps): ReactElement {
  const options: MultiSelectProps["options"] = categories.map((cat) => ({
    value: cat.category_id,
    label: cat.name,
  }));

  return (
    <MultiSelect
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="No category selected"
      disabled={disabled}
      className={className}
      aria-invalid={ariaInvalid}
      emptyMessage="No categories"
    />
  );
}

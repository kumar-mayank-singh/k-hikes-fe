"use client";

import type { ReactElement } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
  const toggle = (categoryId: string): void => {
    if (value.includes(categoryId)) {
      onChange(value.filter((x) => x !== categoryId));
    } else {
      onChange([...value, categoryId]);
    }
  };

  const labelById = (cid: string): string =>
    categories.find((c) => c.category_id === cid)?.name ?? cid;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-auto min-h-12 w-full justify-between gap-2 py-2 font-normal",
            ariaInvalid && "border-destructive",
            className
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
            {value.length === 0 ? (
              <span className="text-muted-foreground">No category selected</span>
            ) : (
              value.map((cid) => (
                <Badge key={cid} variant="secondary" className="font-normal">
                  {labelById(cid)}
                </Badge>
              ))
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <ScrollArea className="max-h-60">
          <ul className="p-2">
            {categories.map((cat) => {
              const checked = value.includes(cat.category_id);
              return (
                <li key={cat.category_id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => {
                        toggle(cat.category_id);
                      }}
                    />
                    <span>{cat.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

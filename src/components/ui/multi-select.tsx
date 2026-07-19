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

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  emptyMessage?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  id,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  emptyMessage = "No options",
}: MultiSelectProps): ReactElement {
  const toggle = (optionValue: string): void => {
    if (value.includes(optionValue)) {
      onChange(value.filter((x) => x !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const labelByValue = (optionValue: string): string =>
    options.find((o) => o.value === optionValue)?.label ?? optionValue;

  const selectedCount = value.length;
  const firstLabel =
    selectedCount > 0 ? labelByValue(value[0]) : "";

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
            "h-10 w-full justify-between gap-2 overflow-hidden px-3 py-2 font-normal",
            ariaInvalid && "border-destructive",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-left">
            {selectedCount === 0 ? (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              <>
                <span
                  className="min-w-0 flex-1 truncate text-sm"
                  title={firstLabel}
                >
                  {firstLabel}
                </span>
                {selectedCount > 1 ? (
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-normal"
                  >
                    +{selectedCount}
                  </Badge>
                ) : null}
              </>
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
          {options.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            <ul className="p-2">
              {options.map((opt) => {
                const checked = value.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          toggle(opt.value);
                        }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

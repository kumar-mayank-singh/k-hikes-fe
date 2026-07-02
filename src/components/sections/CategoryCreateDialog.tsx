"use client";

import type { UseFormReturn } from "react-hook-form";

import type { CreateCategoryFormValues } from "@/lib/validation/schema";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface CategoryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateCategoryFormValues>;
  onSubmit: (values: CreateCategoryFormValues) => void | Promise<void>;
  isPending: boolean;
}

export function CategoryCreateDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isPending,
}: CategoryCreateDialogProps): React.ReactElement {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="create-category-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="create-category-name"
                  placeholder="e.g. South Indian"
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                />
                {form.formState.errors.name && (
                  <FieldError errors={[form.formState.errors.name]} />
                )}
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-category-sort-order">
                Sort order
              </FieldLabel>
              <FieldContent>
                <Input
                  id="create-category-sort-order"
                  type="number"
                  min={0}
                  placeholder="1"
                  {...form.register("sort_order", { valueAsNumber: true })}
                  aria-invalid={!!form.formState.errors.sort_order}
                />
                {form.formState.errors.sort_order ? (
                  <FieldError errors={[form.formState.errors.sort_order]} />
                ) : null}
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-category-description">
                Description
              </FieldLabel>
              <FieldContent>
                <Input
                  id="create-category-description"
                  placeholder="Optional description"
                  {...form.register("description")}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-700 text-white hover:opacity-90"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/api/authAPIs";
import {
  createCategorySchema,
  type CreateCategoryFormValues,
} from "@/lib/validation/schema";
import { Category } from "@/types/categoryConstants";

export function useCategoriesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    sort_order: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: categories = [], isLoading, error } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", description: "", sort_order: 1 },
  });

  const nextSortOrder = useCallback((): number => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.sort_order), 0) + 1;
  }, [categories]);

  const handleCreateSubmit = useCallback(
    async (values: CreateCategoryFormValues) => {
      await createCategory.mutateAsync({
        name: values.name,
        description: values.description || null,
        sort_order: values.sort_order,
      });
      form.reset();
      setCreateDialogOpen(false);
    },
    [createCategory, form]
  );

  const handleUpdate = useCallback(
    async (category_id: string) => {
      await updateCategory.mutateAsync({
        category_id,
        name: editForm.name || null,
        description: editForm.description || null,
        sort_order: editForm.sort_order,
      });
      setEditingId(null);
    },
    [editForm, updateCategory]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCategory.mutateAsync(deleteTarget.category_id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCategory]);

  const startEditing = useCallback((cat: Category) => {
    setEditingId(cat.category_id);
    setEditForm({
      name: cat.name,
      description: cat.description ?? "",
      sort_order: cat.sort_order,
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const openCreateDialog = useCallback(() => {
    form.reset({ name: "", description: "", sort_order: nextSortOrder() });
    setCreateDialogOpen(true);
  }, [form, nextSortOrder]);
  const setCreateDialogOpenState = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
  }, []);
  const setDeleteTargetState = useCallback((target: Category | null) => {
    setDeleteTarget(target);
  }, []);
  const setDeleteDialogOpen = useCallback((open: boolean) => {
    if (!open) setDeleteTarget(null);
  }, []);

  return {
    categories,
    isLoading,
    error: error ?? null,
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
    setCreateDialogOpen: setCreateDialogOpenState,
    setDeleteTarget: setDeleteTargetState,
    setDeleteDialogOpen,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

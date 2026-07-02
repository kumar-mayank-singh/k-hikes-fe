"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetFormFields,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
} from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS, ItemRow } from "./event-edit-shared";
import { EventFormField, FormFieldType } from "@/types/eventSubConstants";

const FIELD_TYPE_OPTIONS: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "choice", label: "Choice" },
  { value: "file", label: "File" },
];

interface FormFieldFormState {
  label: string;
  field_type: FormFieldType;
  is_required: boolean;
  options: string;
}

const EMPTY_FORM: FormFieldFormState = {
  label: "",
  field_type: "text",
  is_required: false,
  options: "",
};

function fieldToForm(f: EventFormField): FormFieldFormState {
  return {
    label: f.label,
    field_type: f.field_type,
    is_required: f.is_required,
    options: f.options?.join(", ") ?? "",
  };
}

function parseOptions(raw: string): string[] | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
}

function formToCreatePayload(f: FormFieldFormState) {
  return {
    label: f.label,
    field_type: f.field_type,
    is_required: f.is_required,
    options: f.field_type === "choice" ? parseOptions(f.options) : null,
  };
}

export function EventEditFormFieldsSection({
  eventId,
}: {
  eventId: string;
}): React.ReactNode {
  const { data: formFields = [], isLoading, isError, error } = useGetFormFields(eventId);
  const createField = useCreateFormField(eventId);
  const updateField = useUpdateFormField(eventId);
  const deleteField = useDeleteFormField(eventId);

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormFieldFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormFieldFormState>(EMPTY_FORM);

  const cancelEdit = useCallback((): void => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const openAddForm = useCallback((): void => {
    setIsAdding(true);
    setAddForm(EMPTY_FORM);
    cancelEdit();
  }, [cancelEdit]);

  const cancelAdd = useCallback((): void => {
    setIsAdding(false);
    setAddForm(EMPTY_FORM);
  }, []);

  const handleAdd = useCallback((): void => {
    if (!addForm.label.trim()) {
      toast.error("Label is required");
      return;
    }
    createField.mutate(formToCreatePayload(addForm), {
      onSuccess: () => cancelAdd(),
    });
  }, [addForm, createField, cancelAdd]);

  const startEdit = useCallback(
    (f: EventFormField): void => {
      setEditingId(f.form_field_id);
      setEditForm(fieldToForm(f));
      setIsAdding(false);
    },
    [],
  );

  const handleUpdate = useCallback((): void => {
    if (!editingId) return;
    if (!editForm.label.trim()) {
      toast.error("Label is required");
      return;
    }
    updateField.mutate(
      { formFieldId: editingId, payload: formToCreatePayload(editForm) },
      { onSuccess: () => cancelEdit() },
    );
  }, [editingId, editForm, updateField, cancelEdit]);

  const handleDelete = useCallback(
    (id: string): void => {
      deleteField.mutate(id);
      if (editingId === id) cancelEdit();
    },
    [deleteField, editingId, cancelEdit],
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading form fields…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-600">
          Failed to load form fields{error ? `: ${error.message}` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-4">
        Post-Booking Form Fields
      </h2>

      {formFields.length === 0 && (
        <p className="text-gray-500 text-sm mb-4">
          No form fields yet. Add one below.
        </p>
      )}

      {formFields.map((f) => {
        const id = f.form_field_id;
        const isEditing = editingId === id;

        if (isEditing) {
          return (
            <div
              key={id}
              className="p-4 border-2 border-green-200 bg-green-50/30 rounded-lg mb-3"
            >
              <FormFieldFormFields form={editForm} onChange={setEditForm} />
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateField.isPending}
                  className={cn(
                    "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {updateField.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        }

        return (
          <ItemRow
            key={id}
            onDelete={() => handleDelete(id)}
            onEdit={() => startEdit(f)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium">{f.label}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600",
                )}
              >
                {f.field_type}
              </span>
              {f.is_required && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                  Required
                </span>
              )}
              {f.options && f.options.length > 0 && (
                <span className="text-sm text-gray-500">
                  Options: {f.options.join(", ")}
                </span>
              )}
            </div>
          </ItemRow>
        );
      })}

      {isAdding ? (
        <div className="mt-4 p-4 border-2 border-green-200 bg-green-50/30 rounded-lg">
          <FormFieldFormFields form={addForm} onChange={setAddForm} />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={createField.isPending}
              className={cn(
                "px-4 py-2 bg-green-700 text-white rounded-lg text-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {createField.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAddForm}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" /> Add Form Field
        </button>
      )}
    </div>
  );
}

function FormFieldFormFields({
  form,
  onChange,
}: {
  form: FormFieldFormState;
  onChange: (next: FormFieldFormState) => void;
}): React.ReactNode {
  const set = <K extends keyof FormFieldFormState>(
    key: K,
    value: FormFieldFormState[K],
  ): void => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <label className={LABEL_CLS}>Label *</label>
        <input
          placeholder="e.g. Aadhaar Number"
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div>
        <label className={LABEL_CLS}>Field Type</label>
        <select
          value={form.field_type}
          onChange={(e) => set("field_type", e.target.value as FormFieldType)}
          className={INPUT_CLS}
        >
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {form.field_type === "choice" && (
        <div className="md:col-span-2">
          <label className={LABEL_CLS}>Options (comma-separated)</label>
          <input
            placeholder="e.g. Veg, Non-Veg, Eggetarian"
            value={form.options}
            onChange={(e) => set("options", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      )}
      <div className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          id="form-field-required"
          checked={form.is_required}
          onChange={(e) => set("is_required", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
        />
        <label htmlFor="form-field-required" className="text-sm text-gray-700">
          Required
        </label>
      </div>
    </div>
  );
}

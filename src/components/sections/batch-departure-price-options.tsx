"use client";

import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useEventSubResource,
  useGetAdminBatchPriceOptions,
} from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS, ItemRow, getItemId } from "./event-edit-shared";
import { PriceOption } from "@/types/eventSubConstants";

interface TicketForm {
  name: string;
  price: string;
  eligible_for_discounts: boolean;
  is_active: boolean;
}

const emptyTicketForm: TicketForm = {
  name: "",
  price: "",
  eligible_for_discounts: true,
  is_active: true,
};

function ticketFormFromItem(opt: PriceOption): TicketForm {
  return {
    name: opt.name,
    price: String(opt.price),
    eligible_for_discounts: opt.eligible_for_discounts,
    is_active: opt.is_active,
  };
}

function ticketFormToPayload(
  f: TicketForm,
  batchId: string,
): Record<string, unknown> {
  return {
    name: f.name,
    price: parseFloat(f.price) || 0,
    batch_ids: [batchId],
    eligible_for_discounts: f.eligible_for_discounts,
    is_active: f.is_active,
  };
}

export function BatchDeparturePriceOptions({
  eventId,
  batchId,
  priceOverride,
}: {
  eventId: string;
  batchId: string;
  priceOverride: boolean;
}): React.ReactElement {
  const {
    data: options = [],
    isLoading,
    isError,
    error,
  } = useGetAdminBatchPriceOptions(batchId);
  const priceOptions = useEventSubResource(eventId, "price-options");

  const [ticketForm, setTicketForm] = useState<TicketForm>(emptyTicketForm);
  const [ticketEditId, setTicketEditId] = useState<string | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);

  const openTicketAdd = (): void => {
    if (!priceOverride) return;
    setTicketEditId(null);
    setTicketForm(emptyTicketForm);
    setIsTicketFormOpen(true);
  };

  const startTicketEdit = (opt: PriceOption): void => {
    setTicketEditId(getItemId(opt));
    setTicketForm(ticketFormFromItem(opt));
    setIsTicketFormOpen(true);
  };

  const closeTicketForm = (): void => {
    setTicketEditId(null);
    setTicketForm(emptyTicketForm);
    setIsTicketFormOpen(false);
  };

  const handleTicketSave = (): void => {
    const payload = ticketFormToPayload(ticketForm, batchId);
    if (ticketEditId) {
      priceOptions.update.mutate(
        { itemId: ticketEditId, payload },
        { onSuccess: closeTicketForm },
      );
    } else {
      priceOptions.add.mutate(payload, { onSuccess: closeTicketForm });
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Ticket options
        </h4>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading…
        </div>
      ) : isError ? (
        <p className="py-2 text-sm text-red-600">
          Failed to load ticket options
          {error ? `: ${error.message}` : ""}
        </p>
      ) : options.length > 0 ? (
        options.map((opt) => {
          const id = getItemId(opt);
          return (
            <ItemRow
              key={id}
              onDelete={() => priceOptions.remove.mutate(id)}
              onEdit={() => startTicketEdit(opt)}
            >
              <span className="font-medium">{opt.name}</span>
              <span className="ml-2 text-sm text-gray-600">
                ₹{opt.price.toLocaleString("en-IN")}
              </span>
              {!opt.is_active && (
                <span className="ml-2 text-xs font-medium text-red-600">
                  Inactive
                </span>
              )}
            </ItemRow>
          );
        })
      ) : (
        <p className="py-1 text-sm text-gray-500">
          No ticket options for this departure.
        </p>
      )}

      {isTicketFormOpen ? (
        <BatchTicketOptionForm
          form={ticketForm}
          onChange={setTicketForm}
          isEditing={ticketEditId !== null}
          isPending={
            ticketEditId
              ? priceOptions.update.isPending
              : priceOptions.add.isPending
          }
          onSave={handleTicketSave}
          onCancel={closeTicketForm}
        />
      ) : priceOverride ? (
        <button
          type="button"
          onClick={openTicketAdd}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Ticket Option
        </button>
      ) : (
        <p className="mt-2 text-sm text-gray-500">
          Enable price override to create price option.
        </p>
      )}
    </div>
  );
}

function BatchTicketOptionForm({
  form,
  onChange,
  isEditing,
  isPending,
  onSave,
  onCancel,
}: {
  form: TicketForm;
  onChange: React.Dispatch<React.SetStateAction<TicketForm>>;
  isEditing: boolean;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}): React.ReactElement {
  const set = <K extends keyof TicketForm>(k: K, v: TicketForm[K]): void =>
    onChange((f) => ({ ...f, [k]: v }));

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-200 p-3">
      <p className="text-sm font-semibold text-gray-800">
        {isEditing ? "Edit ticket option" : "Add ticket option"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLS}>Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. Standard"
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Price</label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.eligible_for_discounts}
            onChange={(e) => set("eligible_for_discounts", e.target.checked)}
          />
          Eligible for discounts
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending || !form.name.trim()}
          onClick={onSave}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white",
            isEditing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-700 hover:bg-green-800",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isEditing ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

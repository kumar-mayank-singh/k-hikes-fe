"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  diffEventPayload,
  eventToForm,
  type EventEditForm,
} from "@/lib/event-edit-form";
import {
  useGetBatches,
  useGetEventDetail,
  useGetAdminEventPriceOptions,
  useUpdateEvent,
  useEventSubResource,
  useUploadFile,
} from "@/hooks/api/authAPIs";
import { AdminFileImage } from "@/components/components/admin-file-image";
import { INPUT_CLS, LABEL_CLS, ItemRow, getItemId } from "./event-edit-shared";
import { AddOn, Batch, PriceOption } from "@/types/eventSubConstants";

const ALLOWED_IMAGE_EXT = /\.(png|jpg|jpeg)$/i;

type FieldEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

interface TicketForm {
  name: string;
  price: string;
  batch_id: string;
  eligible_for_discounts: boolean;
  is_active: boolean;
}

interface AddOnFormState {
  name: string;
  price: string;
  file_id: string;
}

const emptyTicketForm: TicketForm = {
  name: "",
  price: "",
  batch_id: "",
  eligible_for_discounts: true,
  is_active: true,
};

const emptyAddOnForm: AddOnFormState = {
  name: "",
  price: "",
  file_id: "",
};

function ticketFormFromItem(opt: PriceOption): TicketForm {
  return {
    name: opt.name,
    price: String(opt.price),
    batch_id: opt.batch_ids?.[0] ?? opt.batch_id ?? "",
    eligible_for_discounts: opt.eligible_for_discounts,
    is_active: opt.is_active,
  };
}

function addOnFormFromItem(a: AddOn): AddOnFormState {
  return {
    name: a.name,
    price: String(a.price),
    file_id: a.file_id ?? "",
  };
}

function ticketFormToPayload(f: TicketForm): Record<string, unknown> {
  return {
    name: f.name,
    price: parseFloat(f.price) || 0,
    batch_ids: f.batch_id.trim() ? [f.batch_id.trim()] : [],
    eligible_for_discounts: f.eligible_for_discounts,
    is_active: f.is_active,
  };
}

function priceOptionBatchIds(opt: PriceOption): string[] {
  if (opt.batch_ids?.length) return opt.batch_ids;
  if (opt.batch_id) return [opt.batch_id];
  return [];
}

function batchOptionLabel(b: Batch): string {
  if (b.nickname?.trim()) return b.nickname;
  if (!b.start_date) return "Untitled departure";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const start = new Date(b.start_date).toLocaleDateString("en-IN", opts);
  const end = b.end_date
    ? new Date(b.end_date).toLocaleDateString("en-IN", opts)
    : start;
  return start === end ? start : `${start} — ${end}`;
}

function addOnFormToPayload(f: AddOnFormState): Record<string, unknown> {
  return {
    name: f.name,
    price: parseFloat(f.price) || 0,
    file_id: f.file_id.trim() || null,
  };
}

function PricingValue({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export function EventEditPricingSection({
  eventId,
  form,
  bind,
}: {
  eventId: string;
  form: EventEditForm;
  bind: (key: Exclude<keyof EventEditForm, "category_ids">) => {
    value: string;
    onChange: (e: FieldEvent) => void;
  };
}): React.ReactElement | null {
  const { data: event } = useGetEventDetail(eventId);
  const { data: batches = [] } = useGetBatches(eventId);
  const {
    data: ticketOptions = [],
    isLoading: isPriceOptionsLoading,
  } = useGetAdminEventPriceOptions(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const priceOptions = useEventSubResource(eventId, "price-options");
  const addOns = useEventSubResource(eventId, "add-ons");
  const uploadFile = useUploadFile();

  const batchById = useMemo(() => {
    const map = new Map<string, Batch>();
    for (const b of batches) map.set(b.batch_id, b);
    return map;
  }, [batches]);

  const [isEditingPricing, setIsEditingPricing] = useState(false);

  const [ticketForm, setTicketForm] = useState<TicketForm>(emptyTicketForm);
  const [ticketEditId, setTicketEditId] = useState<string | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);

  const [addOnForm, setAddOnForm] = useState<AddOnFormState>(emptyAddOnForm);
  const [addOnEditId, setAddOnEditId] = useState<string | null>(null);
  const [isAddOnFormOpen, setIsAddOnFormOpen] = useState(false);
  const [addOnImageFile, setAddOnImageFile] = useState<File | null>(null);

  if (!event) return null;

  // GST is mutually exclusive with the CGST + SGST split: populate one side, not both.
  const gstFilled = (parseFloat(form.gst_percent) || 0) > 0;
  const cgstFilled = (parseFloat(form.cgst_percent) || 0) > 0;
  const sgstFilled = (parseFloat(form.sgst_percent) || 0) > 0;
  const taxError =
    gstFilled && (cgstFilled || sgstFilled)
      ? "Use either GST % or CGST % + SGST % — not both."
      : null;

  const handleSavePricing = (): void => {
    if (taxError) return;
    updateEvent.mutate(diffEventPayload(eventToForm(event), form), {
      onSuccess: () => setIsEditingPricing(false),
    });
  };

  const cancelPricingEdit = (): void => {
    setIsEditingPricing(false);
  };

  const openTicketAdd = (): void => {
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
    const payload = ticketFormToPayload(ticketForm);
    if (ticketEditId) {
      priceOptions.update.mutate(
        { itemId: ticketEditId, payload },
        { onSuccess: closeTicketForm },
      );
    } else {
      priceOptions.add.mutate(payload, { onSuccess: closeTicketForm });
    }
  };

  const openAddOnAdd = (): void => {
    setAddOnEditId(null);
    setAddOnForm(emptyAddOnForm);
    setAddOnImageFile(null);
    setIsAddOnFormOpen(true);
  };
  const startAddOnEdit = (a: AddOn): void => {
    setAddOnEditId(getItemId(a));
    setAddOnForm(addOnFormFromItem(a));
    setAddOnImageFile(null);
    setIsAddOnFormOpen(true);
  };
  const closeAddOnForm = (): void => {
    setAddOnEditId(null);
    setAddOnForm(emptyAddOnForm);
    setAddOnImageFile(null);
    setIsAddOnFormOpen(false);
  };
  const handleAddOnSave = async (): Promise<void> => {
    try {
      const form = { ...addOnForm };
      if (addOnImageFile) {
        const uploaded = await uploadFile.mutateAsync(addOnImageFile);
        form.file_id = uploaded.id;
      }
      const payload = addOnFormToPayload(form);
      if (addOnEditId) {
        await addOns.update.mutateAsync({ itemId: addOnEditId, payload });
      } else {
        await addOns.add.mutateAsync(payload);
      }
      closeAddOnForm();
    } catch {
      // surfaced via mutation onError toast
    }
  };

  const isAddOnSaving =
    uploadFile.isPending || addOns.add.isPending || addOns.update.isPending;

  const addOnItems = event.add_ons ?? [];

  return (
    <div className="space-y-6">
      {/* ── Base Pricing ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Base Pricing</h2>
          {!isEditingPricing && (
            <button
              type="button"
              onClick={() => setIsEditingPricing(true)}
              className="text-gray-600 hover:bg-gray-100 p-1.5 rounded"
              aria-label="Edit base pricing"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingPricing ? (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLS}>Display Price</label>
                <input type="number" step="0.01" {...bind("display_price")} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Strike Price</label>
                <input type="number" step="0.01" {...bind("strike_price")} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Booking %</label>
                <input type="number" {...bind("booking_amount_percent")} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>GST %</label>
                <input
                  type="number"
                  step="1"
                  {...bind("gst_percent")}
                  className={cn(INPUT_CLS, taxError && gstFilled && "border-red-400")}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>CGST %</label>
                <input
                  type="number"
                  step="1"
                  {...bind("cgst_percent")}
                  className={cn(INPUT_CLS, taxError && cgstFilled && "border-red-400")}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>SGST %</label>
                <input
                  type="number"
                  step="1"
                  {...bind("sgst_percent")}
                  className={cn(INPUT_CLS, taxError && sgstFilled && "border-red-400")}
                />
              </div>
            </div>
            {taxError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {taxError}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleSavePricing}
                disabled={updateEvent.isPending || taxError !== null}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateEvent.isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelPricingEdit}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <PricingValue label="Display Price" value={form.display_price ? `₹${form.display_price}` : ""} />
            <PricingValue label="Strike Price" value={form.strike_price ? `₹${form.strike_price}` : ""} />
            <PricingValue label="Booking %" value={form.booking_amount_percent ? `${form.booking_amount_percent}%` : ""} />
            <PricingValue label="GST %" value={form.gst_percent ? `${form.gst_percent}%` : ""} />
            <PricingValue label="CGST %" value={form.cgst_percent ? `${form.cgst_percent}%` : ""} />
            <PricingValue label="SGST %" value={form.sgst_percent ? `${form.sgst_percent}%` : ""} />
          </div>
        )}
      </div>

      {/* ── Ticket Options ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Ticket Options</h2>

        {isPriceOptionsLoading ? (
          <p className="text-sm text-gray-500 py-2">Loading ticket options…</p>
        ) : ticketOptions.length > 0 ? (
          ticketOptions.map((opt) => {
            const id = getItemId(opt);
            const linkedIds = priceOptionBatchIds(opt);
            const linkedBatches = linkedIds
              .map((batchId) => batchById.get(batchId))
              .filter((b): b is Batch => b != null);
            const hasUnknownBatch =
              linkedIds.length > 0 && linkedBatches.length === 0;
            return (
              <ItemRow
                key={id}
                onDelete={() => priceOptions.remove.mutate(id)}
                onEdit={() => startTicketEdit(opt)}
              >
                <span className="font-medium">{opt.name}</span>
                <span className="ml-2 text-sm text-gray-600">
                  ₹{opt.price.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "ml-2 text-xs px-2 py-0.5 rounded-full",
                    linkedBatches.length > 0
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {linkedBatches.length > 0
                    ? `Departure: ${linkedBatches.map(batchOptionLabel).join(", ")}`
                    : hasUnknownBatch
                      ? "Departure: unknown"
                      : "All departures"}
                </span>
                {!opt.is_active && (
                  <span className="ml-2 text-xs text-red-600 font-medium">
                    Inactive
                  </span>
                )}
              </ItemRow>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 py-2">No ticket options added yet.</p>
        )}

        {isTicketFormOpen ? (
          <TicketOptionFormFields
            form={ticketForm}
            onChange={setTicketForm}
            batches={batches}
            isEditing={ticketEditId !== null}
            isPending={
              ticketEditId
                ? priceOptions.update.isPending
                : priceOptions.add.isPending
            }
            onSave={handleTicketSave}
            onCancel={closeTicketForm}
          />
        ) : (
          <button
            type="button"
            onClick={openTicketAdd}
            className="flex items-center gap-1.5 mt-3 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Ticket Option
          </button>
        )}
      </div>

      {/* ── Add-ons ── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Add-ons</h2>

        {addOnItems.length > 0 ? (
          addOnItems.map((addon) => {
            const id = getItemId(addon);
            return (
              <ItemRow
                key={id}
                onDelete={() => addOns.remove.mutate(id)}
                onEdit={() => startAddOnEdit(addon)}
              >
                <div className="flex items-center gap-3">
                  {addon.file_id && (
                    <AdminFileImage
                      fileId={addon.file_id}
                      alt={addon.name}
                      className="h-10 w-10 rounded-md object-cover bg-gray-100 shrink-0"
                    />
                  )}
                  <div>
                    <span className="font-medium">{addon.name}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      ₹{addon.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </ItemRow>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 py-2">No add-ons added yet.</p>
        )}

        {isAddOnFormOpen ? (
          <AddOnFormFields
            form={addOnForm}
            onChange={setAddOnForm}
            isEditing={addOnEditId !== null}
            isPending={isAddOnSaving}
            imageFile={addOnImageFile}
            onImageChange={setAddOnImageFile}
            onSave={handleAddOnSave}
            onCancel={closeAddOnForm}
          />
        ) : (
          <button
            type="button"
            onClick={openAddOnAdd}
            className="flex items-center gap-1.5 mt-3 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Add-on
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Shared form blocks (kept in same file to stay co-located & minimal) ── */

function TicketOptionFormFields({
  form,
  onChange,
  batches,
  isEditing,
  isPending,
  onSave,
  onCancel,
}: {
  form: TicketForm;
  onChange: React.Dispatch<React.SetStateAction<TicketForm>>;
  batches: Batch[];
  isEditing: boolean;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}): React.ReactElement {
  const set = <K extends keyof TicketForm>(k: K, v: TicketForm[K]): void =>
    onChange((f) => ({ ...f, [k]: v }));

  const selectableBatches = batches.filter((b) => b.price_override === true);

  const showStaleBatchOption =
    !!form.batch_id &&
    !selectableBatches.some((b) => b.batch_id === form.batch_id);

  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-3 space-y-3">
      <p className="text-sm font-semibold text-gray-800">
        {isEditing ? "Edit ticket option" : "Add ticket option"}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
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
        <div>
          <label className={LABEL_CLS}>Departure</label>
          <select
            value={form.batch_id}
            onChange={(e) => set("batch_id", e.target.value)}
            className={INPUT_CLS}
          >
            <option value="">All departures</option>
            {selectableBatches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {batchOptionLabel(b)}
              </option>
            ))}
            {showStaleBatchOption && (
              <option value={form.batch_id}>
                Unknown departure ({form.batch_id})
              </option>
            )}
          </select>
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
            "flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white",
            isEditing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-700 hover:bg-green-800",
          )}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isEditing ? "Save" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

function AddOnFormFields({
  form,
  onChange,
  isEditing,
  isPending,
  imageFile,
  onImageChange,
  onSave,
  onCancel,
}: {
  form: AddOnFormState;
  onChange: React.Dispatch<React.SetStateAction<AddOnFormState>>;
  isEditing: boolean;
  isPending: boolean;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
}): React.ReactElement {
  const set = <K extends keyof AddOnFormState>(
    k: K,
    v: AddOnFormState[K],
  ): void => onChange((f) => ({ ...f, [k]: v }));

  const inputRef = useRef<HTMLInputElement>(null);
  const hasExistingImage = Boolean(form.file_id.trim());

  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-3 space-y-3">
      <p className="text-sm font-semibold text-gray-800">
        {isEditing ? "Edit add-on" : "Add add-on"}
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLS}>Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={INPUT_CLS}
            placeholder="e.g. Tent upgrade"
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
        <div>
          <label className={LABEL_CLS}>Image</label>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : hasExistingImage ? (
                <AdminFileImage
                  fileId={form.file_id}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <ImagePlus className="h-5 w-5" />
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file && !ALLOWED_IMAGE_EXT.test(file.name)) return;
                onImageChange(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm"
            >
              {imageFile || hasExistingImage ? "Change" : "Upload"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending || !form.name.trim()}
          onClick={onSave}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white",
            isEditing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-700 hover:bg-green-800",
          )}
        >
          {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isEditing ? "Save" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

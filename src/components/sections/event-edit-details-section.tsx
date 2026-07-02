"use client";

import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventEditForm } from "@/lib/event-edit-form";
import { Category } from "@/types/categoryConstants";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { AdminFileImage } from "@/components/components/admin-file-image";
import { useFileUrl } from "@/hooks/api/authAPIs";
import { INPUT_CLS, LABEL_CLS } from "./event-edit-shared";
import {
  EventOtherPhotosField,
  type ExistingEventPhoto,
} from "@/components/sections/event-other-photos-field";

type FieldEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

/** Compact preview tiles — fixed size so they don’t dominate viewport height (esp. stacked on mobile) */
const MEDIA_PREVIEW =
  "mb-2 mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-md border border-gray-200 sm:h-36 sm:w-36";

export function EventEditDetailsSection({
  categories,
  bind,
  categoryIds,
  onCategoryIdsChange,
  onSave,
  isPending,
  coverImageId,
  itineraryFileId,
  coverImageFile,
  itineraryFile,
  onCoverImageChange,
  onItineraryChange,
  existingOtherPhotos,
  pendingOtherPhotos,
  onAddOtherPhotos,
  onRemoveExistingOtherPhoto,
  onRemovePendingOtherPhoto,
}: {
  categories: Category[];
  bind: (key: Exclude<keyof EventEditForm, "category_ids">) => {
    value: string;
    onChange: (e: FieldEvent) => void;
  };
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
  onSave: () => void | Promise<void>;
  isPending: boolean;
  coverImageId: string | null;
  itineraryFileId: string | null;
  coverImageFile: File | null;
  itineraryFile: File | null;
  onCoverImageChange: (file: File | null) => void;
  onItineraryChange: (file: File | null) => void;
  existingOtherPhotos: ExistingEventPhoto[];
  pendingOtherPhotos: File[];
  onAddOtherPhotos: (files: File[]) => void;
  onRemoveExistingOtherPhoto: (fileId: string) => void;
  onRemovePendingOtherPhoto: (index: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLS}>Name</label>
          <input {...bind("name")} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS} htmlFor="event-edit-categories">
            Category
          </label>
          <CategoryMultiSelect
            id="event-edit-categories"
            categories={categories}
            value={categoryIds}
            onChange={onCategoryIdsChange}
            disabled={isPending}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Slots</label>
          <input type="number" {...bind("slots")} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Sort Order</label>
          <input
            type="number"
            {...bind("sort_order")}
            className={INPUT_CLS}
            placeholder="Lower numbers appear first"
          />
          <p className="mt-1 text-xs text-gray-500">
            Controls listing order. Lower values appear first.
          </p>
        </div>
      </div>

      <div>
        <label className={LABEL_CLS}>Description</label>
        <textarea rows={4} {...bind("description")} className={INPUT_CLS} />
      </div>

      <EventOtherPhotosField
        idPrefix="event-edit"
        existingPhotos={existingOtherPhotos}
        pendingFiles={pendingOtherPhotos}
        onAddFiles={onAddOtherPhotos}
        onRemoveExisting={onRemoveExistingOtherPhoto}
        onRemovePending={onRemovePendingOtherPhoto}
        disabled={isPending}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLS}>Cover Image</label>
          {coverImageId ? (
            <div className={MEDIA_PREVIEW}>
              <AdminFileImage
                fileId={coverImageId}
                alt="Current cover"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={cn(
                MEDIA_PREVIEW,
                "flex items-center justify-center border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500",
              )}
            >
              No cover image uploaded
            </div>
          )}
          <input
            id="event-cover-image-input"
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => onCoverImageChange(e.target.files?.[0] ?? null)}
          />
          <label
            htmlFor="event-cover-image-input"
            className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Change
          </label>
          {coverImageFile && (
            <p className="mt-1 text-xs text-green-700">
              New file selected: {coverImageFile.name}
            </p>
          )}
        </div>
        <div>
          <label className={LABEL_CLS}>Itinerary document</label>
          <ItineraryPdfPreview fileId={itineraryFileId} />
          <input
            id="event-itinerary-pdf-input"
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={(e) => onItineraryChange(e.target.files?.[0] ?? null)}
          />
          <label
            htmlFor="event-itinerary-pdf-input"
            className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Change
          </label>
          {itineraryFile && (
            <p className="mt-1 text-xs text-green-700">
              New file selected: {itineraryFile.name}
            </p>
          )}
        </div>
        <div>
          <label className={LABEL_CLS}>Inclusions</label>
          <textarea rows={4} {...bind("inclusions")} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Exclusions</label>
          <textarea rows={4} {...bind("exclusions")} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Terms & Conditions</label>
          <textarea rows={4} {...bind("policy")} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Things to Carry</label>
          <textarea
            rows={4}
            {...bind("things_to_carry")}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {isPending ? "Saving..." : "Save and Next"}
      </button>
    </div>
  );
}

function ItineraryPdfPreview({
  fileId,
}: {
  fileId: string | null;
}): React.ReactElement {
  const { data, isLoading } = useFileUrl(fileId);
  const placeholderClass = cn(
    MEDIA_PREVIEW,
    "flex items-center justify-center border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500",
  );

  if (!fileId) {
    return <div className={placeholderClass}>No itinerary PDF uploaded</div>;
  }
  if (isLoading || !data?.file_url) {
    return <div className={placeholderClass}>Loading itinerary…</div>;
  }
  return (
    <a
      href={data.file_url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        MEDIA_PREVIEW,
        "flex items-center justify-center bg-gray-50 px-3 text-center text-sm font-medium text-blue-700 underline underline-offset-2",
      )}
    >
      Open current itinerary PDF
    </a>
  );
}

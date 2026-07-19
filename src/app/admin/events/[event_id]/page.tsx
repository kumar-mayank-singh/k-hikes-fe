"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetEventDetail,
  useGetCategories,
  useUploadFile,
  useUploadFiles,
  useDeleteUploadedFile,
  useUpdateEvent,
} from "@/hooks/api/authAPIs";
import { eventOtherPhotoFileIds } from "@/lib/event-photos";
import {
  eventToForm,
  diffEventPayload,
  type EventEditForm,
} from "@/lib/event-edit-form";
import { EventEditDetailsSection } from "@/components/sections/event-edit-details-section";
import { EventEditItinerarySection } from "@/components/sections/event-edit-itinerary-section";
import { EventEditPricingSection } from "@/components/sections/event-edit-pricing-section";
import { EventEditDatesSection } from "@/components/sections/event-edit-dates-section";
import { EventEditPickupSection } from "@/components/sections/event-edit-pickup-section";
import { EventEditFormFieldsSection } from "@/components/sections/event-edit-form-fields-section";
import { toast } from "sonner";

const TABS = [
  { key: "details", label: "Basic Details" },
  { key: "itinerary", label: "Itinerary Details" },
  { key: "dates", label: "Departures" },
  { key: "pricing", label: "Pricing & Options" },
  { key: "pickup", label: "Pickup Points" },
  { key: "form", label: "Booking Form" },
];

export default function EventEditPage() {
  const params = useParams();
  const eventId = params.event_id as string;

  const { data: event, isLoading, isError } = useGetEventDetail(eventId);
  const { data: categories = [] } = useGetCategories();
  const uploadFile = useUploadFile();
  const uploadFiles = useUploadFiles();
  const deleteUploadedFile = useDeleteUploadedFile();
  const updateEvent = useUpdateEvent(eventId);

  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState<EventEditForm>({} as EventEditForm);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [itineraryFile, setItineraryFile] = useState<File | null>(null);
  const [currentCoverImageId, setCurrentCoverImageId] = useState<string | null>(
    null,
  );
  const [currentItineraryFileId, setCurrentItineraryFileId] = useState<
    string | null
  >(null);
  const [otherPhotoIds, setOtherPhotoIds] = useState<string[]>([]);
  const [pendingOtherPhotos, setPendingOtherPhotos] = useState<File[]>([]);
  const [removedOtherPhotoIds, setRemovedOtherPhotoIds] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (event) {
      setForm(eventToForm(event));
      setCurrentCoverImageId(event.cover_image_id ?? null);
      setCurrentItineraryFileId(event.pdf_file_id ?? null);
      setOtherPhotoIds(eventOtherPhotoFileIds(event.other_photos));
      setPendingOtherPhotos([]);
      setRemovedOtherPhotoIds([]);
    }
  }, [event]);

  type FieldEvent = React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;

  const bind = (key: Exclude<keyof EventEditForm, "category_ids">) => ({
    value: form[key] ?? "",
    onChange: (e: FieldEvent) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const handleSaveDetails = async (): Promise<void> => {
    if (!event) return;
    try {
      const payload = diffEventPayload(eventToForm(event), form);

      if (coverImageFile) {
        const uploaded = await uploadFile.mutateAsync(coverImageFile);
        payload.cover_image_id = uploaded.id;
      }

      if (itineraryFile) {
        const uploaded = await uploadFile.mutateAsync(itineraryFile);
        payload.pdf_file_id = uploaded.id;
      }

      const galleryChanged =
        pendingOtherPhotos.length > 0 || removedOtherPhotoIds.length > 0;
      let finalOtherPhotos = otherPhotoIds;

      if (galleryChanged) {
        for (const fileId of removedOtherPhotoIds) {
          await deleteUploadedFile.mutateAsync(fileId);
        }
        const uploadedPhotos = await uploadFiles.mutateAsync(pendingOtherPhotos);
        const keptOtherPhotoIds = otherPhotoIds.filter(
          (id) => !removedOtherPhotoIds.includes(id),
        );
        finalOtherPhotos = [
          ...keptOtherPhotoIds,
          ...uploadedPhotos.map((u) => u.id),
        ];
        payload.other_photos =
          finalOtherPhotos.length > 0 ? finalOtherPhotos : null;
      }

      await updateEvent.mutateAsync(payload);

      if (payload.cover_image_id) {
        setCurrentCoverImageId(payload.cover_image_id);
        setCoverImageFile(null);
      }
      if (payload.pdf_file_id) {
        setCurrentItineraryFileId(payload.pdf_file_id);
        setItineraryFile(null);
      }

      setOtherPhotoIds(finalOtherPhotos);
      setPendingOtherPhotos([]);
      setRemovedOtherPhotoIds([]);

      setActiveTab(TABS[1].key);
    } catch {
      toast.error("Failed to save details");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center text-gray-500">
        Event not found
      </div>
    );
  }

  const status = event.is_draft ? "draft" : "live";

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/admin/events"
          className="rounded-lg p-2 hover:bg-gray-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            status === "live"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700",
          )}
        >
          {status}
        </span>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto rounded-lg bg-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
      {activeTab === "details" && (
        <EventEditDetailsSection
          categories={categories}
          bind={bind}
          categoryIds={form.category_ids ?? []}
          onCategoryIdsChange={(ids) =>
            setForm((prev) => ({ ...prev, category_ids: ids }))
          }
          onSave={handleSaveDetails}
          isPending={
            updateEvent.isPending ||
            uploadFile.isPending ||
            uploadFiles.isPending ||
            deleteUploadedFile.isPending
          }
          coverImageId={currentCoverImageId}
          itineraryFileId={currentItineraryFileId}
          coverImageFile={coverImageFile}
          itineraryFile={itineraryFile}
          onCoverImageChange={setCoverImageFile}
          onItineraryChange={setItineraryFile}
          existingOtherPhotos={otherPhotoIds
            .filter((id) => !removedOtherPhotoIds.includes(id))
            .map((fileId) => ({ fileId }))}
          pendingOtherPhotos={pendingOtherPhotos}
          onAddOtherPhotos={(files) =>
            setPendingOtherPhotos((prev) => [...prev, ...files])
          }
          onRemoveExistingOtherPhoto={(fileId) => {
            setRemovedOtherPhotoIds((prev) =>
              prev.includes(fileId) ? prev : [...prev, fileId],
            );
          }}
          onRemovePendingOtherPhoto={(index) => {
            setPendingOtherPhotos((prev) => {
              const next = [...prev];
              next.splice(index, 1);
              return next;
            });
          }}
        />
      )}

      {activeTab === "itinerary" && (
        <EventEditItinerarySection eventId={eventId} />
      )}

      {activeTab === "dates" && <EventEditDatesSection eventId={eventId} />}

      {activeTab === "pricing" && (
        <EventEditPricingSection eventId={eventId} form={form} bind={bind} />
      )}

      {activeTab === "pickup" && <EventEditPickupSection eventId={eventId} />}

      {activeTab === "form" && (
        <EventEditFormFieldsSection eventId={eventId} />
      )}
      </div>
    </div>
  );
}

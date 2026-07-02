"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { EventOtherPhotosField } from "@/components/sections/event-other-photos-field";

import {
  CreateEventFormValues,
  createEventSchema,
} from "@/lib/validation/schema";
import { Category } from "@/types/categoryConstants";
import {
  useCreateEvent,
  useUploadFile,
  useUploadFiles,
} from "@/hooks/api/authAPIs";

interface CreateEventFormProps {
  categories: Category[];
  onCancel: () => void;
}

const ALLOWED_IMAGE_EXT = /\.(png|jpg|jpeg)$/i;
const ALLOWED_PDF_EXT = /\.pdf$/i;

const mutedFileZoneClass =
  "rounded-lg border border-dashed border-muted-foreground/25 bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/55";

export function CreateEventForm({
  categories,
  onCancel,
}: CreateEventFormProps) {
  const router = useRouter();
  const { mutateAsync: createEvent, isPending: isCreatingEvent } =
    useCreateEvent();
  const { mutateAsync: uploadFile, isPending: isUploadingFile } =
    useUploadFile();
  const { mutateAsync: uploadFiles, isPending: isUploadingFiles } =
    useUploadFiles();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      slots: "",
      display_price: "",
      strike_price: "",
      cover_image: undefined,
      other_photos: [],
      itinerary_document: undefined,
      category_ids: [],
    },
  });

  const assignCoverFile = useCallback(
    (file: File | undefined, onChange: (f: File | undefined) => void) => {
      if (!file) {
        onChange(undefined);
        form.clearErrors("cover_image");
        return;
      }
      if (!ALLOWED_IMAGE_EXT.test(file.name)) {
        form.setError("cover_image", {
          type: "manual",
          message: "Only PNG or JPG images are allowed",
        });
        return;
      }
      form.clearErrors("cover_image");
      onChange(file);
    },
    [form],
  );

  const assignPdfFile = useCallback(
    (file: File | undefined, onChange: (f: File | undefined) => void) => {
      if (!file) {
        onChange(undefined);
        form.clearErrors("itinerary_document");
        return;
      }
      if (!ALLOWED_PDF_EXT.test(file.name)) {
        form.setError("itinerary_document", {
          type: "manual",
          message: "Only PDF files are allowed",
        });
        return;
      }
      form.clearErrors("itinerary_document");
      onChange(file);
    },
    [form],
  );

  const onSubmit = async (values: CreateEventFormValues) => {
    try {
      let cover_image_id: string | null = null;
      if (values.cover_image) {
        const uploaded = await uploadFile(values.cover_image);
        cover_image_id = uploaded.id;
      }

      let pdf_file_id: string | null = null;
      if (values.itinerary_document) {
        const uploaded = await uploadFile(values.itinerary_document);
        pdf_file_id = uploaded.id;
      }

      let other_photos: string[] = [];
      if (values.other_photos && values.other_photos.length > 0) {
        const uploaded = await uploadFiles(values.other_photos);
        other_photos = uploaded.map((u) => u.id);
      }

      const event = await createEvent({
        name: values.name,
        description: values.description?.trim()
          ? values.description.trim()
          : null,
        slots: values.slots ? parseInt(values.slots, 10) : null,
        display_price: values.display_price
          ? parseFloat(values.display_price)
          : null,
        strike_price: values.strike_price
          ? parseFloat(values.strike_price)
          : null,
        category_ids:
          values.category_ids && values.category_ids.length > 0
            ? values.category_ids
            : null,
        cover_image_id,
        pdf_file_id,
        other_photos: other_photos.length > 0 ? other_photos : null,
      });

      onCancel();
      router.push(`/admin/events/${event.event_id}`);
    } catch {
      toast.error("Failed to create event");
    }
  };

  const isBusy =
    form.formState.isSubmitting ||
    isCreatingEvent ||
    isUploadingFile ||
    isUploadingFiles;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <h2 className="text-lg font-bold mb-1">New Event</h2>
      <p className="text-sm text-gray-500 mb-4">
        Fill in the basics, then you'll be taken to the full editor with all
        tabs (pricing, dates, pickup points, booking form).
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup className="grid md:grid-cols-2 gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-event-name">
                  Event Name *
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="create-event-name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="category_ids"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-event-category">
                  Category
                </FieldLabel>
                <FieldContent>
                  <CategoryMultiSelect
                    id="create-event-category"
                    categories={categories}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    disabled={isBusy}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="display_price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-event-display-price">
                  Display Price
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="create-event-display-price"
                    type="number"
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="strike_price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-event-strike-price">
                  Strike Price
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="create-event-strike-price"
                    type="number"
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="slots"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-event-slots">Slots</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    id="create-event-slots"
                    type="number"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="cover_image"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="create-event-cover-image-input">
                  Cover Image
                </FieldLabel>
                <FieldContent>
                  <div
                    className={cn(
                      mutedFileZoneClass,
                      fieldState.invalid && "border-destructive/50",
                      isBusy && "pointer-events-none opacity-60",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        disabled={isBusy}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        Choose file
                      </Button>
                      <span className="min-w-0 truncate text-sm text-muted-foreground">
                        {field.value?.name ??
                          "PNG or JPG"}
                      </span>
                    </div>
                  </div>
                  <input
                    ref={coverInputRef}
                    id="create-event-cover-image-input"
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    className="sr-only"
                    tabIndex={-1}
                    aria-invalid={fieldState.invalid}
                    disabled={isBusy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      assignCoverFile(file, field.onChange);
                      e.target.value = "";
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            name="itinerary_document"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="create-event-itinerary-input">
                  Itinerary document
                </FieldLabel>
                <FieldContent>
                  <div
                    className={cn(
                      mutedFileZoneClass,
                      fieldState.invalid && "border-destructive/50",
                      isBusy && "pointer-events-none opacity-60",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        disabled={isBusy}
                        onClick={() => pdfInputRef.current?.click()}
                      >
                        Choose file
                      </Button>
                      <span className="min-w-0 truncate text-sm text-muted-foreground">
                        {field.value?.name ??
                          "PDF only"}
                      </span>
                    </div>
                  </div>
                  <input
                    ref={pdfInputRef}
                    id="create-event-itinerary-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="sr-only"
                    tabIndex={-1}
                    aria-invalid={fieldState.invalid}
                    disabled={isBusy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      assignPdfFile(file, field.onChange);
                      e.target.value = "";
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <Controller
          name="other_photos"
          control={form.control}
          render={({ field, fieldState }) => (
            <EventOtherPhotosField
              idPrefix="create-event"
              pendingFiles={field.value ?? []}
              onAddFiles={(files) =>
                field.onChange([...(field.value ?? []), ...files])
              }
              onRemovePending={(index) => {
                const next = [...(field.value ?? [])];
                next.splice(index, 1);
                field.onChange(next);
              }}
              disabled={isBusy}
              invalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-event-description">
                Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...field}
                  id="create-event-description"
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isBusy}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            {isBusy ? "Saving..." : "Create & Continue Editing"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

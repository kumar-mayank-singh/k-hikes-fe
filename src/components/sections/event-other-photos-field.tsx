"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminFileImage } from "@/components/components/admin-file-image";
import { cn } from "@/lib/utils";

const ALLOWED_IMAGE_EXT = /\.(png|jpg|jpeg)$/i;

export interface ExistingEventPhoto {
  fileId: string;
}

interface EventOtherPhotosFieldProps {
  idPrefix: string;
  label?: string;
  existingPhotos?: ExistingEventPhoto[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting?: (fileId: string) => void;
  onRemovePending: (index: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}

function filterValidImages(files: FileList | File[]): File[] {
  return Array.from(files).filter((f) => ALLOWED_IMAGE_EXT.test(f.name));
}

export function EventOtherPhotosField({
  idPrefix,
  label = "Gallery photos",
  existingPhotos = [],
  pendingFiles,
  onAddFiles,
  onRemoveExisting,
  onRemovePending,
  disabled = false,
  invalid = false,
  errorMessage,
}: EventOtherPhotosFieldProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasPhotos = existingPhotos.length > 0 || pendingFiles.length > 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        PNG or JPG. Add multiple images for the event gallery.
      </p>

      <div
        className={cn(
          "rounded-lg border border-dashed border-muted-foreground/25 bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/55",
          invalid && "border-destructive/50",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Add images
          </Button>
          <span className="text-sm text-muted-foreground">
            {hasPhotos
              ? `${existingPhotos.length + pendingFiles.length} image(s)`
              : "No gallery images yet"}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        id={`${idPrefix}-other-photos-input`}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        multiple
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(e) => {
          const picked = e.target.files;
          if (picked?.length) {
            const valid = filterValidImages(picked);
            if (valid.length > 0) onAddFiles(valid);
          }
          e.target.value = "";
        }}
      />

      {hasPhotos && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingPhotos.map((photo) => (
            <li
              key={photo.fileId}
              className="relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <AdminFileImage
                fileId={photo.fileId}
                alt=""
                className="h-full w-full object-cover"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center bg-stone-900/80 text-white hover:bg-stone-900"
                  onClick={() => onRemoveExisting(photo.fileId)}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
          {pendingFiles.map((file, index) => (
            <li
              key={`pending-${file.name}-${file.size}-${index}`}
              className="relative aspect-square overflow-hidden rounded-md bg-muted"
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                aria-label="Remove image"
                className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center bg-stone-900/80 text-white hover:bg-stone-900"
                onClick={() => onRemovePending(index)}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {invalid && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

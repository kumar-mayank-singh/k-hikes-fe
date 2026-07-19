"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRequestItineraryPdfMutation } from "@/hooks/api/publicAPIs";
import { leadPdfSchema, type LeadPdfInput } from "@/lib/validation/schema";

interface EventItineraryDownloadDialogProps {
  eventId: string;
  eventName: string;
  /**
   * `true` — download the itinerary PDF (opens `download_url`).
   * `false` — unlock event details (API still called; `download_url` ignored).
   */
  downloadItinerary: boolean;
  /** Called after a successful submit when `downloadItinerary` is `false`. */
  onSuccess?: () => void;
}

const FORM_DEFAULTS: LeadPdfInput = { name: "", phone: "" };

export function EventItineraryDownloadDialog({
  eventId,
  eventName,
  downloadItinerary,
  onSuccess,
}: EventItineraryDownloadDialogProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const { mutateAsync, isPending } = useRequestItineraryPdfMutation();

  const form = useForm<LeadPdfInput>({
    resolver: zodResolver(leadPdfSchema),
    defaultValues: FORM_DEFAULTS,
  });

  const handleOpenChange = (next: boolean): void => {
    setOpen(next);
    if (!next) form.reset(FORM_DEFAULTS);
  };

  const onSubmit = async (values: LeadPdfInput): Promise<void> => {
    const res = await mutateAsync({
      event_id: eventId,
      name: values.name.trim(),
      phone: values.phone.trim(),
    });

    if (downloadItinerary) {
      if (!res.success || !res.download_url) {
        toast.error("Could not fetch the itinerary. Please try again.");
        return;
      }

      window.open(res.download_url, "_blank", "noopener,noreferrer");
      toast.success("Itinerary opened in a new tab.");
      handleOpenChange(false);
      return;
    }

    if (!res.success) {
      toast.error("Could not unlock event details. Please try again.");
      return;
    }

    toast.success("Event details unlocked.");
    onSuccess?.();
    form.reset(FORM_DEFAULTS);
  };

  if (!downloadItinerary) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 max-w-md mx-auto w-full">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Unlock event details
            </h2>
            <p className="text-sm text-stone-500">
              Share a couple of details to view the full itinerary for{" "}
              <strong>{eventName}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lead-unlock-name">Full name</FieldLabel>
                  <Input
                    {...field}
                    id="lead-unlock-name"
                    placeholder="e.g. Aditi Rao"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lead-unlock-phone">
                    Phone number
                  </FieldLabel>
                  <Input
                    {...field}
                    id="lead-unlock-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+91 98XXXXXXXX"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">Back</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending || form.formState.isSubmitting}
              className="bg-emerald-700 text-white hover:bg-emerald-800 w-full sm:flex-1"
            >
              {isPending ? "Sending…" : "Continue"}
            </Button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            Detailed itinerary
          </h2>
          <p className="text-sm text-stone-500">
            Day-by-day plan, what to expect and what we&apos;ve packed in.
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button
          type="button"
          size="lg"
          onClick={() => setOpen(true)}
          className="bg-emerald-700 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/25 px-5 py-3 h-auto rounded-xl font-bold w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Download itinerary
        </Button>

        <DialogContent className="sm:max-w-md">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Download itinerary</DialogTitle>
              <DialogDescription>
                Share a couple of details and we&apos;ll send you the itinerary
                for <strong>{eventName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="gap-4 py-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead-pdf-name">Full name</FieldLabel>
                    <Input
                      {...field}
                      id="lead-pdf-name"
                      placeholder="e.g. Aditi Rao"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead-pdf-phone">Phone number</FieldLabel>
                    <Input
                      {...field}
                      id="lead-pdf-phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 98XXXXXXXX"
                      autoComplete="tel"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending || form.formState.isSubmitting}
                className="bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {isPending ? "Sending…" : "Get itinerary"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

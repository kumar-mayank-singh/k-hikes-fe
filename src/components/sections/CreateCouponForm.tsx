"use client";

import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetBatches } from "@/hooks/api/authAPIs";
import { CreateCouponFormProps } from "@/types/couponConstants";
import { type Batch } from "@/types/eventSubConstants";
import { cn } from "@/lib/utils";

function batchOptionLabel(batch: Batch): string {
  if (batch.nickname?.trim()) return batch.nickname;
  if (!batch.start_date) return "Untitled departure";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const start = new Date(batch.start_date).toLocaleDateString("en-IN", opts);
  const end = batch.end_date
    ? new Date(batch.end_date).toLocaleDateString("en-IN", opts)
    : start;
  return start === end ? start : `${start} — ${end}`;
}

export function CreateCouponForm({
  form,
  events,
  onSubmit,
  onCancel,
  isPending,
  className,
}: CreateCouponFormProps): React.ReactElement {
  const handleSubmit = form.handleSubmit(onSubmit);
  const scope = form.watch("scope");
  const eventId = form.watch("event_id") ?? "";
  const validityType = form.watch("validity_type");
  const { data: batches = [], isLoading: batchesLoading } = useGetBatches(
    scope === "batch" ? eventId : "",
  );

  const isInitialScopeRender = useRef(true);
  useEffect(() => {
    if (isInitialScopeRender.current) {
      isInitialScopeRender.current = false;
      return;
    }
    form.setValue("event_id", "");
    form.setValue("batch_id", "");
    form.clearErrors(["event_id", "batch_id"]);
  }, [scope, form]);

  return (
    <Card className={cn("border border-gray-100", className)}>
      <CardHeader>
        <h2 className="text-lg font-bold">New Coupon</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="grid gap-4 md:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="coupon-code">Code *</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-code"
                  placeholder="e.g. TREK20"
                  {...form.register("code")}
                  aria-invalid={!!form.formState.errors.code}
                />
                {form.formState.errors.code && (
                  <FieldError errors={[form.formState.errors.code]} />
                )}
              </FieldContent>
            </Field>

            <Controller
              name="discount_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="coupon-discount-type">
                    Discount Type
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="coupon-discount-type"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">Amount (₹)</SelectItem>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="coupon-value">Value *</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("discount_value")}
                  aria-invalid={!!form.formState.errors.discount_value}
                />
                {form.formState.errors.discount_value && (
                  <FieldError errors={[form.formState.errors.discount_value]} />
                )}
              </FieldContent>
            </Field>

            <Controller
              name="apply_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="coupon-apply-type">
                    Apply Type
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="coupon-apply-type"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat (per booking)</SelectItem>
                        <SelectItem value="per_person">Per Person</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="scope"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="coupon-scope">Scope *</FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="coupon-scope"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">
                          Company (all events)
                        </SelectItem>
                        <SelectItem value="event">Single event</SelectItem>
                        <SelectItem value="batch">Event batch</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {(scope === "event" || scope === "batch") && (
              <Controller
                key={`coupon-event-${scope}`}
                name="event_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="coupon-event-id">Event *</FieldLabel>
                    <FieldContent>
                      <Select
                        key={`coupon-event-select-${scope}`}
                        value={field.value || undefined}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue("batch_id", "");
                          form.clearErrors("batch_id");
                        }}
                        name={field.name}
                      >
                        <SelectTrigger
                          id="coupon-event-id"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((ev) => (
                            <SelectItem key={ev.event_id} value={ev.event_id}>
                              {ev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            )}

            {scope === "batch" && (
              <Controller
                key={`coupon-batch-${scope}-${eventId}`}
                name="batch_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="coupon-batch-id">
                      Departure (batch) *
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        key={`coupon-batch-select-${scope}-${eventId}`}
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        name={field.name}
                        disabled={!eventId || batchesLoading}
                      >
                        <SelectTrigger
                          id="coupon-batch-id"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={
                              !eventId
                                ? "Select an event first"
                                : batchesLoading
                                  ? "Loading departures…"
                                  : "Select departure"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem
                              key={batch.batch_id}
                              value={batch.batch_id}
                            >
                              {batchOptionLabel(batch)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            )}

            <Field>
              <FieldLabel htmlFor="coupon-min-group">Min group size</FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-min-group"
                  type="number"
                  min={1}
                  placeholder="No minimum"
                  {...form.register("min_group_size")}
                />
              </FieldContent>
            </Field>

            <Controller
              name="validity_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="coupon-validity-type">
                    Validity Type
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      name={field.name}
                    >
                      <SelectTrigger
                        id="coupon-validity-type"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {validityType === "fixed" && (
              <>
                <Field>
                  <FieldLabel htmlFor="coupon-valid-from">
                    Valid from
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="coupon-valid-from"
                      type="date"
                      {...form.register("valid_from")}
                      aria-invalid={!!form.formState.errors.valid_from}
                    />
                    {form.formState.errors.valid_from && (
                      <FieldError
                        errors={[form.formState.errors.valid_from]}
                      />
                    )}
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="coupon-valid-till">
                    Valid till
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="coupon-valid-till"
                      type="date"
                      {...form.register("valid_till")}
                      aria-invalid={!!form.formState.errors.valid_till}
                    />
                    {form.formState.errors.valid_till && (
                      <FieldError
                        errors={[form.formState.errors.valid_till]}
                      />
                    )}
                  </FieldContent>
                </Field>
              </>
            )}

            {validityType === "relative" && (
              <>
                <Field>
              <FieldLabel htmlFor="coupon-valid-from">
                Start date
              </FieldLabel>
              <FieldContent>
                <Input
                  id="coupon-valid-from"
                  type="date"
                  {...form.register("valid_from")}
                  aria-invalid={!!form.formState.errors.valid_from}
                />
                {form.formState.errors.valid_from && (
                  <FieldError
                    errors={[form.formState.errors.valid_from]}
                  />
                )}
              </FieldContent>
            </Field>
              <Field>
                <FieldLabel htmlFor="coupon-valid-days">
                  Valid days
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="coupon-valid-days"
                    type="number"
                    min={1}
                    placeholder="1"
                    {...form.register("valid_days")}
                    aria-invalid={!!form.formState.errors.valid_days}
                  />
                  {form.formState.errors.valid_days && (
                    <FieldError errors={[form.formState.errors.valid_days]} />
                  )}
                </FieldContent>
              </Field>
              </>
            )}
          </FieldGroup>

          <Field orientation="horizontal" className="items-center gap-2">
            <input
              type="checkbox"
              id="coupon-is-public"
              {...form.register("is_public")}
              className="size-4 rounded border-input"
            />
            <FieldLabel
              htmlFor="coupon-is-public"
              className="cursor-pointer font-normal"
            >
              Public (visible to customers during booking)
            </FieldLabel>
          </Field>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-700 text-white hover:bg-green-800"
            >
              {isPending ? "Creating…" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

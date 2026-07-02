"use client";
import { Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { sendOtpSchema, SendOtpInput } from "@/lib/validation/schema";
import { useAuthStore } from "@/store/auth-store";
import { useSendOtpMutation } from "@/hooks/api/publicAPIs";

export function EmailStep() {
  const { mutateAsync, isPending } = useSendOtpMutation();
  const { setEmail, goToOtpStep } = useAuthStore();

  const form = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SendOtpInput) => {
    await mutateAsync(data);
    setEmail(data.email);
    goToOtpStep();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email-input">Email</FieldLabel>
              <InputGroup className="h-14 flex items-center gap-x-1 px-1">
                <InputGroupInput
                  {...field}
                  id="email-input"
                  type="email"
                  placeholder="admin@email.com"
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
                />
                <InputGroupAddon align="inline-start">
                  <Mail className="size-5 text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-14 bg-emerald-500 text-lg font-medium"
      >
        {isPending ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}

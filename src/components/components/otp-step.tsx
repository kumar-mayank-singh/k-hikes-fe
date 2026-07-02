"use client";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtpSchema, VerifyOtpInput } from "@/lib/validation/schema";
import { useAuthStore } from "@/store/auth-store";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/hooks/api/publicAPIs";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN = 59;

export function OtpStep() {
  const { email, reset } = useAuthStore();
  const { mutateAsync: verifyOtp, isPending: isVerifying } =
    useVerifyOtpMutation();
  const { mutateAsync: sendOtp, isPending: isResending } = useSendOtpMutation();

  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, otp: "" },
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const onSubmit = async (data: VerifyOtpInput) => {
    console.log("Submitting OTP:", data);
    await verifyOtp(data);
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    await sendOtp({ email });
    form.resetField("otp");
    setTimeLeft(RESEND_COOLDOWN);
  };

  const isResendDisabled = isResending || timeLeft > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="otp-input">One-Time Password</FieldLabel>

                <InputOTP
                  id="otp-input"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12" />
                    <InputOTPSlot index={1} className="h-12 w-12" />
                    <InputOTPSlot index={2} className="h-12 w-12" />
                    <InputOTPSlot index={3} className="h-12 w-12" />
                    <InputOTPSlot index={4} className="h-12 w-12" />
                    <InputOTPSlot index={5} className="h-12 w-12" />
                  </InputOTPGroup>
                </InputOTP>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          disabled={isVerifying}
          className="w-full h-14 bg-emerald-500 text-lg font-medium"
        >
          {isVerifying ? "Verifying..." : "Verify & Login"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResendDisabled}
          className="text-emerald-600 hover:underline disabled:opacity-50"
        >
          {isResending
            ? "Resending..."
            : timeLeft > 0
              ? `Resend OTP in ${timeLeft}s`
              : "Resend OTP"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:underline"
        >
          Change email
        </button>
      </div>
    </div>
  );
}

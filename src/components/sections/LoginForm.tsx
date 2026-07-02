"use client";
import { useAuthStore } from "@/store/auth-store";
import { EmailStep } from "../components/email-step";
import { OtpStep } from "../components/otp-step";

export function LoginForm() {
  const step = useAuthStore((s) => s.step);

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-2">Admin Login</h2>
        <p className="text-muted-foreground">
          {step === "email"
            ? "Enter your email to receive a one-time password"
            : "Enter the OTP sent to your email"}
        </p>
      </div>

      {step === "email" ? <EmailStep /> : <OtpStep />}
    </div>
  );
}

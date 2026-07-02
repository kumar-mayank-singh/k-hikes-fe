"use client";

import { Input } from "@/components/ui/input";
import { FormFieldProps } from "@/types/constants";

export function FormField({
  label,
  placeholder,
  type = "text",
  icon: Icon,
  registration,
  error,
}: FormFieldProps) {
  return (
    <div className=" space-x-4">
      {/* Label */}
      <label className="text-sm font-medium">{label}</label>

      {/* Input Wrapper */}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-2.5 h-5 w-5 text-muted-foreground" />
        )}

        <Input
          type={type}
          placeholder={placeholder}
          className={`${Icon ? "pl-9" : ""} h-14`}
          {...registration}
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

const coverImageExtensionRegex = /\.(png|jpg|jpeg)$/i;
const pdfExtensionRegex = /\.pdf$/i;

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  slots: z.string().optional(),
  display_price: z.string().optional(),
  strike_price: z.string().optional(),
  cover_image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || coverImageExtensionRegex.test(file.name),
      "Only PNG or JPG images are allowed"
    ),
  itinerary_document: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || pdfExtensionRegex.test(file.name),
      "Only PDF files are allowed"
    ),
  category_ids: z.array(z.string()).optional(),
  other_photos: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => coverImageExtensionRegex.test(file.name),
          "Only PNG or JPG images are allowed",
        ),
    )
    .optional(),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sort_order: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater"),
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

export const createCouponSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    discount_type: z.enum(["amount", "percentage"]),
    discount_value: z
      .string()
      .min(1, "Value is required")
      .refine(
        (v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0,
        "Value must be greater than 0"
      ),
    apply_type: z.enum(["flat", "per_person"]),
    scope: z.enum(["company", "event", "batch"]),
    event_id: z.string().optional(),
    batch_id: z.string().optional(),
    min_group_size: z.string().optional(),
    validity_type: z.enum(["fixed", "relative"]),
    valid_from: z.string().optional(),
    valid_till: z.string().optional(),
    valid_days: z.string().optional(),
    is_public: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "event" && !data.event_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an event for this scope",
        path: ["event_id"],
      });
    }
    if (data.scope === "batch") {
      if (!data.event_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select an event for batch scope",
          path: ["event_id"],
        });
      }
      if (!data.batch_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Batch ID is required for batch scope",
          path: ["batch_id"],
        });
      }
    }
    if (data.validity_type === "relative" && !data.valid_days?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Validity days are required for relative validity type",
        path: ["valid_days"],
      });
    }
    if (data.validity_type === "fixed") {
      if (!data.valid_from?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid from is required for fixed validity type",
          path: ["valid_from"],
        });
      }
      if (!data.valid_till?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid till is required for fixed validity type",
          path: ["valid_till"],
        });
      }
    }
  });

export type CreateCouponFormValues = z.infer<typeof createCouponSchema>;

const phoneRegex = /^[+]?\d[\d\s-]{6,}$/;

export const bookingCustomerSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your full name"),
  customer_phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  customer_email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .or(z.literal(""))
    .optional(),
  attendees: z
    .number()
    .int("Attendees must be a whole number")
    .min(1, "At least 1 attendee")
    .max(50, "Maximum 50 attendees per booking"),
  batch_id: z.string().min(1, "Select a departure"),
  price_option_id: z.string().nullable().optional(),
  pickup_point_id: z.string().nullable().optional(),
  add_on_ids: z.array(z.string()).default([]),
  coupon_code: z.string().trim().optional(),
  payment_type: z.enum(["full", "partial"]),
  accept_terms: z.literal(true, {
    message: "You must accept the terms and conditions",
  }),
});

export type BookingCustomerInput = z.infer<typeof bookingCustomerSchema>;

export const bookingContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
});

export type BookingContactInput = z.infer<typeof bookingContactSchema>;

export const postBookingPersonSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional(),
  pickup_point_id: z.string().trim().optional(),
  form_responses: z.record(z.string(), z.string()),
});

export const postBookingFormSchema = z.object({
  people: z.array(postBookingPersonSchema).min(1, "At least one attendee is required"),
});

export type PostBookingPersonInput = z.infer<typeof postBookingPersonSchema>;
export type PostBookingFormInput = z.infer<typeof postBookingFormSchema>;

export const leadPdfSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
});

export type LeadPdfInput = z.infer<typeof leadPdfSchema>;

const optionalMoneyString = z
  .string()
  .optional()
  .transform((v) => {
    const t = v?.trim();
    if (!t) return null;
    const n = parseFloat(t);
    return Number.isNaN(n) ? null : n;
  });

export const createManualAdminBookingSchema = z.object({
  event_id: z.string().min(1, "Select an event"),
  batch_id: z.string().min(1, "Select a departure"),
  customer_name: z.string().trim().min(2, "Customer name is required"),
  customer_phone: z
    .string()
    .trim()
    .min(7, "Phone is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  customer_email: z
    .string()
    .optional()
    .transform((s) => {
      const t = (s ?? "").trim();
      return t.length === 0 ? null : t;
    })
    .pipe(
      z.union([z.null(), z.string().email("Enter a valid email")]),
    ),
  attendees: z.coerce.number().int().min(1).max(50),
  amount_paid: z.coerce.number().min(0),
  discount_amount: z.coerce.number().min(0).optional().default(0),
  subtotal: optionalMoneyString,
  total_amount: optionalMoneyString,
  gst_amount: optionalMoneyString,
  pickup_point_id: z.string().optional().nullable(),
  price_option_id: z.string().optional().nullable(),
});

export type CreateManualAdminBookingParsed = z.output<
  typeof createManualAdminBookingSchema
>;

export const adminBookingPersonEditSchema = z.object({
  booking_person_id: z.string().min(1),
  person_index: z.number().int().min(1),
  name: z.string().trim().min(2, "Name is required"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  pickup_point_id: z
    .string()
    .optional()
    .transform((s) => {
      const t = (s ?? "").trim();
      return t.length === 0 ? null : t;
    }),
});

export const adminBookingEditSchema = z.object({
  people: z.array(adminBookingPersonEditSchema).default([]),
});

export type AdminBookingPersonEditParsed = z.output<
  typeof adminBookingPersonEditSchema
>;
export type AdminBookingEditParsed = z.output<typeof adminBookingEditSchema>;

export const changeAdminBookingDateSchema = z.object({
  batch_id: z.string().min(1, "Select a new departure"),
});

export type ChangeAdminBookingDateFormValues = z.infer<
  typeof changeAdminBookingDateSchema
>;

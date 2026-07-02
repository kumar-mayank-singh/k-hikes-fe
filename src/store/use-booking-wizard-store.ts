"use client";

import { create } from "zustand";

import type { PaymentType } from "@/types/bookingConstants";

export type WizardStep = 0 | 1 | 2;

export interface WizardContact {
  name: string;
  email: string;
  phone: string;
}

interface WizardFields {
  batchId: string;
  pickupPointId: string;
  priceOptionId: string;
  /** Selected `event_add_on_id` values; sent as `add_on_ids` on initiate. */
  addOnIds: string[];
  attendees: number;
  couponCode: string;
  /** Rupees off from last successful `/api/public/coupons/validate`. */
  discountAmount: number;
  /** Cart fingerprint when `discountAmount` was set; discount ignored if this differs. */
  discountCartFingerprint: string | null;
  paymentType: PaymentType;
  /** Percent of total to charge now. Currently constrained to 50 or 100. */
  bookingAmountPercent: 50 | 100;
}

/**
 * Phases the post-initiate payment flow walks through while the wizard
 * dialog is closed. The overlay reflects this to the user.
 */
export type PaymentPhase =
  | "idle"
  | "creating-order"
  | "razorpay-open"
  | "verifying"
  | "confirming"
  | "redirecting";

/**
 * Snapshot of everything the overlay needs to drive the payment flow
 * independently of the (now-closed) wizard dialog.
 */
export interface PaymentFlowRequest {
  eventId: string;
  bookingId: string;
  bookingNumber: string;
  formToken: string;
  paymentType: PaymentType;
  amountToPay: number;
  razorpayEnabled: boolean;
  attendees: number;
  pickupPointId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

interface BookingWizardState extends WizardFields {
  isOpen: boolean;
  step: WizardStep;
  contact: WizardContact;
  paymentPhase: PaymentPhase;
  paymentRequest: PaymentFlowRequest | null;
}

interface BookingWizardActions {
  open: (contact: WizardContact) => void;
  close: () => void;
  setStep: (step: WizardStep) => void;
  next: () => void;
  prev: () => void;
  setContact: (contact: WizardContact) => void;
  update: (patch: Partial<WizardFields>) => void;
  reset: () => void;
  /**
   * Closes the wizard dialog and arms the payment overlay with the
   * data it needs to talk to the backend / Razorpay.
   */
  startPayment: (request: PaymentFlowRequest) => void;
  setPaymentPhase: (phase: PaymentPhase) => void;
  endPayment: () => void;
}

type Store = BookingWizardState & BookingWizardActions;

const INITIAL_STATE: BookingWizardState = {
  isOpen: false,
  step: 0,
  contact: { name: "", email: "", phone: "" },
  batchId: "",
  pickupPointId: "",
  priceOptionId: "",
  addOnIds: [],
  attendees: 1,
  couponCode: "",
  discountAmount: 0,
  discountCartFingerprint: null,
  paymentType: "full",
  bookingAmountPercent: 100,
  paymentPhase: "idle",
  paymentRequest: null,
};

const clampStep = (n: number): WizardStep =>
  Math.max(0, Math.min(2, n)) as WizardStep;

export const useBookingWizardStore = create<Store>((set) => ({
  ...INITIAL_STATE,

  open: (contact) => set({ ...INITIAL_STATE, isOpen: true, contact }),

  close: () => set({ isOpen: false }),

  setStep: (step) => set({ step }),

  next: () => set((s) => ({ step: clampStep(s.step + 1) })),

  prev: () => set((s) => ({ step: clampStep(s.step - 1) })),

  setContact: (contact) => set({ contact }),

  update: (patch) => set(patch),

  reset: () => set(INITIAL_STATE),

  startPayment: (request) =>
    set({
      isOpen: false,
      paymentRequest: request,
      paymentPhase: "creating-order",
    }),

  setPaymentPhase: (phase) => set({ paymentPhase: phase }),

  endPayment: () => set({ paymentPhase: "idle", paymentRequest: null }),
}));

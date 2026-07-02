import type { CreatePaymentOrderResponse } from "@/types/bookingConstants";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoadPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay checkout")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("Failed to load Razorpay checkout"));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export interface OpenRazorpayCheckoutInput {
  order: CreatePaymentOrderResponse;
  bookingLabel: string;
  onSuccess: (response: RazorpayPaymentResponse) => void | Promise<void>;
  onFailure?: (error: unknown) => void;
}

export async function openRazorpayCheckout(
  input: OpenRazorpayCheckoutInput,
): Promise<void> {
  await loadRazorpayScript();

  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  return new Promise((resolve, reject) => {
    /**
     * Razorpay fires `modal.ondismiss` whenever the checkout closes, and
     * the SDK closes the modal *after* the `handler` (success) callback
     * runs. While `onSuccess` is verifying payment server-side we don't
     * want a late `ondismiss` to flip the outcome to "cancelled", and we
     * don't want `payment.failed` from a prior attempt to flip a later
     * success either. Track terminal state explicitly.
     */
    let outcome: "pending" | "success" | "failure" = "pending";

    const settleFailure = (err: Error): void => {
      if (outcome !== "pending") return;
      outcome = "failure";
      reject(err);
    };

    const instance = new Razorpay({
      key: input.order.key_id,
      amount: input.order.amount,
      currency: input.order.currency || "INR",
      name: "Karnataka Hikes",
      description: input.bookingLabel,
      order_id: input.order.razorpay_order_id,
      prefill: {
        name: input.order.customer_name,
        email: input.order.customer_email ?? "",
        contact: input.order.customer_phone,
      },
      theme: { color: "#047857" },
      modal: {
        ondismiss: () => {
          // Only treat dismiss as cancellation if the handler hasn't
          // started a successful flow yet.
          settleFailure(new Error("Payment cancelled"));
        },
      },
      handler: (response) => {
        // Mark success synchronously so a follow-up `ondismiss`
        // (Razorpay closes the modal post-handler) can't override it.
        outcome = "success";
        void Promise.resolve(input.onSuccess(response))
          .then(() => resolve())
          .catch((err: unknown) => {
            // If the server-side verify fails, surface that error.
            const error =
              err instanceof Error
                ? err
                : new Error("Payment verification failed");
            // outcome is already "success" — manually flip & reject.
            outcome = "failure";
            reject(error);
          });
      },
    });

    instance.on("payment.failed", (resp) => {
      input.onFailure?.(resp.error);
      settleFailure(
        resp.error instanceof Error
          ? resp.error
          : new Error("Razorpay payment failed"),
      );
    });

    instance.open();
  });
}

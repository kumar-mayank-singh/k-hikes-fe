import { isAxiosError } from "axios";

/**
 * Shape of error payloads returned by the admin/public Flask API.
 * The backend is consistent: 4xx/5xx responses contain `error` and an
 * optional `details` array (Pydantic validation errors).
 */
interface ApiErrorBody {
  error?: unknown;
  detail?: unknown;
  details?: unknown;
  message?: unknown;
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function joinPydanticDetails(details: unknown): string | null {
  if (!Array.isArray(details) || details.length === 0) return null;
  const parts: string[] = [];
  for (const entry of details) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as { msg?: unknown; loc?: unknown };
    const msg = typeof e.msg === "string" ? e.msg : null;
    const loc = Array.isArray(e.loc)
      ? e.loc.filter((p) => typeof p === "string" || typeof p === "number").join(".")
      : null;
    if (msg && loc) parts.push(`${loc}: ${msg}`);
    else if (msg) parts.push(msg);
  }
  return parts.length ? parts.join("; ") : null;
}

/**
 * Extracts a human-readable error message from an unknown thrown value.
 *
 * Priority:
 *   1. Axios 4xx/5xx: `response.data.error` (primary contract).
 *   2. Axios: `response.data.detail` / `message` (fallbacks for other endpoints).
 *   3. Pydantic `details[]` array, joined into a single line.
 *   4. Native `Error.message`.
 *   5. Provided `fallback`.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const direct = firstString(data?.error, data?.detail, data?.message);
    if (direct) return direct;

    const joined = joinPydanticDetails(data?.details);
    if (joined) return joined;

    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

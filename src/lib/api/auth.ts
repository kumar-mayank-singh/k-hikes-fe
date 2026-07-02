import { SendOtpInput, VerifyOtpInput } from "@/lib/validation/schema";
import { publicApi } from "./public-client";
import { useAuthStore } from "@/store/auth-store";
import { AxiosError } from "axios";
import { LoginResponse } from "@/types/userConstants";

export async function sendOtp(data: SendOtpInput): Promise<void> {
  const res = await publicApi.post("/api/auth/init-otp", data);
  return res.data;
}

export async function verifyOtp(data: VerifyOtpInput): Promise<LoginResponse> {
  const res = await publicApi.post("/api/auth/verify-otp", data);
  return res.data;
}

export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

  if (!refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const res = await publicApi.post<LoginResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = res.data;

    if (!access_token || !refresh_token) {
      clearAuth();
      return null;
    }

    setTokens(access_token, refresh_token);

    return access_token;
  } catch (err) {
    const error = err as AxiosError;

    // Refresh token expired / invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth();
      return null;
    }

    // Network / server error → propagate
    throw error;
  }
}

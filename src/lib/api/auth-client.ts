import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth-store";
import { refreshAccessToken } from "./auth";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type Subscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let subscribers: Subscriber[] = [];

function subscribe(
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
) {
  subscribers.push({ resolve, reject });
}

function notifySuccess(token: string) {
  subscribers.forEach(({ resolve }) => resolve(token));
  subscribers = [];
}

function notifyFailure(error: unknown) {
  subscribers.forEach(({ reject }) => reject(error));
  subscribers = [];
}

authApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || !error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const retryOriginalRequest = new Promise((resolve, reject) => {
      subscribe(
        (token: string) => {
          if (!originalRequest.headers) {
            originalRequest.headers = new AxiosHeaders();
          }

          originalRequest.headers.set("Authorization", `Bearer ${token}`);
          resolve(authApi(originalRequest));
        },
        (err) => reject(err),
      );
    });

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (!newToken) {
          const authError = new Error("Unable to refresh access token");
          notifyFailure(authError);
          useAuthStore.getState().logout();
          return Promise.reject(authError);
        }

        notifySuccess(newToken);
      } catch (refreshError) {
        notifyFailure(refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return retryOriginalRequest;
  },
);

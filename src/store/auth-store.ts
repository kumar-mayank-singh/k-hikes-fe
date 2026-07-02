import { create } from "zustand";

import { tokenStorage } from "@/store/token-storage";
import { AuthStore } from "@/types/userConstants";

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: false,
  user: null,

  setUser: (payload) =>
    set({
      authenticated: payload.authenticated,
      user: payload.user,
    }),

  accessToken: null,
  refreshToken: null,

  setTokens: (access, refresh) => {
    tokenStorage.set(access, refresh);

    set({
      accessToken: access,
      refreshToken: refresh,
    });
  },

  clearAuth: () => {
    tokenStorage.clear();

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  },

  logout: () => {
    tokenStorage.clear();

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      step: "email",
      email: "",
    });
  },

  step: "email",
  email: "",

  setEmail: (email) => set({ email }),

  goToOtpStep: () => set({ step: "otp" }),

  reset: () =>
    set({
      step: "email",
      email: "",
    }),
}));

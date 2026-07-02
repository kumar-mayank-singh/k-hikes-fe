"use client";

import { ReactNode, useLayoutEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { tokenStorage } from "@/store/token-storage";

export function AuthProvider({ children }: { children: ReactNode }): React.ReactNode {
  const setTokens = useAuthStore((s) => s.setTokens);

  useLayoutEffect(() => {
    const access = tokenStorage.getAccess();
    const refresh = tokenStorage.getRefresh();

    if (access && refresh) {
      setTokens(access, refresh);
    }
  }, [setTokens]);

  return children;
}

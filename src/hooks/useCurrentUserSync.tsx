import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/api/authAPIs";

export function useCurrentUserSync() {
  const { data, error, isLoading } = useCurrentUser();

  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error, logout]);

  return { data, error, isLoading };
}
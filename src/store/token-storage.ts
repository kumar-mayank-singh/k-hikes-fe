const ACCESS = "access_token"
const REFRESH = "refresh_token"

export const tokenStorage = {
  getAccess() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ACCESS)
  },

  getRefresh() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH)
  },

  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS, access)
    localStorage.setItem(REFRESH, refresh)
  },

  clear() {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
  }
}
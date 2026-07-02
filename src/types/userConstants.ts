export interface AuthUser {
    user_id: string;
    email: string | null;
    mobile: string | null;
    name: string | null;
    role: string;
    created_on: string;
    updated_on: string;
    created_by: string | null;
    updated_by: string | null;
  }
  
  export interface CurrentUserResponse {
    authenticated: boolean;
    user: AuthUser | null;
  }
  
  export interface LoginResponse {
    access_token: string;
    refresh_token: string;
  }
  
  type OtpStep = "email" | "otp";
  
  export interface AuthStore {
    // --- User / session state ---
    authenticated: boolean;
    user: AuthUser | null;
    setUser: (payload: CurrentUserResponse) => void;
    logout: () => void;
  
    // --- Auth state ---
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (access: string, refresh: string) => void;
    clearAuth: () => void;
  
    // --- OTP wizard state ---
    step: OtpStep;
    email: string;
    setEmail: (email: string) => void;
    goToOtpStep: () => void;
    reset: () => void;
  }
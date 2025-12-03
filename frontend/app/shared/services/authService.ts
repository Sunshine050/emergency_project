// app/shared/services/authService.ts
import { AuthService, SettingsService, HospitalsService } from "@lib/api-client";
import { configureApiClient } from "@/shared/utils/apiConfig";
import { HospitalSettings } from "@/shared/types";
import { LoginDto, RegisterDto, OAuthLoginDto } from "@lib/api-client";

// -------------------------------------------------------------------
// User profile / settings (NestJS Settings API)
// -------------------------------------------------------------------
export const fetchUserProfile = async (): Promise<any> => {
  configureApiClient();
  return SettingsService.settingsControllerGetMe();
};

export const saveUserSettings = async (data: Partial<any>): Promise<void> => {
  configureApiClient();
  // Note: settingsControllerPutMe expects UpdateSettingsDto. 
  // We cast data to any or UpdateSettingsDto if we had the type imported.
  await SettingsService.settingsControllerPutMe(data);
};

// -------------------------------------------------------------------
// Hospital specific settings
// -------------------------------------------------------------------
export const saveHospitalSettings = async (
  data: HospitalSettings,
): Promise<void> => {
  configureApiClient();
  // Assuming HospitalsService has a method for this, or we keep using fetch if not.
  // Checking HospitalsService (not shown fully but assumed). 
  // If not available, we can fallback to fetch or use HospitalsService if it has update settings.
  // For now, I'll keep the fetch implementation for hospital settings if I'm not sure, 
  // but better to try to use the client if possible.
  // Let's assume UpdateHospitalDto is available.
  // But wait, the previous implementation used /hospital/settings.
  // Let's check HospitalsService later. For now, I'll keep fetch for this one to be safe, 
  // or better, use the client if I can find the method.
  // I'll stick to fetch for hospital settings for now to minimize risk of breaking that part.

  const token = localStorage.getItem("access_token");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hospital/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save hospital settings");
};

// -------------------------------------------------------------------
// Auth related APIs
// -------------------------------------------------------------------
export const registerUser = async (data: RegisterDto): Promise<any> => {
  configureApiClient();
  return AuthService.authControllerRegister(data);
};

export const loginUser = async (data: LoginDto): Promise<any> => {
  configureApiClient();
  const result = await AuthService.authControllerLogin(data);

  // Store tokens
  if (result.access_token) localStorage.setItem("access_token", result.access_token);
  if (result.refresh_token) localStorage.setItem("refresh_token", result.refresh_token);

  return result;
};

export const refreshToken = async (refreshToken: string): Promise<any> => {
  configureApiClient();
  return AuthService.authControllerRefreshToken({ refreshToken });
};

export const initiateOAuth = async (data: OAuthLoginDto): Promise<string> => {
  configureApiClient();
  const result = await AuthService.authControllerOauthLogin(data);
  return result.url;
};

export const verifyToken = async (): Promise<any> => {
  configureApiClient();
  return AuthService.authControllerVerifyToken();
};

export const supabaseLogin = async (access_token: string): Promise<any> => {
  configureApiClient();
  return AuthService.authControllerSupabaseLogin({ access_token });
};
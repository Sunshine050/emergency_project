// Auth interfaces for the application

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface SupabaseUser {
  id: string;
  email: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    email?: string;
    email_verified?: boolean;
    phone?: string;
    picture?: string;
  };
  role?: string;
  aud: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  token: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}
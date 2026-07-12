import type { ApiUserTier, ApiKycStatus } from './api';

export type UserTier = ApiUserTier;
export type KycStatus = ApiKycStatus;
export type UserRole = 'GUEST' | UserTier;

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  tier?: UserTier;
  role?: UserRole;
  kycStatus?: KycStatus;
  currency?: string;
  preferredGrader?: string;
  preferredPreGrader?: string;
  notifications?: {
    push: boolean;
    email: boolean;
    line: boolean;
    sms: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}

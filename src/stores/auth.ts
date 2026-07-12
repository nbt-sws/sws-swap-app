import { create } from 'zustand';
import { userApi } from '@/lib/api';
import type { AuthUser, UserTier, UserRole } from '@/types/auth';

const STORAGE_KEY = 'sws_access_token';
const DEV_USER_KEY = 'sws_dev_user';

export type { UserTier, AuthUser, UserRole };

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  initAuth: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Synchronous initialization on client
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

  return {
    user: null,
    accessToken: token,
    isAuthenticated: !!token,
    isLoading: true,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setTokens: (accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, accessToken);
        if (refreshToken) localStorage.setItem('sws_refresh_token', refreshToken);
      }
      set({ accessToken, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('sws_refresh_token');
        localStorage.removeItem(DEV_USER_KEY);
      }
      set({ user: null, accessToken: null, isAuthenticated: false });
    },

    fetchUser: async () => {
      const token = get().accessToken;
      if (!token) {
        set({ isLoading: false });
        return;
      }
      try {
        const res = await userApi.me();
        const apiUser = res.user;
        const user: AuthUser = {
          id: apiUser.id,
          email: apiUser.email,
          fullName: apiUser.fullName || apiUser.email,
          avatarUrl: apiUser.avatarUrl,
          tier: apiUser.tier,
          kycStatus: apiUser.kycStatus,
          currency: apiUser.currency || 'THB',
          preferredGrader: apiUser.preferredGrader,
          preferredPreGrader: apiUser.preferredPreGrader,
          notifications: apiUser.notifications,
          createdAt: apiUser.createdAt,
          updatedAt: apiUser.updatedAt,
        };
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        // Token invalid or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('sws_refresh_token');
        }
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    },

    initAuth: () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const devUser = typeof window !== 'undefined' ? localStorage.getItem(DEV_USER_KEY) : null;
      if (devUser) {
        try {
          const user = JSON.parse(devUser) as AuthUser;
          set({ accessToken: token, isAuthenticated: true, user, isLoading: false });
          return;
        } catch {
          localStorage.removeItem(DEV_USER_KEY);
        }
      }
      if (token) {
        set({ accessToken: token, isAuthenticated: true });
        // Fetch user from API instead of using hardcoded mock
        get().fetchUser();
      } else {
        set({ isLoading: false });
      }
    },
  };
});

export function getUserRole(user: AuthUser | null): UserRole {
  return user?.tier ?? 'GUEST';
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.tier === 'ADMIN';
}

export function isMember(user: AuthUser | null): boolean {
  return user?.tier === 'MEMBER' || user?.tier === 'ADMIN';
}

export function isRegularUser(user: AuthUser | null): boolean {
  return user?.tier === 'REGULAR';
}

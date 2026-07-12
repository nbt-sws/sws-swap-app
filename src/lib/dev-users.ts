import type { AuthUser } from '@/types/auth';

export const DEV_USER_KEY = 'sws_dev_user';

export const DEV_USERS: Record<string, AuthUser> = {
  buyer: {
    id: 'dev-buyer',
    email: 'buyer@dev.local',
    fullName: 'Dev Buyer',
    tier: 'REGULAR',
    kycStatus: 'APPROVED',
    currency: 'THB',
    avatarUrl: undefined,
    notifications: { push: true, email: false, line: false, sms: false },
  },
  seller: {
    id: 'dev-seller',
    email: 'seller@dev.local',
    fullName: 'Dev Seller',
    tier: 'MEMBER',
    kycStatus: 'APPROVED',
    currency: 'THB',
    avatarUrl: undefined,
    notifications: { push: true, email: false, line: false, sms: false },
  },
  admin: {
    id: 'dev-admin',
    email: 'admin@dev.local',
    fullName: 'Dev Admin',
    tier: 'ADMIN',
    kycStatus: 'APPROVED',
    currency: 'THB',
    avatarUrl: undefined,
    notifications: { push: true, email: false, line: false, sms: false },
  },
};

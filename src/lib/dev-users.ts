import type { AuthUser } from '@/types/auth';

export const DEV_USER_KEY = 'sws_dev_user';

export const DEV_USERS: Record<string, AuthUser> = {
  kyc: {
    id: 'dev-kyc',
    email: 'kyc@dev.local',
    fullName: 'KYC User',
    tier: 'MEMBER',
    kycStatus: 'APPROVED',
    currency: 'THB',
    avatarUrl: undefined,
    notifications: { push: true, email: false, line: false, sms: false },
  },
  nonKyc: {
    id: 'dev-nonkyc',
    email: 'nonkyc@dev.local',
    fullName: 'Non-KYC User',
    tier: 'REGULAR',
    kycStatus: 'NONE',
    currency: 'THB',
    avatarUrl: undefined,
    notifications: { push: true, email: false, line: false, sms: false },
  },
};

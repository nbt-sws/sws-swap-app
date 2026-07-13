import { useNavigate } from '@tanstack/react-router';
import { useUser } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  User,
  Bell,
  Palette,
  FileText,
  Shield,
  Database,
  Trash2,
  Settings,
  BadgeCheck,
  Crown,
  Globe,
  LifeBuoy,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { version as APP_VERSION } from '../../package.json';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  hasArrow?: boolean;
  danger?: boolean;
  status?: 'active' | 'warning' | 'muted';
  onClick?: () => void;
}

function SettingsRow({ icon: Icon, label, value, hasArrow, danger, status, onClick }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
        onClick ? 'hover:bg-surface-lighter' : '',
        danger ? 'text-pldown' : ''
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center shrink-0">
        <Icon className={cn('w-4 h-4', danger ? 'text-pldown' : 'text-muted-foreground')} />
      </div>
      <span className={cn('flex-1 text-sm', danger ? 'text-pldown' : '')}>{label}</span>
      {value && (
        <span
          className={cn(
            'text-xs',
            status === 'active'
              ? 'text-cyan'
              : status === 'warning'
              ? 'text-warning'
              : !status
              ? 'text-muted-foreground'
              : ''
          )}
        >
          {value}
        </span>
      )}
      {hasArrow && (
        <ChevronRight className={cn('w-4 h-4 shrink-0', danger ? 'text-pldown' : 'text-muted-foreground')} />
      )}
    </button>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface-light rounded-xl overflow-hidden', className)}>
      {children}
    </div>
  );
}

function formatMemberSince(date?: string, locale = 'en-US'): string | undefined {
  if (!date) return undefined;
  try {
    return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short' });
  } catch {
    return undefined;
  }
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const authUser = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const { data: userQuery } = useUser();

  const user = userQuery ?? authUser;
  const currentLang = i18n.language?.startsWith('th') ? 'th' : 'en';

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  const showToast = (message: string) => {
    if (typeof window !== 'undefined') {
      window.alert(message);
    }
  };

  const displayName = user?.fullName || user?.email || t('home.greeting.collector');
  const email = user?.fullName ? user?.email : undefined;
  const tier = user?.tier ?? 'GUEST';
  const kyc = user?.kycStatus ?? 'NONE';
  const isSubscribed = tier === 'MEMBER' || tier === 'SUBSCRIBER' || tier === 'ADMIN';
  const kycVerified = kyc === 'APPROVED';

  const tierLabel = t(`settings.tier.${(tier === 'GUEST' ? 'guest' : tier).toLowerCase()}`);
  const kycLabel = t(`settings.kycStatus.${(kyc === 'NONE' ? 'notStarted' : kyc).toLowerCase()}`);

  const tierRing =
    tier === 'ADMIN'
      ? 'ring-periwinkle shadow-[0_0_20px_rgba(123,138,245,0.3)]'
      : tier === 'MEMBER' || tier === 'SUBSCRIBER'
      ? 'ring-brand shadow-glow'
      : 'ring-muted';

  const tierBadge =
    tier === 'ADMIN'
      ? 'bg-periwinkle text-white'
      : tier === 'MEMBER' || tier === 'SUBSCRIBER'
      ? 'bg-brand text-white'
      : 'bg-surface-lighter text-muted-foreground';

  const kycBadge =
    kyc === 'APPROVED'
      ? 'bg-cyan/15 text-cyan'
      : kyc === 'PENDING'
      ? 'bg-warning/15 text-warning'
      : kyc === 'REJECTED'
      ? 'bg-pldown/15 text-pldown'
      : 'bg-surface-lighter text-muted-foreground';

  const memberSince = formatMemberSince(user?.createdAt, currentLang === 'th' ? 'th-TH' : 'en-US');

  const handleToggleLanguage = () => {
    const next = currentLang === 'th' ? 'en' : 'th';
    i18n.changeLanguage(next);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  };

  return (
    <PageContainer className="py-6">
      <PageHeader title={t('settings.title')} icon={<Settings className="w-6 h-6 text-brand" />} />

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Identity Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate({ to: '/profile' })}
          className="w-full text-left bg-surface-light rounded-xl p-5 flex items-center gap-4 hover:bg-surface-lighter transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-brand-gradient text-white ring-4 ring-offset-2 ring-offset-surface-dark shrink-0',
              tierRing
            )}
          >
            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate">{displayName}</p>
            {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide', tierBadge)}>
                {tierLabel}
              </span>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide', kycBadge)}>
                {kycLabel}
              </span>
            </div>
            {memberSince && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {t('settings.memberSince', { date: memberSince })}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>

        {/* Account */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
            {t('settings.sections.account')}
          </h3>
          <SectionCard>
            <SettingsRow
              icon={User}
              label={t('settings.items.profile')}
              value={displayName}
              hasArrow
              onClick={() => navigate({ to: '/profile' })}
            />
            <SettingsRow
              icon={Crown}
              label={t('settings.items.subscription')}
              value={tierLabel}
              status={isSubscribed ? 'active' : 'muted'}
            />
            <SettingsRow icon={Shield} label={t('settings.items.role')} value={tierLabel} />
            <SettingsRow
              icon={BadgeCheck}
              label={t('settings.items.kyc')}
              value={kycLabel}
              status={kycVerified ? 'active' : kyc === 'PENDING' ? 'warning' : 'muted'}
              hasArrow={!kycVerified}
              onClick={!kycVerified ? () => navigate({ to: '/profile', search: { tab: 'kyc' } }) : undefined}
            />
            <SettingsRow
              icon={Wallet}
              label={t('settings.items.currency')}
              value={user?.currency || 'THB'}
            />
          </SectionCard>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
            {t('settings.sections.preferences')}
          </h3>
          <SectionCard>
            <SettingsRow
              icon={Bell}
              label={t('settings.items.notifications')}
              hasArrow
              onClick={() => navigate({ to: '/notifications' })}
            />
            <SettingsRow
              icon={Palette}
              label={t('settings.items.appearance')}
              value={t(`settings.theme.${theme === 'light' ? 'light' : theme === 'system' ? 'system' : 'dark'}`)}
              hasArrow
              onClick={toggleTheme}
            />
            <SettingsRow
              icon={Globe}
              label={t('settings.items.language')}
              value={currentLang.toUpperCase()}
              hasArrow
              onClick={handleToggleLanguage}
            />
          </SectionCard>
        </motion.div>

        {/* Support */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
            {t('settings.sections.support')}
          </h3>
          <SectionCard>
            <SettingsRow
              icon={FileText}
              label={t('settings.items.terms')}
              hasArrow
              onClick={() => showToast(t('settings.toasts.terms'))}
            />
            <SettingsRow
              icon={Shield}
              label={t('settings.items.privacy')}
              hasArrow
              onClick={() => showToast(t('settings.toasts.privacy'))}
            />
            <SettingsRow
              icon={Database}
              label={t('settings.items.dataSources')}
              hasArrow
              onClick={() => showToast(t('settings.toasts.dataSources'))}
            />
            <SettingsRow
              icon={LifeBuoy}
              label={t('settings.items.help')}
              hasArrow
              onClick={() => showToast(t('settings.toasts.help'))}
            />
          </SectionCard>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
            {t('settings.sections.danger')}
          </h3>
          <SectionCard>
            <SettingsRow
              icon={Trash2}
              label={t('settings.items.deleteAccount')}
              danger
              onClick={() => {
                if (confirm(t('settings.toasts.deleteConfirm'))) {
                  showToast(t('settings.toasts.deleteRequested'));
                }
              }}
            />
          </SectionCard>
        </motion.div>

        {/* Sign out */}
        <motion.button
          variants={itemVariants}
          onClick={handleSignOut}
          className="w-full py-4 rounded-xl bg-surface-light text-sm font-medium text-pldown hover:bg-pldown/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pldown focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark"
        >
          {t('settings.items.signOut')}
        </motion.button>

        {/* Version footer — only version, no branding */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[10px] font-mono text-muted-foreground/60"
        >
          v{APP_VERSION}
        </motion.p>
      </motion.div>
    </PageContainer>
  );
}

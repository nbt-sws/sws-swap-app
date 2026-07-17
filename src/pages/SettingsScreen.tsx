import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  useUser, useUpdatePreferences, useChangePassword, useDeleteAccount,
} from '@/hooks/useApi';
import {
  ChevronRight, User, Bell, Palette, Settings, Globe, LifeBuoy,
  Wallet, KeyRound, Trash2, Award, Smartphone, Mail, MessageCircle, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { toast } from 'sonner';
import { version as APP_VERSION } from '../../package.json';
import { cn } from '@/lib/utils';

const GRADERS = ['PSA', 'BGS', 'CGC', 'TAG'];
const PRE_GRADERS = ['RAWLITY', 'BLACKLENS'];
const CURRENCIES = ['THB', 'USD', 'JPY'];

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface-light rounded-xl overflow-hidden">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">
      {children}
    </h2>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  hasArrow,
  danger,
  onClick,
  right,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  hasArrow?: boolean;
  danger?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick && !right}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
        onClick && 'hover:bg-surface-lighter',
        danger && 'text-pldown'
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center shrink-0">
        <Icon className={cn('w-4 h-4', danger ? 'text-pldown' : 'text-muted-foreground')} />
      </div>
      <span className={cn('flex-1 text-sm', danger && 'text-pldown')}>{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {right}
      {hasArrow && <ChevronRight className={cn('w-4 h-4 shrink-0', danger ? 'text-pldown' : 'text-muted-foreground')} />}
    </button>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const authUser = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const { data: userQuery } = useUser();
  const updatePreferences = useUpdatePreferences();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const user = userQuery ?? authUser;
  const currentLang = i18n.language?.startsWith('th') ? 'th' : 'en';

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [deletePassword, setDeletePassword] = useState('');

  const notifications = {
    push: user?.notifications?.push ?? false,
    email: user?.notifications?.email ?? false,
    line: user?.notifications?.line ?? false,
    sms: user?.notifications?.sms ?? false,
  };

  const saveNotifications = (channel: keyof typeof notifications, enabled: boolean) => {
    const next = { ...notifications, [channel]: enabled };
    updatePreferences.mutate(
      { notifications: next },
      {
        onSuccess: () => toast.success(t('settings.toasts.prefsSaved')),
        onError: () => toast.error(t('common.error')),
      }
    );
  };

  const savePreference = (data: { currency?: string; preferredGrader?: string; preferredPreGrader?: string }) => {
    updatePreferences.mutate(data, {
      onSuccess: () => toast.success(t('settings.toasts.prefsSaved')),
      onError: () => toast.error(t('common.error')),
    });
  };

  const handleChangePassword = () => {
    if (pwForm.next !== pwForm.confirm) {
      toast.error(t('settings.dialogs.passwordMismatch'));
      return;
    }
    changePassword.mutate(
      { currentPassword: pwForm.current, newPassword: pwForm.next },
      {
        onSuccess: () => {
          toast.success(t('settings.toasts.passwordChanged'));
          setPasswordOpen(false);
          setPwForm({ current: '', next: '', confirm: '' });
        },
        onError: () => toast.error(t('settings.toasts.passwordWrong')),
      }
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(
      { password: deletePassword },
      {
        onSuccess: () => navigate({ to: '/login' }),
        onError: () => toast.error(t('settings.toasts.deleteFailed')),
      }
    );
  };

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <PageContainer size="md" className="py-6">
      <PageHeader title={t('settings.title')} icon={<Settings className="w-6 h-6 text-brand" />} />

      <div className="space-y-6">
        {/* Account — identity lives on the Profile page; this is just a shortcut */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.account')}</SectionTitle>
          <SectionCard>
            <Row
              icon={User}
              label={t('settings.items.profile')}
              value={(user as { email?: string })?.email}
              hasArrow
              onClick={() => navigate({ to: '/profile' })}
            />
          </SectionCard>
        </div>

        {/* Notifications — persisted channel preferences */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.notifications')}</SectionTitle>
          <SectionCard>
            {([
              { key: 'push', icon: Smartphone, label: t('settings.items.push') },
              { key: 'email', icon: Mail, label: t('settings.items.email') },
              { key: 'line', icon: MessageCircle, label: t('settings.items.line') },
              { key: 'sms', icon: Bell, label: t('settings.items.sms') },
            ] as const).map(({ key, icon, label }) => (
              <Row
                key={key}
                icon={icon}
                label={label}
                right={
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={(v) => saveNotifications(key, v)}
                    disabled={updatePreferences.isPending}
                    aria-label={label}
                  />
                }
              />
            ))}
          </SectionCard>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.preferences')}</SectionTitle>
          <SectionCard>
            <Row
              icon={Palette}
              label={t('settings.items.appearance')}
              value={t(`settings.theme.${theme === 'light' ? 'light' : theme === 'system' ? 'system' : 'dark'}`)}
              hasArrow
              onClick={toggleTheme}
            />
            <Row
              icon={Globe}
              label={t('settings.items.language')}
              value={currentLang.toUpperCase()}
              hasArrow
              onClick={() => i18n.changeLanguage(currentLang === 'th' ? 'en' : 'th')}
            />
            <Row
              icon={Wallet}
              label={t('settings.items.currency')}
              right={
                <Select
                  value={user?.currency || 'THB'}
                  onValueChange={(v) => savePreference({ currency: v })}
                >
                  <SelectTrigger className="w-24 h-8 bg-surface border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              }
            />
            <Row
              icon={Award}
              label={t('settings.items.preferredGrader')}
              right={
                <Select
                  value={user?.preferredGrader || ''}
                  onValueChange={(v) => savePreference({ preferredGrader: v })}
                >
                  <SelectTrigger className="w-32 h-8 bg-surface border-border text-xs">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    {GRADERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              }
            />
            <Row
              icon={Award}
              label={t('settings.items.preferredPreGrader')}
              right={
                <Select
                  value={user?.preferredPreGrader || ''}
                  onValueChange={(v) => savePreference({ preferredPreGrader: v })}
                >
                  <SelectTrigger className="w-32 h-8 bg-surface border-border text-xs">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    {PRE_GRADERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              }
            />
          </SectionCard>
        </div>

        {/* Security */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.security')}</SectionTitle>
          <SectionCard>
            <Row
              icon={KeyRound}
              label={t('settings.items.changePassword')}
              hasArrow
              onClick={() => setPasswordOpen(true)}
            />
          </SectionCard>
        </div>

        {/* Support */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.support')}</SectionTitle>
          <SectionCard>
            <Row
              icon={LifeBuoy}
              label={t('settings.items.help')}
              hasArrow
              onClick={() => { window.location.href = 'mailto:support@swibswap.app'; }}
            />
          </SectionCard>
        </div>

        {/* Danger zone */}
        <div className="space-y-2">
          <SectionTitle>{t('settings.sections.danger')}</SectionTitle>
          <SectionCard>
            <Row
              icon={Trash2}
              label={t('settings.items.deleteAccount')}
              danger
              onClick={() => setDeleteOpen(true)}
            />
          </SectionCard>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 rounded-xl bg-surface-light text-sm font-medium text-pldown hover:bg-pldown/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pldown"
        >
          {t('settings.items.signOut')}
        </button>

        <p className="text-center text-xs font-mono text-muted-foreground/60">v{APP_VERSION}</p>
      </div>

      {/* Change password dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-surface-light border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.dialogs.changePasswordTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
              placeholder={t('settings.dialogs.currentPassword')}
              className="bg-surface border-border"
              autoComplete="current-password"
            />
            <Input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
              placeholder={t('settings.dialogs.newPassword')}
              className="bg-surface border-border"
              autoComplete="new-password"
            />
            <Input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder={t('settings.dialogs.confirmPassword')}
              className="bg-surface border-border"
              autoComplete="new-password"
            />
            <Button
              className="w-full bg-brand hover:bg-brand-light"
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !pwForm.current || pwForm.next.length < 6}
            >
              {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('settings.dialogs.submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-surface-light border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-pldown">{t('settings.dialogs.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">{t('settings.dialogs.deleteDesc')}</p>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('settings.dialogs.currentPassword')}
              className="bg-surface border-border"
              autoComplete="current-password"
            />
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending || !deletePassword}
            >
              {deleteAccount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('settings.dialogs.deleteSubmit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

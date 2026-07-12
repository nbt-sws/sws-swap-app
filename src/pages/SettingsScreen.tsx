import { useNavigate } from '@tanstack/react-router';
import { useUser } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { ChevronRight, User, Bell, Palette, FileText, Shield, Database, Trash2, Star, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

interface SettingsItem {
  icon: LucideIcon | null;
  label: string;
  value?: string;
  hasArrow?: boolean;
  danger?: boolean;
  status?: string;
  onClick?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { toggleTheme } = useThemeStore();
  const { data: user } = useUser();

  const handleSignOut = () => {
    logout();
    navigate({ to: '/login' });
  };

  const showToast = (message: string) => {
    if (typeof window !== 'undefined') {
      window.alert(message);
    }
  };

  const sections: SettingsSection[] = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: User, label: 'Account', value: user?.fullName || 'BoBoBoA', hasArrow: true, onClick: () => navigate({ to: '/profile' }) },
        { icon: null, label: 'Subscription', value: user?.tier === 'MEMBER' ? 'member' : 'free', status: 'active' },
        { icon: Bell, label: 'Notifications', hasArrow: true, onClick: () => navigate({ to: '/notifications' }) },
        { icon: Palette, label: 'Appearance', value: 'dark', hasArrow: true, onClick: toggleTheme },
      ],
    },
    {
      title: 'LEGAL',
      items: [
        { icon: FileText, label: 'Terms of service', hasArrow: true, onClick: () => showToast('Terms of service coming soon') },
        { icon: Shield, label: 'Privacy policy', hasArrow: true, onClick: () => showToast('Privacy policy coming soon') },
        { icon: Database, label: 'Data sources', hasArrow: true, onClick: () => showToast('Data sources: eBay, Yahoo! JP, domestic Thai marketplaces') },
        { icon: Trash2, label: 'Delete my account', danger: true, onClick: () => {
          if (confirm('This is a demo. Account deletion is not implemented.')) showToast('Account deletion request received (demo)');
        } },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        { icon: null, label: 'Version', value: '1.0.0 build 42' },
        { icon: null, label: 'Developer', value: 'I1NOV', hasArrow: true, onClick: () => showToast('Built by I1NOV') },
        { icon: Star, label: 'Rate on App Store', hasArrow: true, onClick: () => showToast('Thanks for rating!') },
      ],
    },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Settings"
        icon={<Settings className="w-6 h-6 text-brand" />}
      />

      <div className="space-y-6">
        {/* Profile */}
        <button
          onClick={() => navigate({ to: '/profile' })}
          className="w-full bg-surface-light rounded-xl p-4 flex items-center gap-3 text-left hover:bg-surface-lighter transition"
        >
          <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-lg font-bold">
            {user?.fullName?.charAt(0) || 'B'}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{user?.fullName || 'BoBoBoA'}</p>
            <p className="text-xs text-muted-foreground">
              {user?.tier === 'MEMBER' ? 'Member' : 'Free'} · {user?.kycStatus === 'APPROVED' ? 'KYC verified' : 'KYC pending'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground px-1">
              {section.title}
            </h3>
            <div className="bg-surface-light rounded-xl overflow-hidden">
              {section.items.map((item, ii) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.1 + ii * 0.05 }}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                    ii < section.items.length - 1 ? 'border-b border-border/50' : ''
                  } ${item.danger ? 'text-pldown' : ''} ${item.onClick ? 'hover:bg-surface-lighter' : ''}`}
                >
                  {item.icon && (
                    <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center">
                      <item.icon className={`w-4 h-4 ${item.danger ? 'text-pldown' : 'text-muted-foreground'}`} />
                    </div>
                  )}
                  {!item.icon && <div className="w-8" />}
                  <span className={`flex-1 text-sm ${item.danger ? 'text-pldown' : ''}`}>{item.label}</span>
                  {item.value && (
                    <span className={`text-xs ${
                      item.status === 'active' ? 'text-cyan' : 'text-muted-foreground'
                    }`}>
                      {item.value}
                    </span>
                  )}
                  {item.hasArrow && (
                    <ChevronRight className={`w-4 h-4 ${item.danger ? 'text-pldown' : 'text-muted-foreground'}`} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pb-2 text-center">
          <p className="text-xs font-mono text-muted-foreground mb-1">SWIBSWAP · BY I1NOV</p>
          <p className="text-[10px] text-muted-foreground/60">© 2026 · made in Bangkok</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 rounded-xl bg-surface-light text-sm font-medium text-pldown hover:bg-pldown/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </PageContainer>
  );
}

import { useNavigate } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { DEV_USERS, DEV_USER_KEY } from '@/lib/dev-users';
import { toast } from 'sonner';
import { ShieldCheck, UserX, ArrowRight } from 'lucide-react';

const CONFIG = [
  {
    key: 'kyc' as const,
    label: 'KYC User',
    description: 'Verified user with APPROVED KYC (can buy, sell, list)',
    icon: ShieldCheck,
    color: 'bg-emerald-500/10 text-emerald-400',
    badge: 'KYC Verified',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    key: 'nonKyc' as const,
    label: 'Non-KYC User',
    description: 'Unverified user with NO KYC (limited features)',
    icon: UserX,
    color: 'bg-amber-500/10 text-amber-400',
    badge: 'No KYC',
    badgeColor: 'bg-amber-500/20 text-amber-300',
  },
];

export function DevLoginScreen() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const loginAs = (role: keyof typeof DEV_USERS) => {
    const user = DEV_USERS[role];
    const token = `dev-token-${role}`;
    setTokens(token);
    setUser(user);
    try {
      localStorage.setItem(DEV_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    toast.success(`Logged in as ${user.fullName}`);
    navigate({ to: '/' });
  };

  return (
    <PageContainer size="sm" className="py-6">
      <PageHeader title="Quick Login" description="Choose a test account to continue" />

      <div className="space-y-4">
        {CONFIG.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.key} className="bg-surface-light border-border hover:border-brand/30 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', c.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold">{c.label}</h3>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', c.badgeColor)}>
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <Button onClick={() => loginAs(c.key)} className="bg-brand hover:bg-brand-light shrink-0">
                  Login <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <p className="text-xs text-muted-foreground text-center">
          This page is only available in development or mock mode.
        </p>
      </div>
    </PageContainer>
  );
}

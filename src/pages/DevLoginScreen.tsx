import { useNavigate } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { DEV_USERS, DEV_USER_KEY } from '@/lib/dev-users';
import { toast } from 'sonner';
import { User, Store, Shield, ArrowRight } from 'lucide-react';

const CONFIG = [
  { key: 'buyer', label: 'Buyer', description: 'Regular user with APPROVED KYC', icon: User, color: 'bg-cyan/10 text-cyan' },
  { key: 'seller', label: 'Seller', description: 'Member user who can list & sell', icon: Store, color: 'bg-brand/10 text-brand' },
  { key: 'admin', label: 'Admin', description: 'Full admin dashboard access', icon: Shield, color: 'bg-plup/10 text-plup' },
] as const;

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
    toast.success(`Logged in as ${role}`);
    navigate({ to: '/' });
  };

  return (
    <PageContainer size="sm" className="py-6">
      <PageHeader title="Dev login" description="Quick test accounts" />

      <div className="space-y-4">
        {CONFIG.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.key} className="bg-surface-light border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', c.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.label}</h3>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <Button onClick={() => loginAs(c.key)} className="bg-brand hover:bg-brand-light">
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

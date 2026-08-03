import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Clock, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFeedAccess } from './useFeed';

/* KYC gate for the live feed (Phase 1 policy): the feed connects to the real
   social API, so only KYC-approved users get in. Guests → sign-in CTA;
   submitted → pending notice; otherwise → KYC CTA. */

export function FeedGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { status } = useFeedAccess();

  if (status === 'allowed') return <>{children}</>;

  return (
    <Card className="relative overflow-hidden border-brand/25 bg-surface-light/80">
      <div className="surreal-mesh absolute inset-0 opacity-50 pointer-events-none" />
      <CardContent className="relative flex flex-col items-center py-14 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-glow">
          {status === 'pending' ? (
            <Clock className="h-7 w-7" />
          ) : status === 'guest' ? (
            <LogIn className="h-7 w-7" />
          ) : (
            <ShieldCheck className="h-7 w-7" />
          )}
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-tight">
          {t(`feed.gate.${status}.title`)}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {t(`feed.gate.${status}.desc`)}
        </p>
        {status === 'guest' ? (
          <Button asChild className="mt-5 bg-brand hover:bg-brand-light hover:shadow-glow">
            <Link to="/login">{t('feed.gate.guest.cta')}</Link>
          </Button>
        ) : status === 'needKyc' ? (
          <Button asChild className="mt-5 bg-brand hover:bg-brand-light hover:shadow-glow">
            <Link to="/profile/kyc">{t('feed.gate.needKyc.cta')}</Link>
          </Button>
        ) : (
          <span className="mt-5 rounded-full bg-warning/10 border border-warning/30 px-4 py-1.5 text-xs font-semibold text-warning">
            {t('feed.gate.pending.cta')}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

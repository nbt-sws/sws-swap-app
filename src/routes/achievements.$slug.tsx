import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';

const ACHIEVEMENTS: Record<string, { title: string; description: string }> = {
  'first-purchase': { title: 'First Purchase', description: 'You completed your first order on SwibSwap.' },
  'vault-starter': { title: 'Vault Starter', description: 'You added 5 cards to your vault.' },
  'trader': { title: 'Trader', description: 'Complete a trade offer to unlock this badge.' },
  'top-buyer': { title: 'Top Buyer', description: 'Spend ฿100,000 on the platform to unlock.' },
  'verified': { title: 'Verified Member', description: 'Complete KYC verification to unlock.' },
  'collector': { title: 'Collector', description: 'Own 50 cards in your vault to unlock.' },
};

function AchievementDetailScreen() {
  const { slug } = useParams({ from: '/achievements/$slug' });
  const ach = ACHIEVEMENTS[slug];

  return (
    <PageContainer className="py-6">
      <Link to="/achievements" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to achievements
      </Link>
      <Card className="bg-surface-light border-border">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-pregrade/20 mx-auto flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-pregrade" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{ach?.title ?? 'Achievement'}</h1>
          <p className="text-muted-foreground mb-6">{ach?.description ?? 'Achievement details coming soon.'}</p>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/market">Keep trading</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export const Route = createFileRoute('/achievements/$slug')({
  component: AchievementDetailScreen,
});

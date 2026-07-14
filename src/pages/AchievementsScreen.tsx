import { Link } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock } from 'lucide-react';

const ACHIEVEMENTS = [
  { slug: 'first-purchase', title: 'First Purchase', description: 'Complete your first order.', progress: 100, unlocked: true },
  { slug: 'vault-starter', title: 'Vault Starter', description: 'Add 5 cards to your vault.', progress: 100, unlocked: true },
  { slug: 'trader', title: 'Trader', description: 'Complete a trade offer.', progress: 60, unlocked: false },
  { slug: 'top-buyer', title: 'Top Buyer', description: 'Spend ฿100,000 on the platform.', progress: 34, unlocked: false },
  { slug: 'verified', title: 'Verified Member', description: 'Complete KYC verification.', progress: 0, unlocked: false },
  { slug: 'collector', title: 'Collector', description: 'Own 50 cards in your vault.', progress: 18, unlocked: false },
];

export function AchievementsScreen() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Achievements"
        icon={<Trophy className="w-6 h-6 text-brand" />}
        description={`${unlocked} of ${ACHIEVEMENTS.length} unlocked`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACHIEVEMENTS.map((a) => (
          <Link
            key={a.slug}
            to="/achievements/$slug"
            params={{ slug: a.slug }}
            className="block"
          >
            <Card className={`bg-surface-light border-border transition hover:ring-1 hover:ring-brand/50 ${a.unlocked ? '' : 'opacity-70'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.unlocked ? 'bg-pregrade/20 text-pregrade' : 'bg-muted text-muted-foreground'}`}>
                    {a.unlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">{a.title}</h3>
                      {a.unlocked && <span className="text-xs text-pregrade font-bold">UNLOCKED</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{a.description}</p>
                    <Progress value={a.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{a.progress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';

const CAMPAIGNS: Record<string, { title: string; description: string }> = {
  'summer-drop': { title: 'Summer Card Drop', description: 'Exclusive One Piece SEC cards with vault verification.' },
  'new-seller-bonus': { title: 'New Seller Bonus', description: 'Zero selling fees for your first 3 listings.' },
  'trade-week': { title: 'Trade Week', description: 'Trade cards safely with escrow protection.' },
};

function CampaignDetailScreen() {
  const { slug } = useParams({ from: '/campaigns/$slug' });
  const campaign = CAMPAIGNS[slug];

  return (
    <PageContainer className="py-6">
      <Link to="/campaigns" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to campaigns
      </Link>
      <Card className="bg-surface-light border-border">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan/10 mx-auto flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-cyan" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{campaign?.title ?? 'Campaign'}</h1>
          <p className="text-muted-foreground mb-6">{campaign?.description ?? 'Campaign details coming soon.'}</p>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/market">Browse market</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export const Route = createFileRoute('/campaigns/$slug')({
  component: CampaignDetailScreen,
});

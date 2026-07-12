import { Link } from '@tanstack/react-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, ArrowRight } from 'lucide-react';

const CAMPAIGNS = [
  {
    id: 'c1',
    slug: 'summer-drop',
    title: 'Summer Card Drop',
    subtitle: 'Exclusive One Piece SEC cards with vault verification',
    status: 'ACTIVE',
    endsAt: '2026-07-31',
    color: 'from-brand to-periwinkle',
  },
  {
    id: 'c2',
    slug: 'new-seller-bonus',
    title: 'New Seller Bonus',
    subtitle: 'Zero selling fees for your first 3 listings',
    status: 'ACTIVE',
    endsAt: '2026-08-15',
    color: 'from-cyan to-brand',
  },
  {
    id: 'c3',
    slug: 'trade-week',
    title: 'Trade Week',
    subtitle: 'Trade cards safely with escrow protection',
    status: 'ENDED',
    endsAt: '2026-06-30',
    color: 'from-plup to-cyan',
  },
];

export function CampaignsScreen() {
  const active = CAMPAIGNS.filter((c) => c.status === 'ACTIVE');
  const ended = CAMPAIGNS.filter((c) => c.status === 'ENDED');

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Campaigns"
        icon={<Zap className="w-6 h-6 text-brand" />}
        description="Discover offers, drops, and events"
      />

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Live now ({active.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {active.map((campaign) => (
              <Link key={campaign.id} to="/campaigns/$slug" params={{ slug: campaign.slug }} className="group block h-full">
                <Card className="bg-surface-light border-border overflow-hidden hover:border-brand/30 transition h-full">
                  <div className={`h-40 bg-gradient-to-br ${campaign.color} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-white/20 text-white backdrop-blur-sm border-0">
                        Active
                      </Badge>
                      <h3 className="text-white font-bold text-lg mt-2">{campaign.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{campaign.subtitle}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Ends {campaign.endsAt}
                      </span>
                      <span className="text-sm font-medium text-brand group-hover:underline flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {ended.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Ended ({ended.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {ended.map((campaign) => (
                <Link key={campaign.id} to="/campaigns/$slug" params={{ slug: campaign.slug }} className="group block h-full">
                  <Card className="bg-surface-light border-border overflow-hidden h-full">
                    <div className={`h-40 bg-gradient-to-br ${campaign.color} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge variant="outline" className="text-white border-white/30">
                          Ended
                        </Badge>
                        <h3 className="text-white font-bold text-lg mt-2">{campaign.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{campaign.subtitle}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}

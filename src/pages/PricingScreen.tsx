import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCardPrice } from '@/hooks/useApi';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { AreaChart as ReAreaChart, Area, ResponsiveContainer } from 'recharts';
import { AreaChart, List, Tag, Info } from 'lucide-react';
import type { Card } from '@/types';

const TABS = [
  { id: 'listing', label: 'Listing', icon: List },
  { id: 'lastSold', label: 'Last Sold', icon: Tag },
  { id: 'chart', label: 'Chart', icon: AreaChart },
  { id: 'info', label: 'Info', icon: Info },
];

export function PricingScreen() {
  const navigate = useNavigate();
  const [rawVsGraded, setRawVsGraded] = useState<'Raw' | 'Graded'>('Raw');
  const [activeTab, setActiveTab] = useState('listing');

  // Read scan result from sessionStorage
  const scanResult = (() => {
    const raw = sessionStorage.getItem('scanResult');
    if (raw) {
      try { return JSON.parse(raw) as Card; } catch { return null; }
    }
    return null;
  })();

  const { data: priceData } = useCardPrice(scanResult?.code || 'OP02-013');

  const handleAddToVault = () => {
    // Pass scan result to add-to-vault via sessionStorage
    if (scanResult) {
      sessionStorage.setItem('pricingCard', JSON.stringify(scanResult));
    }
    navigate({ to: '/add-to-vault' });
  };

  const card = scanResult || {
    code: 'OP02-013',
    nameEn: 'Portgas D. Ace',
    nameJp: 'ポートガス・D・エース',
    rarity: 'SR',
    type: 'Character',
    language: 'JP',
  };

  return (
    <ScrollablePage
      footer={
        <button
          onClick={handleAddToVault}
          className="w-full bg-brand-gradient rounded-xl py-4 font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform"
        >
          + Add to SwibsVault
        </button>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title={card.nameEn}
          description={card.code}
          back={{ to: '/scanner' }}
        />

        {/* Card identity */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-brand bg-brand/10 px-2 py-0.5 rounded">
                {rawVsGraded}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{card.code}</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{card.nameJp}</p>
          </div>
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2">
          {['SR', 'Character', 'JP'].map((tag) => (
            <span key={tag} className="text-[10px] font-mono bg-surface-light px-2 py-1 rounded-md text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Four key stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-light rounded-xl p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">HIGHEST</p>
            <p className="text-lg font-bold font-mono text-plup">
              ฿{priceData?.highest.toLocaleString() || '27,033'}
            </p>
          </div>
          <div className="bg-surface-light rounded-xl p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">LOWEST</p>
            <p className="text-lg font-bold font-mono text-pldown">
              ฿{priceData?.lowest.toLocaleString() || '8,435'}
            </p>
          </div>
          <div className="bg-surface-light rounded-xl p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">30-DAY TREND</p>
            <p className="text-lg font-bold font-mono text-plup">
              ↑ {priceData?.trend30d || 8.2}%
            </p>
          </div>
          <div className="bg-surface-light rounded-xl p-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">CURRENT PRICE</p>
            <p className="text-lg font-bold font-mono text-white">
              ฿{priceData?.current.toLocaleString() || '18,440'}
            </p>
          </div>
        </div>

        {/* Raw vs Graded toggle */}
        <div className="flex bg-surface-light rounded-xl p-1">
          {(['Raw', 'Graded'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setRawVsGraded(option)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                rawVsGraded === option
                  ? 'bg-brand text-white'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {activeTab === 'listing' && (
            <div className="space-y-3">
              {(priceData?.listings || [
                { platform: 'eBay', price: 19200, seller: 'JP seller' },
                { platform: 'Yahoo! JP', price: 17800, ended: '2d ago' },
              ]).map((listing, i) => (
                <div key={i} className="bg-surface-light rounded-xl p-4">
                  <p className="text-xs font-medium mb-1">{card.nameEn} {card.rarity} ({card.language})</p>
                  <p className="text-lg font-bold font-mono mb-1">฿{listing.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {listing.platform} · {listing.seller || listing.ended}
                  </p>
                </div>
              ))}

              {/* JP proxy CTA */}
              <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan">Buying from Japan?</p>
                    <p className="text-xs text-cyan/70 mt-0.5">JP proxy price incl. fees & shipping</p>
                  </div>
                  <span className="text-cyan text-lg">→</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ReAreaChart data={priceData?.history || []}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F06AA8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#F06AA8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#F06AA8"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </ReAreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'lastSold' && (
            <div className="space-y-3">
              {(priceData?.lastSold || [
                { platform: 'eBay', price: 18500, date: '2026-07-01' },
                { platform: 'Yahoo! JP', price: 17200, date: '2026-06-28' },
              ]).map((sold, i) => (
                <div key={i} className="bg-surface-light rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{sold.platform}</p>
                    <p className="text-xs text-muted-foreground">{sold.date}</p>
                  </div>
                  <p className="text-sm font-bold font-mono">฿{sold.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Card pricing data is aggregated from multiple marketplaces including eBay, Yahoo! Japan Auctions, and domestic Thai marketplaces.</p>
              <p>Prices are updated daily and reflect the current market conditions for {card.language} printings.</p>
              <p className="text-xs">Last updated: July 8, 2026</p>
            </div>
          )}
        </div>
      </div>
    </ScrollablePage>
  );
}

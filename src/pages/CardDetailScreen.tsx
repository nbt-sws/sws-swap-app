import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useVault, useCardPrice } from '@/hooks/useApi';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const TIME_RANGES = ['1M', '3M', '6M', '1Y', 'ALL'];

export function CardDetailScreen() {
  const { data: vault } = useVault();
  const navigate = useNavigate();
  const selectedCardId = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('cardId') || sessionStorage.getItem('selectedCardId');
  })();
  const [activeRange, setActiveRange] = useState('3M');

  const item = vault?.find((v) => v.id === selectedCardId);
  const { data: priceData } = useCardPrice(item?.card.code || '');

  if (!item) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Card not found</p>
      </div>
    );
  }

  return (
    <ScrollablePage>
      <div className="space-y-6">
        <PageHeader
          title={item.card.nameEn}
          description={item.card.code}
          back={{ to: '/vault' }}
        />

        {/* Condition + Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-mono bg-surface-light px-2 py-1 rounded-md">{item.condition}</span>
          <span className="text-[10px] font-mono bg-surface-light px-2 py-1 rounded-md">{item.card.rarity}</span>
          <span className="text-[10px] font-mono bg-surface-light px-2 py-1 rounded-md">{item.card.type}</span>
          <span className="text-[10px] font-mono bg-surface-light px-2 py-1 rounded-md">{item.card.language}</span>
        </div>

        {/* Provenance */}
        <div>
          <p className="text-xs text-muted-foreground">
            from {item.source} · {new Date(item.dateAcquired).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Position Tiles */}
        <div>
          <p className="text-[10px] font-mono tracking-wider text-muted-foreground mb-2">
            POSITION · THB
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-light rounded-xl p-3">
              <p className="text-[9px] font-mono text-muted-foreground mb-1">PAID</p>
              <p className="text-sm font-bold font-mono">฿{item.paidPrice.toLocaleString()}</p>
            </div>
            <div className="bg-surface-light rounded-xl p-3 relative">
              <div className="absolute inset-0 rounded-xl border-2 border-cyan/30" />
              <p className="text-[9px] font-mono text-muted-foreground mb-1 relative z-10">CURRENT</p>
              <p className="text-sm font-bold font-mono relative z-10">
                {item.status === 'sold' ? '—' : `฿${item.currentPrice.toLocaleString()}`}
              </p>
            </div>
            <div className="bg-surface-light rounded-xl p-3">
              <p className="text-[9px] font-mono text-muted-foreground mb-1">P/L</p>
              <p className={`text-sm font-bold font-mono ${item.plAmount >= 0 ? 'text-plup' : 'text-pldown'}`}>
                {item.plAmount >= 0 ? '+' : ''}฿{item.plAmount.toLocaleString()}
              </p>
              <p className={`text-[9px] font-mono ${item.plPercent >= 0 ? 'text-plup' : 'text-pldown'}`}>
                {item.plPercent >= 0 ? '▲' : '▼'} {Math.abs(item.plPercent).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Price History */}
        <div>
          <p className="text-[10px] font-mono tracking-wider text-muted-foreground mb-2">
            PRICE HISTORY
          </p>

          {/* Range pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeRange === range ? 'bg-brand text-white' : 'bg-surface-light text-muted-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-surface-light rounded-xl p-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData?.history || []}>
                  <defs>
                    <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F06AA8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F06AA8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="price" stroke="#F06AA8" strokeWidth={2} fill="url(#detailGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              your buy-in ฿{item.paidPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {item.status === 'held' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate({ to: '/market' })}
              className="w-full bg-surface-light rounded-xl py-4 text-sm font-medium hover:bg-surface-lighter transition-colors"
            >
              List on SwibSwap Market
            </button>
            <button
              onClick={() => navigate({ to: '/pregrade', search: { category: 'PREGRADE' } })}
              className="w-full bg-surface-light rounded-xl py-4 text-sm font-medium hover:bg-surface-lighter transition-colors"
            >
              Send for pre-grade · RAWLITY / BLACKLENS
            </button>
            <button className="w-full bg-surface-light rounded-xl py-4 text-sm font-medium text-pldown hover:bg-surface-lighter transition-colors">
              Mark as sold
            </button>
          </div>
        )}
      </div>
    </ScrollablePage>
  );
}

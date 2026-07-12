import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardPriceData } from '@/types';

interface PriceChartProps {
  data: { date: string; price: number }[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  trend?: number;
  className?: string;
  compact?: boolean;
}

const PERIODS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '1y', label: '1Y' },
];

export function PriceChart({
  data,
  period = '30d',
  onPeriodChange,
  trend,
  className,
  compact,
}: PriceChartProps) {
  const trendValue = trend ?? 0;
  const isPositive = trendValue >= 0;

  const timeAgo = useMemo(() => {
    if (!data.length) return '-';
    const first = new Date(data[0].date);
    const last = new Date(data[data.length - 1].date);
    const diffDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)));
    return `${diffDays}d trend`;
  }, [data]);

  return (
    <Card className={cn('bg-surface-light border-border', className)}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn('font-semibold', compact && 'text-sm')}>Price History</h3>
          <div className="flex items-center gap-2">
            {onPeriodChange && (
              <div className="flex items-center gap-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPeriodChange(p.id)}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                      period === p.id
                        ? 'bg-surface-lighter text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <span className={cn('text-xs', isPositive ? 'text-plup' : 'text-pldown')}>
              {isPositive ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
              {Math.abs(trendValue).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className={compact ? 'h-36' : 'h-48'}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F06AA8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F06AA8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E2248', border: '1px solid #282D5A', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Price']}
                labelFormatter={() => ''}
              />
              <Area type="monotone" dataKey="price" stroke="#F06AA8" strokeWidth={2} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PriceChartFromPriceData({
  priceData,
  period = '30d',
  onPeriodChange,
  className,
  compact,
}: {
  priceData?: CardPriceData;
  period?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
  compact?: boolean;
}) {
  if (!priceData || priceData.history.length === 0) return null;
  return (
    <PriceChart
      data={priceData.history}
      period={period}
      onPeriodChange={onPeriodChange}
      trend={priceData.trend30d}
      className={className}
      compact={compact}
    />
  );
}

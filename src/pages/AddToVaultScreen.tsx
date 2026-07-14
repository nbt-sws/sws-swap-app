import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddToVault } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import type { Card } from '@/types';

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5'];

export function AddToVaultScreen() {
  const navigate = useNavigate();
  const addToVault = useAddToVault();

  // Read card from sessionStorage (set by Scanner or Pricing screen)
  const card = (() => {
    const raw = sessionStorage.getItem('pricingCard') || sessionStorage.getItem('scanResult');
    if (raw) {
      try { return JSON.parse(raw) as Card; } catch { return null; }
    }
    return null;
  })();

  const [paidPrice, setPaidPrice] = useState('');
  const [condition, setCondition] = useState('Raw');
  const [dateAcquired, setDateAcquired] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');

  const currentPrice = 18440;
  const paidNum = parseFloat(paidPrice) || 0;
  const plAmount = currentPrice - paidNum;
  const plPercent = paidNum > 0 ? (plAmount / paidNum) * 100 : 0;

  const handleSave = () => {
    if (!card || paidNum <= 0) return;
    addToVault.mutate(
      {
        name: card.nameEn,
        sku: card.code,
        category: card.game,
        subCategory: card.rarity,
        itemFormat: card.language,
        condition,
        description: `Type: ${card.type}, NameJP: ${card.nameJp}, Source: ${source || 'Scanned import'}, Paid: ${paidNum} THB`,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem('pricingCard');
          navigate({ to: '/vault' });
        },
      }
    );
  };

  return (
    <ScrollablePage
      header={
        <PageHeader
          title="Add to SwibsVault"
          description={`${card?.code} · ${card?.nameEn} · ${card?.rarity} (${card?.language})`}
          back={{ to: '/pricing' }}
        />
      }
      footer={
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate({ to: '/pricing' })}
            className="flex-1 py-4 rounded-xl bg-surface-light text-sm font-medium hover:bg-surface-lighter transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!paidPrice || addToVault.isPending}
            className={`flex-[2] py-4 rounded-xl text-sm font-semibold transition-all ${
              paidPrice && !addToVault.isPending
                ? 'bg-brand-gradient shadow-glow active:scale-[0.98]'
                : 'bg-surface-lighter text-muted-foreground cursor-not-allowed'
            }`}
          >
            {addToVault.isPending ? 'Saving…' : 'Save to vault'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Paid Price */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label htmlFor="paidPrice" className="text-xs font-mono tracking-wider text-muted-foreground block mb-2">
            PAID PRICE (THB)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">฿</span>
            <Input
              id="paidPrice"
              type="number"
              value={paidPrice}
              onChange={(e) => setPaidPrice(e.target.value)}
              placeholder="0"
              className="pl-8 text-lg font-bold font-mono"
            />
          </div>
        </motion.div>

        {/* Condition */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-xs font-mono tracking-wider text-muted-foreground block mb-2">
            CONDITION
          </label>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  condition === c
                    ? 'bg-brand text-white'
                    : 'bg-surface-light text-muted-foreground hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
            <button className="px-4 py-2 rounded-xl text-xs font-medium bg-surface-light text-muted-foreground hover:text-white transition-all">
              more…
            </button>
          </div>
        </motion.div>

        {/* Date Acquired */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="dateAcquired" className="text-xs font-mono tracking-wider text-muted-foreground block mb-2">
            DATE ACQUIRED
          </label>
          <Input
            id="dateAcquired"
            type="date"
            value={dateAcquired}
            onChange={(e) => setDateAcquired(e.target.value)}
            className="font-mono"
          />
        </motion.div>

        {/* Source/Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="source" className="text-xs font-mono tracking-wider text-muted-foreground block mb-2">
            SOURCE / NOTE
          </label>
          <Input
            id="source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Yahoo! JP auction · via proxy"
          />
        </motion.div>

        {/* P/L Preview */}
        {paidNum > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-surface-light rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">MARKET NOW</span>
                <span className="text-sm font-bold font-mono">฿{currentPrice.toLocaleString()}</span>
              </div>
              <div className="h-px bg-border mb-3" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">P/L PREVIEW</span>
                <span className={`text-sm font-bold font-mono ${plAmount >= 0 ? 'text-plup' : 'text-pldown'}`}>
                  {plAmount >= 0 ? '+' : ''}฿{plAmount.toLocaleString()} · {plAmount >= 0 ? '+' : ''}{plPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ScrollablePage>
  );
}

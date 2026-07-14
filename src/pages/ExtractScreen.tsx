import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import type { Card } from '@/types';

interface ExtractField {
  label: string;
  value: string;
  delay: number;
}

export function ExtractScreen() {
  const navigate = useNavigate();
  const [revealedFields, setRevealedFields] = useState<number>(0);
  const [isMatching, setIsMatching] = useState(false);

  // Read scan result from sessionStorage (set by ScannerScreen)
  const scanResult = useMemo<Card | null>(() => {
    const raw = sessionStorage.getItem('scanResult');
    if (raw) {
      try {
        return JSON.parse(raw) as Card;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const fields = useMemo<ExtractField[]>(() => [
    { label: 'Card code', value: scanResult?.code || 'OP02-013', delay: 0 },
    { label: 'Name (JP)', value: scanResult?.nameJp || 'ポートガス・D・エース', delay: 300 },
    { label: 'Name (EN)', value: scanResult?.nameEn || 'Portgas D. Ace', delay: 600 },
    { label: 'Rarity', value: `${scanResult?.rarity || 'SR'} · 97%`, delay: 900 },
  ], [scanResult]);

  useEffect(() => {
    // Staged reveal
    fields.forEach((_, index) => {
      setTimeout(() => {
        setRevealedFields(index + 1);
      }, fields[index].delay);
    });

    // Database matching phase
    setTimeout(() => {
      setIsMatching(true);
    }, 1400);

    // Auto-advance to pricing
    const timeout = setTimeout(() => {
      navigate({ to: '/pricing' });
    }, 2500);

    return () => clearTimeout(timeout);
  }, [navigate, fields]);

  return (
    <div className="h-full flex flex-col bg-surface px-5">
      {/* Header */}
      <div className="pt-6 pb-8">
        <p className="text-xs text-muted-foreground font-mono">Reading your card…</p>
        <h1 className="text-xl font-bold mt-1">AI extracting details</h1>
      </div>

      {/* Extracted fields */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-6">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: revealedFields > index ? 1 : 0.3,
              x: revealedFields > index ? 0 : -20,
            }}
            transition={{ duration: 0.3 }}
            className="bg-surface-light rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                <p className={`font-mono text-sm ${
                  revealedFields > index ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {revealedFields > index ? field.value : '...'}
                </p>
              </div>
              {revealedFields > index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-plup/20 flex items-center justify-center"
                >
                  <span className="text-plup text-xs">✓</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Database matching spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isMatching ? 1 : 0.3 }}
          className="bg-surface-light rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Database match</p>
              <p className={`font-mono text-sm ${
                isMatching ? 'text-cyan' : 'text-muted-foreground'
              }`}>
                {isMatching ? 'matching against price database…' : 'pending...'}
              </p>
            </div>
            {isMatching && (
              <div className="w-5 h-5 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Failure path hint */}
      <p className="text-center text-xs text-muted-foreground pb-8">
        Extraction → Pricing (auto) · failure → back to Scanner
      </p>
    </div>
  );
}

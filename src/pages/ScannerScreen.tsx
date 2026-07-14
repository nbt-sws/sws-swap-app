import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, Image } from 'lucide-react';
import type { Card } from '@/types';

export function ScannerScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [captured, setCaptured] = useState(false);
  const [selectedGame] = useState<'one-piece' | 'yu-gi-oh'>('one-piece');
  const [selectedLanguage] = useState<string>('JP');

  // Mock camera access with a placeholder
  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => {
      // Mock scan result stored in local state, then navigate to extract
      const mockCard: Card = {
        id: 'scanned-' + Date.now(),
        code: 'OP02-013',
        nameEn: 'Portgas D. Ace',
        nameJp: 'ポートガス・D・エース',
        rarity: 'SR',
        type: 'Character',
        language: selectedLanguage,
        game: selectedGame,
        condition: 'Raw',
      };
      // Store in sessionStorage for extract page to read
      sessionStorage.setItem('scanResult', JSON.stringify(mockCard));
      navigate({ to: '/extract' });
    }, 500);
  };

  const gameLabel = selectedGame === 'one-piece' ? 'One Piece' : 'Yu-Gi-Oh!';
  const langLabel = selectedLanguage;

  return (
    <div className="relative h-[calc(100vh-10.5rem)] md:h-[calc(100vh-6rem)] bg-black overflow-hidden">
      {/* Camera view (mock) */}
      <div className="absolute inset-x-0 top-0 bottom-36 bg-black">
        {/* Mock camera feed - dark with subtle noise */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/scan' })}
              aria-label={t('common.back')}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Context pill */}
            <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur">
              <span className="text-sm text-white">{gameLabel} · {langLabel}</span>
            </div>
          </div>
        </div>

        {/* Center framing brackets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-96 max-w-[90vw] max-h-[60vh] relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-brand" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-brand" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-brand" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-brand" />

            {/* Code hint box */}
            <div className="absolute bottom-12 right-4 w-32 h-10 border border-dashed border-cyan/60 rounded flex items-center justify-center">
              <span className="text-xs text-cyan/80 font-mono">code here →</span>
            </div>
          </div>
        </div>

        {/* Hint text */}
        <div className="absolute top-24 left-0 right-0 text-center">
          <p className="text-xs text-white/60">AI reads code from bottom-right corner</p>
          <p className="text-xs text-white/40 mt-1">DON!! cards have no code — fill the frame</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black px-5 pb-10 pt-6">
        <div className="flex items-center justify-between">
          {/* Gallery upload */}
          <button
            onClick={handleCapture}
            className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Image className="w-6 h-6 text-white" />
          </button>

          {/* Shutter button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </motion.button>

          {/* Placeholder for symmetry */}
          <div className="w-14 h-14" />
        </div>
        <p className="text-center text-xs text-white/40 mt-4 font-mono">
          tap to capture
        </p>
      </div>

      {/* Captured flash */}
      {captured && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white z-50"
        />
      )}
    </div>
  );
}

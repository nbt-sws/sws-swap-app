import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { GameMark } from '@/components/domain/GameMark';

const GAMES = [
  {
    id: 'one-piece' as const,
    name: 'One Piece TCG',
    languages: ['JP · EN · DON!! · Promo'],
  },
  {
    id: 'yu-gi-oh' as const,
    name: 'Yu-Gi-Oh!',
    languages: ['JP (OCG) · Asian-English · Promo'],
  },
];

const LANGUAGES: Record<string, { id: string; name: string; code: string; sub: string }[]> = {
  'one-piece': [
    { id: 'jp', name: 'Japanese', code: '日', sub: 'JP printing · original release' },
    { id: 'en', name: 'English', code: 'EN', sub: 'International release' },
  ],
  'yu-gi-oh': [
    { id: 'jp', name: 'Japanese', code: '日', sub: 'JP printing · OCG' },
    { id: 'ae', name: 'Asian-English', code: 'AE', sub: 'AE printing · 1st edition' },
  ],
};

export function PickerScreen() {
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleLangSelect = (langId: string) => {
    setSelectedLang(langId);
  };

  const handleNext = () => {
    if (step === 1 && selectedGame) {
      setStep(2);
    } else if (step === 2 && selectedLang) {
      navigate({ to: '/scanner' });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedLang(null);
    } else {
      navigate({ to: '/' });
    }
  };

  const langs = selectedGame ? LANGUAGES[selectedGame] || [] : [];

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground font-mono">
            STEP {step} / 2
          </p>
          <h1 className="text-lg font-bold">
            {step === 1 ? 'Pick your game' : 'Card language'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="games"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleGameSelect(game.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    selectedGame === game.id
                      ? 'bg-brand-gradient border-transparent shadow-glow'
                      : 'bg-surface-light border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <GameMark game={game.id} size="lg" />
                  <div className="flex-1">
                    <p className="font-semibold">{game.name}</p>
                    <p className={`text-xs mt-0.5 ${
                      selectedGame === game.id ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {game.languages[0]}
                    </p>
                  </div>
                  {selectedGame === game.id && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="langs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {langs.map((lang, i) => (
                <motion.button
                  key={lang.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleLangSelect(lang.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    selectedLang === lang.id
                      ? 'bg-brand-gradient border-transparent shadow-glow'
                      : 'bg-surface-light border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono ${
                    selectedLang === lang.id ? 'bg-white/20' : 'bg-surface-lighter'
                  }`}>
                    {lang.code}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{lang.name}</p>
                    <p className={`text-xs mt-0.5 ${
                      selectedLang === lang.id ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {lang.sub}
                    </p>
                  </div>
                  {selectedLang === lang.id && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleNext}
          disabled={step === 1 ? !selectedGame : !selectedLang}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            (step === 1 ? selectedGame : selectedLang)
              ? 'bg-brand-gradient shadow-glow active:scale-[0.98]'
              : 'bg-surface-lighter text-muted-foreground cursor-not-allowed'
          }`}
        >
          {step === 1 ? 'Next →' : 'Start scanning →'}
        </button>
      </div>
    </div>
  );
}

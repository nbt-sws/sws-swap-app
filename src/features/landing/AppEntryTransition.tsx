import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/* ══════════════════════════════════════════════════════════════════
   AppEntryTransition — full-screen branded overlay that plays when
   the user clicks "Launch App" from the landing page.

   Sequence (total ~1.7s):
     0ms    → overlay fades in (dark bg)
     0-600ms → VAULT UNLOCK: card rises + flips to reveal logo
     500ms  → logo name + tagline fade in
     900ms  → progress bar starts filling
     1500ms → overlay slides up/out, revealing the app beneath
   ══════════════════════════════════════════════════════════════════ */

interface AppEntryTransitionProps {
  onComplete: () => void;
  active: boolean;
}

export function AppEntryTransition({ active, onComplete }: AppEntryTransitionProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'idle' | 'enter' | 'exit'>('idle');

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      return;
    }
    setPhase('enter');
    const exitTimer = setTimeout(() => setPhase('exit'), 1500);
    const doneTimer = setTimeout(() => {
      setPhase('idle');
      onComplete();
    }, 1900);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [active, onComplete]);

  if (phase === 'idle') return null;

  const overlay = (
    <AnimatePresence>
      {(phase === 'enter' || phase === 'exit') && (
        <motion.div
          key="entry-overlay"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-10%' }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Ambient glow behind everything ───────────────────── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-1/2 top-[40%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/18 blur-[120px]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute left-1/2 top-[40%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-periwinkle/12 blur-[90px]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
            />
          </div>

          {/* ── Center stage ─────────────────────────────────────── */}
          <div className="relative flex flex-col items-center">

            {/* ═══ VAULT UNLOCK micro-animation ═══ */}
            <div className="relative" style={{ perspective: '800px' }}>
              {/* Card container — rises from below while flipping */}
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center"
                initial={{ y: 40, opacity: 0, rotateY: -90, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, rotateY: 0, scale: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card back (lock icon) — visible briefly before flip */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border/60 bg-surface-light shadow-lg"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0.3, duration: 0.15 }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </motion.div>

                {/* Card front → becomes the logo */}
                <motion.div
                  className="flex h-full w-full items-center justify-center rounded-2xl border border-brand/30 bg-surface-dark shadow-[0_0_30px_rgba(240,106,168,0.25)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.2 }}
                >
                  <motion.img
                    src="/logo.png"
                    alt="SwibSwap"
                    className="h-12 w-12 rounded-xl object-contain"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{
                      filter: 'drop-shadow(0 0 16px rgba(240,106,168,0.6)) drop-shadow(0 0 32px rgba(123,138,245,0.3))',
                    }}
                  />
                </motion.div>

                {/* Unlock spark burst — little particles when card reveals */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i * 60) * (Math.PI / 180);
                  const dist = 50;
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-brand"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{
                        delay: 0.5 + i * 0.03,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>

            {/* ═══ Logo name ═══ */}
            <motion.p
              className="mt-5 text-xl font-extrabold tracking-tight neon-text-brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              SwibSwap
            </motion.p>

            {/* ═══ Tagline ═══ */}
            <motion.p
              className="mt-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              {t('welcome.transition.loading')}
            </motion.p>

            {/* ═══ Progress bar ═══ */}
            <div className="mt-5 h-[2px] w-36 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full bg-brand"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.1, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}

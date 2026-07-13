import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth';
import { motion } from 'framer-motion';

export function SplashScreen() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate({ to: '/' });
      } else {
        navigate({ to: '/login' });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-surface relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-periwinkle/20 rounded-full blur-[100px]" />
      
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 z-10"
      >
        {/* Brand mark */}
        <img
          src="/logo.png"
          alt="SwibSwap"
          className="w-20 h-20 rounded-xl object-contain shadow-glow"
        />
        
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">SwibSwap</h1>
          <p className="text-sm font-mono tracking-[0.3em] text-muted-foreground mt-3">
            SCAN · TRADE · COLLECT
          </p>
        </div>
      </motion.div>
      
      {/* Loading spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-32"
      >
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </motion.div>
      

    </div>
  );
}

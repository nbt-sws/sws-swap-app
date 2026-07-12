import { useAppStore } from '@/hooks/useAppStore';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Vault, Settings, Scan } from 'lucide-react';

const TABS = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'market' as const, label: 'Market', icon: ShoppingBag },
  { id: 'scan' as const, label: 'Scan', icon: Scan, isFab: true },
  { id: 'vault' as const, label: 'Vault', icon: Vault },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setScreen = useAppStore((s) => s.setScreen);

  const handleTabPress = (tabId: string) => {
    if (tabId === 'scan') {
      setScreen('picker');
    } else {
      setActiveTab(tabId as 'home' | 'market' | 'vault' | 'settings');
    }
  };

  return (
    <div className="shrink-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-border/50 z-50 relative">
      <div className="h-full flex items-center justify-around px-2">
        {TABS.map((tab) => {
          if (tab.isFab) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center shadow-glow"
                >
                  <tab.icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                  {tab.label}
                </span>
              </button>
            );
          }

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-brand/10' : ''
              }`}>
                <tab.icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-brand' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`text-[10px] transition-colors ${
                isActive ? 'text-brand font-medium' : 'text-muted-foreground'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

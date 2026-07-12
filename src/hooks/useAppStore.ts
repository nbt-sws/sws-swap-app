import { create } from 'zustand';
import type { Screen, Tab, Card } from '@/types';

interface AppState {
  screen: Screen;
  prevScreen: Screen | null;
  activeTab: Tab;
  selectedCardId: string | null;
  selectedCard: Card | null;
  scanResult: Card | null;
  selectedGame: string | null;
  selectedLanguage: string | null;
  currency: string;
  isAuthenticated: boolean;
  
  setScreen: (screen: Screen) => void;
  goBack: () => void;
  setActiveTab: (tab: Tab) => void;
  setSelectedCardId: (id: string | null) => void;
  setSelectedCard: (card: Card | null) => void;
  setScanResult: (card: Card | null) => void;
  setSelectedGame: (game: string | null) => void;
  setSelectedLanguage: (lang: string | null) => void;
  setCurrency: (currency: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
  navigateToCard: (cardId: string) => void;
  navigateFromTab: (tab: Tab) => void;
}

const TAB_ROOTS: Record<Tab, Screen> = {
  home: 'home',
  market: 'market',
  vault: 'vault',
  settings: 'settings',
};

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'splash',
  prevScreen: null,
  activeTab: 'home',
  selectedCardId: null,
  selectedCard: null,
  scanResult: null,
  selectedGame: null,
  selectedLanguage: null,
  currency: 'THB',
  isAuthenticated: false,

  setScreen: (screen) => set((state) => ({ 
    prevScreen: state.screen !== screen ? state.screen : state.prevScreen,
    screen 
  })),
  
  goBack: () => set((state) => {
    const fallback = TAB_ROOTS[state.activeTab] || 'home';
    return {
      screen: state.prevScreen || fallback,
      prevScreen: null,
    };
  }),

  setActiveTab: (tab) => set((state) => {
    const tabScreen = TAB_ROOTS[tab];
    // If we're already on a screen within this tab's flow, don't reset
    return {
      activeTab: tab,
      screen: tabScreen,
      prevScreen: state.screen === tabScreen ? state.prevScreen : null,
    };
  }),

  setSelectedCardId: (id) => set({ selectedCardId: id }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  setScanResult: (card) => set({ scanResult: card }),
  setSelectedGame: (game) => set({ selectedGame: game }),
  setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
  setCurrency: (currency) => set({ currency }),
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),

  navigateToCard: (cardId) => set({
    selectedCardId: cardId,
    prevScreen: get().screen,
    screen: 'cardDetail',
  }),

  navigateFromTab: (tab) => {
    const tabScreen = TAB_ROOTS[tab];
    set({
      activeTab: tab,
      screen: tabScreen,
      prevScreen: null,
    });
  },
}));

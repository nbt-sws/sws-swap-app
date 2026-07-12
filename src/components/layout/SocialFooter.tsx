import { Instagram, Twitter, MessageCircle, Globe } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/swibswap' },
  { icon: Twitter, label: 'X / Twitter', href: 'https://twitter.com/swibswap' },
  { icon: MessageCircle, label: 'Line', href: 'https://line.me/ti/p/@swibswap' },
  { icon: Globe, label: 'Website', href: 'https://swibswap.app' },
];

export function SocialFooter() {
  return (
    <footer className="fixed bottom-16 md:bottom-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 flex h-8 bg-surface/90 backdrop-blur-xl border-t border-border/40 items-center justify-center gap-6">
      {SOCIAL_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-brand transition-colors"
            title={link.label}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{link.label}</span>
          </a>
        );
      })}
      <span className="text-[10px] text-muted-foreground/50">© 2025 SwibSwap</span>
    </footer>
  );
}

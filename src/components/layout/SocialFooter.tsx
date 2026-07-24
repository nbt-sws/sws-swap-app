import { Instagram, Twitter, MessageCircle, Globe } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/swibswap' },
  { icon: Twitter, label: 'X / Twitter', href: 'https://twitter.com/swibswap' },
  { icon: MessageCircle, label: 'Line', href: 'https://line.me/ti/p/@swibswap' },
  { icon: Globe, label: 'Website', href: 'https://swibswap.app' },
];

export function SocialFooter() {
  return (
    <footer className="sticky bottom-0 z-40 h-8 bg-surface/90 backdrop-blur-xl border-t border-border/40 flex items-center justify-center gap-6">
      {SOCIAL_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-brand transition-colors"
            title={link.label}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{link.label}</span>
          </a>
        );
      })}
      <span className="text-[11px] text-muted-foreground/50">© 2025 SwibSwap</span>
    </footer>
  );
}

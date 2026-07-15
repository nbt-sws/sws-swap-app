import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Card, VaultItem } from "@/types"

export const SWS_PLATFORM_USER_ID = 'sws-platform';
// Well-known backend UUID used to represent the SWS platform holder.
export const SWS_PLATFORM_USER_UUID = '00000000-0000-0000-0000-000000000001';

export function isPlatformHeld(item: Pick<VaultItem, 'holderId'>): boolean {
  return item.holderId === SWS_PLATFORM_USER_ID || item.holderId === SWS_PLATFORM_USER_UUID;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCardImageUrl(card: Card): string {
  if (card.imageUrl) return card.imageUrl
  const text = encodeURIComponent(`${card.code}`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560"><rect width="400" height="560" fill="#282D5A"/><path d="M0 560L400 0" stroke="#1E2248" stroke-width="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9CA3AF" font-family="JetBrains Mono, monospace" font-size="24">${text}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function formatPriceChange(change: number): string {
  const prefix = change >= 0 ? '+' : ''
  return `${prefix}${change.toFixed(0)}%`
}

export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString();
}

export function getPackagePlaceholderUrl(seed: string): string {
  const initial = encodeURIComponent(seed.charAt(0).toUpperCase())
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F06AA8" stop-opacity="0.18"/><stop offset="100%" stop-color="#7B8AF5" stop-opacity="0.18"/></linearGradient></defs><rect width="300" height="200" fill="#1E2248"/><rect x="20" y="20" width="260" height="160" rx="16" fill="url(#g)" stroke="#F06AA8" stroke-opacity="0.25" stroke-width="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="JetBrains Mono, monospace" font-size="48" font-weight="700">${initial}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

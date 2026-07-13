import type { GradingService } from '@/types';

export const GRADER_IMAGE_URLS: Record<GradingService, string> = {
  PSA: 'https://images.ctfassets.net/0hawnqdvsfxb/6na4X5KTOHHt1D59sORQbV/4a7b9f556daa776dfd0558feb04812b4/5__1_.png',
  BGS: 'https://www.beckett.com/images/beckett-new-logo.png',
  TAG: 'https://images.ctfassets.net/0hawnqdvsfxb/2Q3M5oLDbDONIYTFt0IJNb/bf58088e2316983a3fd2fece35a32dfd/4.png',
  RAWLITY: 'https://picsum.photos/seed/rawlity/400/300',
  BLACKLENS: 'https://picsum.photos/seed/blacklens/400/300',
  CGC: 'https://picsum.photos/seed/cgc/400/300',
};

export const GRADER_STYLES: Record<GradingService, string> = {
  PSA: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  BGS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CGC: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  TAG: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  RAWLITY: 'bg-brand/10 text-brand border-brand/20',
  BLACKLENS: 'bg-periwinkle/10 text-periwinkle border-periwinkle/20',
};

import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Package, Star, Heart, Share2, Settings, MapPin, Link as LinkIcon,
  Instagram, Twitter, Facebook, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreProfile } from '@/types';

interface VaultProfileHeaderProps {
  profile: StoreProfile;
  isOwner?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
  isFollowing?: boolean;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  website: Globe,
};

export function VaultProfileHeader({
  profile,
  isOwner,
  onFollow,
  onShare,
  isFollowing,
}: VaultProfileHeaderProps) {
  const displayName = profile.displayName || profile.name;
  const totalItems = (profile.listings ?? 0) + (profile.sales ?? 0);

  return (
    <Card className="overflow-hidden border-border bg-surface-light">
      {/* Banner */}
      <div className="relative h-28 sm:h-36 w-full">
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand/20 via-periwinkle/20 to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-light/80 to-transparent" />
      </div>

      <CardContent className="relative pt-0 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          {/* Avatar */}
          <Avatar className="w-20 h-20 border-4 border-surface-light bg-surface-lighter">
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xl font-bold bg-surface-lighter text-foreground">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Name + Bio */}
          <div className="flex-1 min-w-0 pt-1 sm:pb-1">
            <h2 className="text-xl font-bold truncate">{displayName}</h2>
            {profile.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-xl">{profile.bio}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isOwner ? (
              <Button asChild variant="outline" size="sm" className="border-border gap-1.5">
                <Link to="/settings">
                  <Settings className="w-3.5 h-3.5" />
                  Customize
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  className={cn('gap-1.5', !isFollowing && 'bg-brand hover:bg-brand-light')}
                  onClick={onFollow}
                >
                  <Heart className={cn('w-3.5 h-3.5', isFollowing && 'fill-current')} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={onShare}>
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat value={totalItems} label="Total items" icon={<Package className="w-4 h-4" />} />
          <Stat value={profile.listings ?? 0} label="Listed" icon={<LinkIcon className="w-4 h-4" />} />
          <Stat value={profile.sales ?? 0} label="Sold" icon={<Star className="w-4 h-4" />} />
          <Stat value={profile.followers ?? 0} label="Followers" icon={<Heart className="w-4 h-4" />} />
        </div>

        {/* Social links */}
        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.socialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] || LinkIcon;
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium hover:border-brand/30 hover:text-brand transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.platform}
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-surface p-3 border border-border">
      <div className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-base font-bold font-mono leading-none">{value.toLocaleString()}</p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export function VaultProfileHeaderSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-surface-light">
      <Skeleton className="h-28 sm:h-36 w-full rounded-none" />
      <CardContent className="relative pt-0 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          <Skeleton className="w-20 h-20 rounded-full border-4 border-surface-light" />
          <div className="flex-1 space-y-2 pt-1 sm:pb-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

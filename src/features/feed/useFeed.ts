import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedApi, wtbApi } from '@/lib/api';
import type { FeedRoom, FeedTab, ShopPostType, WtbRequest } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/hooks/useApi';

/* Social layer hooks (Phase 1–2). All queries hit the live API
   (tables: shop_posts, post_reactions, wtb_requests — migration 009). */

/* ─── Feed access gate: the live feed requires a KYC-approved user ──
   guest   → not signed in
   needKyc → signed in, KYC not submitted / rejected
   pending → signed in, KYC submitted, waiting for review
   allowed → KYC APPROVED (admins count via their kyc status too) */
export type FeedAccess = 'guest' | 'needKyc' | 'pending' | 'allowed';

export function useFeedAccess(): { status: FeedAccess; isLoading: boolean } {
  const { isAuthenticated, user } = useAuthStore();
  const { data: freshUser, isLoading } = useUser();
  if (!isAuthenticated) return { status: 'guest', isLoading: false };
  const kyc =
    (freshUser as { kycStatus?: string } | undefined)?.kycStatus ??
    (user as { kycStatus?: string } | null)?.kycStatus ??
    'NONE';
  if (kyc === 'APPROVED') return { status: 'allowed', isLoading: false };
  return { status: kyc === 'PENDING' ? 'pending' : 'needKyc', isLoading };
}

export function useFeed(tab: FeedTab, room: FeedRoom = 'all', page = 1, enabled = true) {
  return useQuery({
    queryKey: ['feed', tab, room, page],
    queryFn: () => feedApi.feed({ tab, room: room === 'all' ? undefined : room, page }),
    staleTime: 1000 * 30,
    retry: 0,
    enabled,
  });
}

export function useShopPosts(shopId: string | undefined) {
  return useQuery({
    queryKey: ['shopPosts', shopId],
    queryFn: () => feedApi.shopPosts(shopId as string),
    enabled: !!shopId,
    staleTime: 1000 * 30,
    retry: 0,
  });
}

export function useCreatePost(shopId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type?: ShopPostType;
      room?: Exclude<FeedRoom, 'all'>;
      body: string;
      mediaUrls?: string[];
      linkedListingIds?: string[];
      linkedVaultItemIds?: string[];
      liveAt?: string;
    }) => feedApi.createPost(shopId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['shopPosts', shopId] });
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, kind }: { postId: string; kind: 'like' | 'save' }) =>
      feedApi.toggleReaction(postId, kind),
    // Feed counts refresh lazily; the card keeps its own optimistic state.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useWtbList(params?: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ['wtb', params?.status ?? 'OPEN', params?.q ?? ''],
    queryFn: () => wtbApi.list(params),
    staleTime: 1000 * 30,
    retry: 0,
  });
}

export function useCreateWtb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof wtbApi.create>[0]) => wtbApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wtb'] }),
  });
}

export function useWtbSetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WtbRequest['status'] }) =>
      wtbApi.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wtb'] }),
  });
}

export function useDeleteWtb() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wtbApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wtb'] }),
  });
}

/** Compact Thai-first relative time ("2 ชม.ที่แล้ว"). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
}

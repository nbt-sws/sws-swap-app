import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedApi, wtbApi } from '@/lib/api';
import type { FeedTab, ShopPost, ShopPostType, WtbRequest } from '@/lib/api';

/* Social layer hooks (Phase 1–2). All queries degrade quietly (retry: 0) —
   screens fall back to demo content when the backend tables are not migrated
   yet, matching the repo's scanner/catalog integration contract. */

export function useFeed(tab: FeedTab, page = 1) {
  return useQuery({
    queryKey: ['feed', tab, page],
    queryFn: () => feedApi.feed({ tab, page }),
    staleTime: 1000 * 30,
    retry: 0,
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
    mutationFn: (data: { type?: ShopPostType; body: string; liveAt?: string }) =>
      feedApi.createPost(shopId as string, data),
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

/** Demo posts shown when the feed backend is unavailable or empty. */
export const DEMO_POSTS: ShopPost[] = [
  {
    id: 'demo-1', shopId: 'demo-pk', shopName: 'PK Cards', shopAvatar: null,
    type: 'drop', body: '🔥 ล็อตใหม่ลงตู้แล้ว! งานสภาพสวย ๆ ทั้งนั้น เกรด 9–10 เช็กได้เลย จองทางแอปได้ก่อนใคร',
    mediaUrls: [], createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    likes: 128, saves: 12, likedByMe: false, savedByMe: false,
    listings: [
      { listingId: 'demo-l1', title: 'Terapagos ex SAR', price: 4850, imageUrl: null },
      { listingId: 'demo-l2', title: 'Luffy SEC', price: 6200, imageUrl: null },
      { listingId: 'demo-l3', title: 'Ajani, Nacatl Pariah', price: 1350, imageUrl: null },
    ],
  },
  {
    id: 'demo-2', shopId: 'demo-dragon', shopName: 'Dragon Vault BKK', shopAvatar: null,
    type: 'live', body: 'คืนนี้ 2 ทุ่มเจอกัน! ไลฟ์เปิดกล่อง + แจกการ์ดท้ายไลฟ์ ฝากกดติดตามร้านไว้จะได้ไม่พลาด',
    mediaUrls: [], liveAt: new Date(Date.now() + 9 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    likes: 86, saves: 30, likedByMe: false, savedByMe: false, listings: [],
  },
  {
    id: 'demo-3', shopId: 'demo-nightowl', shopName: 'Night Owl TCG', shopAvatar: null,
    type: 'update', body: 'เสาร์นี้ร้านไปออกบูธงาน TCG Meet @ สามย่านมิตรทาวน์ ใครมีการ์ดอยากส่งเช็กสภาพ เอามาฝากได้ที่บูธเลยครับ',
    mediaUrls: [], createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    likes: 45, saves: 4, likedByMe: false, savedByMe: false, listings: [],
  },
  {
    id: 'demo-4', shopId: 'demo-mintlab', shopName: 'Mint Lab', shopAvatar: null,
    type: 'restock', body: 'รีสต็อกแล้ว! ตัวที่หมดไปนาน รอบนี้มาแบบจำนวนจำกัด ใครตั้ง wishlist ไว้เช็กเลย',
    mediaUrls: [], createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    likes: 67, saves: 18, likedByMe: false, savedByMe: false,
    listings: [
      { listingId: 'demo-l4', title: 'Greninja ex', price: 2290, imageUrl: null },
      { listingId: 'demo-l5', title: 'Command and Conquer', price: 3100, imageUrl: null },
    ],
  },
];

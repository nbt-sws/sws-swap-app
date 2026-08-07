import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight, Layers, Store, Megaphone, ShieldCheck,
  Package, Heart, Search, UserRound,
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useListings, useStores } from '@/hooks/useApi';
import { useWtbList } from '@/features/feed/useFeed';
import { useAuthStore } from '@/stores/auth';
import { AppFrame, FeedMock, VaultMock, MarketMock } from './mockups';
import { AppEntryTransition } from './AppEntryTransition';

/* ══════════════════════════════════════════════════════════════════
   /welcome — public landing. Everything numeric or visual is pulled
   from the live API (listings, shops, WTB) — no fake testimonials,
   no invented stats. Product UI mockups are the only imagery.
   ══════════════════════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

/* 8-bit staircase divider between sections. */
function PixelDivider({ className, accent = 'brand' }: { className?: string; accent?: 'brand' | 'cyan' | 'periwinkle' }) {
  const steps = [1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 3, 2, 1, 2, 1, 3, 2, 1, 2, 4, 3, 1, 2, 3];
  const bar = accent === 'cyan' ? 'bg-cyan/25' : accent === 'periwinkle' ? 'bg-periwinkle/25' : 'bg-brand/25';
  return (
    <div className={cn('flex items-end justify-center gap-[3px] py-6', className)} aria-hidden="true">
      {steps.map((s, i) => (
        <span key={i} className={cn('w-[6px] rounded-[1px]', bar)} style={{ height: s * 5 }} />
      ))}
    </div>
  );
}

/* ─── Journey Landing Nav ─────────────────────────────────────────
   Minimal: logo on the left, single Launch App action on the right.
   No nav menu — the landing page only guides users into the app. */
function LandingNav({ onEnterApp }: { onEnterApp: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-border/50 bg-surface-dark/85 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.03)]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/welcome" className="flex items-center gap-2">
          <img src="/logo.png" alt="SwibSwap" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-bold tracking-tight">SwibSwap</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <EnterAppButton onEnter={onEnterApp} />
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow"
              >
                เปิดร้านฟรี
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Enter App Button ────────────────────────────────────────────
   Simple trigger button. The actual transition + navigation lives in
   the parent WelcomeScreen so there is exactly one AppEntryTransition
   mounted at any time. */
function EnterAppButton({ className, children, onEnter }: { className?: string; children?: React.ReactNode; onEnter: () => void }) {
  return (
    <button
      onClick={onEnter}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow',
        className
      )}
    >
      {children ?? (
        <>
          Launch App
          <ArrowRight className="h-3 w-3" />
        </>
      )}
    </button>
  );
}

export function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const listingsQuery = useListings({ limit: 24 });
  const storesQuery = useStores();
  const wtbQuery = useWtbList({ status: 'OPEN' });

  const listings = listingsQuery.data?.results ?? [];
  const shops = storesQuery.data ?? [];
  const wtbItems = (wtbQuery.data?.requests ?? []).slice(0, 3);

  const handleEnterApp = useCallback(() => {
    setTransitioning(true);
  }, []);

  const handleTransitionDone = useCallback(() => {
    setTransitioning(false);
    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-dark text-foreground">
      {/* Single global transition — triggered by any "เข้าแอป" CTA */}
      <AppEntryTransition active={transitioning} onComplete={handleTransitionDone} />

      <LandingNav onEnterApp={handleEnterApp} />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="landing-grain relative overflow-hidden pt-14">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 w-[480px] select-none opacity-25 blur-[90px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          <motion.div {...fadeUp}>
            <span className="pxl-chip pxl-chip--brand">TCG SUPER APP สำหรับนักสะสม</span>
            <h1 className="mt-4 text-[clamp(1.9rem,4.6vw,3.4rem)] font-extrabold leading-[1.15] tracking-tight">
              การ์ดใบโปรดของคุณ
              <br />
              <span className="neon-text-brand">มีตลาด มีร้าน มีที่อยู่</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              SwibSwap คือ super app สำหรับคอการ์ด — เก็บการ์ดใน Vault พร้อมเห็นกำไรขาดทุน,
              ซื้อขายในตลาดที่คนขายยืนยันตัวจริง, แล้วคุยกับร้านโปรดในฟีดเดียวกัน
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleEnterApp}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow"
                >
                  Launch App
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow"
                >
                  เริ่มใช้ฟรี
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                to="/market"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
              >
                <Search className="h-4 w-4" />
                ดูตลาดก่อน
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="mono-num text-xl font-extrabold">{listings.length > 0 ? `${listings.length}+` : '—'}</p>
                <p className="text-[11px] text-muted-foreground">รายการกำลังขายตอนนี้</p>
              </div>
              <div>
                <p className="mono-num text-xl font-extrabold">{shops.length > 0 ? shops.length : '—'}</p>
                <p className="text-[11px] text-muted-foreground">ร้านค้าในระบบ</p>
              </div>
              <div>
                <p className="mono-num text-xl font-extrabold text-cyan">100%</p>
                <p className="text-[11px] text-muted-foreground">ร้านขายต้องผ่าน KYC</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}>
            <AppFrame label="SwibSwap — Feed" accent="brand">
              {listings.length > 0 && shops.length > 0 ? (
                <FeedMock shops={shops} listings={listings} />
              ) : (
                <div className="space-y-3">
                  <div className="h-6 w-32 animate-pulse rounded bg-surface-lighter" />
                  <div className="h-28 animate-pulse rounded-xl bg-surface-lighter" />
                  <div className="h-28 animate-pulse rounded-xl bg-surface-lighter" />
                </div>
              )}
            </AppFrame>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Live ticker ──────────────────────────────────────── */}
      {listings.length > 0 && (
        <section className="border-y border-border/50 bg-surface py-4">
          <div className="landing-marquee overflow-hidden">
            <div className="landing-marquee-track gap-3 pr-3">
              {[...listings, ...listings].map((l, i) => (
                <Link
                  key={`${l.id}-${i}`}
                  to="/market/$listingId"
                  params={{ listingId: l.id }}
                  className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border/60 bg-surface-light py-1.5 pl-1.5 pr-4 transition-colors hover:border-brand/40"
                >
                  <span className="h-8 w-8 overflow-hidden rounded-full bg-surface-lighter">
                    <ImageWithFallback src={getCardImageUrl(l.card)} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="max-w-[160px] truncate text-xs font-medium">{l.card.nameEn}</span>
                  <span className="mono-num text-xs font-bold text-cyan">
                    {l.listingType === 'TRADE' ? 'เทรด' : `฿${l.price.toLocaleString()}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PixelDivider accent="cyan" />

      {/* ── 3. Vault feature ────────────────────────────────────── */}
      <FeatureSection
        accent="cyan"
        eyebrow="VAULT — คลังการ์ดของคุณ"
        title="รู้ทันทีว่าการ์ดแต่ละใบ กำไรเท่าไหร่"
        desc="สแกนการ์ดเข้าคลัง ระบบจับราคาตลาดให้ทุกใบ เห็นกำไรขาดทุนเป็นเปอร์เซ็นต์ชัด ๆ ตัดสินใจขายตอนไหนก็ไม่เดา"
        points={['สแกนการ์ดเข้าคลังในไม่กี่วิ', 'ราคากลางอัปเดตจากตลาดจริง', 'ส่งเกรด / ขอถอนการ์ดจริงได้ในที่เดียว']}
        mockup={
          <AppFrame label="SwibSwap — Vault" accent="cyan">
            {listings.length > 0 ? <VaultMock listings={listings} /> : <MockSkeleton rows={3} />}
          </AppFrame>
        }
      />

      <PixelDivider accent="brand" />

      {/* ── 4. Market feature ───────────────────────────────────── */}
      <FeatureSection
        flip
        accent="brand"
        eyebrow="MARKET — ตลาดที่ไว้ใจได้"
        title="ซื้อขายจริง ราคาจริง คนขายตัวจริง"
        desc="ทุกร้านที่ลงขายต้องผ่าน KYC ไม่มีร้านผี ไม่มีราคาหลอก เจอการ์ดที่ตามหาแล้วกดซื้อได้เลย หรือจะเทรดก็เปิดห้องคุยได้"
        points={['ผู้ขายยืนยันตัวตน (KYC) ทุกร้าน', 'ซื้อตรงหรือแลกเทรดก็ได้', 'กรองตามเกม สภาพการ์ด ราคา ครบ']}
        mockup={
          <AppFrame label="SwibSwap — Market" accent="brand">
            {listings.length > 0 ? <MarketMock listings={listings} /> : <MockSkeleton rows={2} grid />}
          </AppFrame>
        }
      />

      <PixelDivider accent="periwinkle" />

      {/* ── 5. Shops & feed feature ─────────────────────────────── */}
      <FeatureSection
        accent="periwinkle"
        eyebrow="SHOPS & FEED — ร้านโปรดในมือคุณ"
        title="ร้านโปรดอัปเดตทุกวัน ติดตามได้เหมือนโซเชียล"
        desc="แต่ละร้านมีหน้าร้านของตัวเอง โพสต์ของเข้าใหม่ ประกาศไลฟ์ หรือแชร์การ์ดจากคลัง — คุณแค่กดติดตาม แล้วทุกอัปเดตจะมารวมในฟีดเดียว"
        points={['ฟีดแยกห้องตามเกม: โปเกมอน วันพีช Lorcana', 'Stories จากร้านที่ติดตาม ไม่พลาดของเข้า', 'ร้านโพสต์แชร์การ์ดจาก Vault / Market ได้ตรง']}
        mockup={
          <AppFrame label="SwibSwap — Feed" accent="periwinkle">
            {listings.length > 0 && shops.length > 0 ? <FeedMock shops={shops} listings={listings} /> : <MockSkeleton rows={2} />}
          </AppFrame>
        }
      />

      {/* ── 6. WTB ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <motion.div {...fadeUp}>
            <span className="pxl-chip pxl-chip--brand">WTB — บอร์ดตามหาการ์ด</span>
            <h2 className="mt-4 text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold leading-snug tracking-tight">
              ตามหาการ์ดที่อยากได้
              <br />
              แล้วให้ของ<span className="text-warning">มาหาคุณ</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              ประกาศบอกงบไว้บนบอร์ด ร้านค้าทั้งแอปเห็นความต้องการจริง ๆ — ใครมีของตรงใจก็ทักมาหา
            </p>
            <Link
              to="/wtb"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-warning transition-colors hover:text-warning/80"
            >
              ดูบอร์ดตามหาการ์ด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} className="space-y-3">
            {wtbItems.length === 0 ? (
              <MockSkeleton rows={2} />
            ) : (
              wtbItems.map((w) => (
                <div key={w.id} className="group flex items-center gap-3 rounded-xl border border-border/60 bg-surface-light p-3.5 transition-all hover:-translate-y-0.5 hover:border-warning/40 hover:shadow-[0_12px_32px_-16px_rgba(255,216,77,0.25)]">
                  {w.imageUrl && (
                    <span className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-surface-lighter">
                      <ImageWithFallback src={w.imageUrl} alt="" className="h-full w-full object-cover" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{w.cardName}</p>
                    <p className="text-[11px] text-muted-foreground">โดย {w.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="mono-num text-sm font-extrabold text-warning">
                      {w.targetPrice != null ? `฿${w.targetPrice.toLocaleString()}` : 'งบเปิด'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">งบที่รับ</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 7. Three steps ──────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <motion.h2 {...fadeUp} className="text-center text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold tracking-tight">
            เริ่มใน <span className="neon-text-brand">3 ขั้นตอน</span>
          </motion.h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3">
            {[
              { n: '01', icon: <UserRound className="h-5 w-5" />, title: 'สมัครสมาชิก', desc: 'ใช้อีเมลเดียว ไม่ถึงนาที', cls: 'text-brand bg-brand/10' },
              { n: '02', icon: <ShieldCheck className="h-5 w-5" />, title: 'ยืนยันตัวตน (KYC)', desc: 'ครั้งเดียว ปลดล็อกฟีด + เปิดร้าน', cls: 'text-cyan bg-cyan/10' },
              { n: '03', icon: <Package className="h-5 w-5" />, title: 'สะสมหรือเปิดร้าน', desc: 'สแกนการ์ดเข้า Vault แล้วลงขายได้เลย', cls: 'text-periwinkle bg-periwinkle/10' },
            ].map((s) => (
              <motion.div key={s.n} {...fadeUp} className="bg-surface-light p-6">
                <p className={cn('mono-num text-xs font-bold', s.cls.split(' ')[0])}>{s.n}</p>
                <div className={cn('mt-3 flex h-10 w-10 items-center justify-center rounded-xl', s.cls)}>{s.icon}</div>
                <p className="mt-3 text-sm font-bold">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Real shops ───────────────────────────────────────── */}
      {shops.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <motion.div {...fadeUp} className="text-center">
            <span className="pxl-chip pxl-chip--peri">ร้านค้าจริงที่อยู่กับเรา</span>
            <h2 className="mt-4 text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold tracking-tight">
              เดินดูร้านได้เหมือนเดินตลาดนัดการ์ด
            </h2>
          </motion.div>
          <motion.div {...fadeUp} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shops.slice(0, 8).map((s) => (
              <Link
                key={s.userId}
                to="/seller/$sellerId"
                params={{ sellerId: s.userId }}
                className="group rounded-xl border border-border/60 bg-surface-light p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glow"
              >
                {s.avatarUrl ? (
                  <img src={s.avatarUrl} alt="" className="mx-auto h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand/15 text-lg font-bold text-brand">
                    {(s.displayName || s.name).charAt(0)}
                  </span>
                )}
                <p className="mt-2.5 truncate text-sm font-bold transition-colors group-hover:text-brand">
                  {s.displayName || s.name}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <Heart className="h-3 w-3 text-periwinkle" />
                  {s.followers} ผู้ติดตาม
                </p>
              </Link>
            ))}
          </motion.div>
          <motion.div {...fadeUp} className="mt-6 text-center">
            <Link to="/stores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-light">
              ดูร้านทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── 9. Final CTA ────────────────────────────────────────── */}
      <section className="landing-grain relative overflow-hidden border-t border-border/50 bg-surface">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2 select-none opacity-20 blur-[100px]"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <motion.img
            {...fadeUp}
            src="/logo.png"
            alt="SwibSwap"
            className="mx-auto h-16 w-16 rounded-2xl object-contain drop-shadow-[0_0_24px_rgba(240,106,168,0.45)]"
          />
          <motion.h2 {...fadeUp} className="mt-5 text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold leading-tight tracking-tight">
            พร้อมให้การ์ดของคุณ
            <br />
            <span className="neon-text-brand">มีที่อยู่เป็นของตัวเองแล้วหรือยัง</span>
          </motion.h2>
          <motion.div {...fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleEnterApp}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow"
              >
                Launch App
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-light hover:shadow-glow"
              >
                สมัครฟรีวันนี้
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              to="/market"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Layers className="h-4 w-4" />
              เดินดูตลาดก่อน
            </Link>
          </motion.div>
          <PixelDivider className="mb-0 pb-0" />
        </div>
      </section>

      {/* ── 10. Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-surface-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-4 w-4 rounded object-contain" />
            SwibSwap — TCG Super App
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/market" className="transition-colors hover:text-foreground">ตลาด</Link>
            <Link to="/stores" className="transition-colors hover:text-foreground">ร้านค้า</Link>
            <Link to="/feed" className="transition-colors hover:text-foreground">ฟีด</Link>
            <Link to="/wtb" className="transition-colors hover:text-foreground">ตามหาการ์ด</Link>
            <Link to="/services" className="transition-colors hover:text-foreground">บริการ</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ─── Reusable feature section ──────────────────────────────────── */
function FeatureSection({ accent, eyebrow, title, desc, points, mockup, flip }: {
  accent: 'brand' | 'cyan' | 'periwinkle';
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  mockup: React.ReactNode;
  flip?: boolean;
}) {
  const chipCls = accent === 'brand' ? 'pxl-chip--brand' : accent === 'cyan' ? 'pxl-chip--cyan' : 'pxl-chip--peri';
  const icon = accent === 'brand' ? <Store className="h-3 w-3" /> : accent === 'cyan' ? <Layers className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />;
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className={cn('grid items-center gap-10 lg:grid-cols-2', flip && 'lg:[direction:rtl]')}>
        <motion.div {...fadeUp} className="lg:[direction:ltr]">
          <span className={cn('pxl-chip', chipCls)}>{eyebrow}</span>
          <h2 className="mt-4 text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold leading-snug tracking-tight">{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{desc}</p>
          <ul className="mt-5 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
                  accent === 'brand' ? 'bg-brand/10 text-brand' : accent === 'cyan' ? 'bg-cyan/10 text-cyan' : 'bg-periwinkle/10 text-periwinkle'
                )}>
                  {icon}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="lg:[direction:ltr]">
          {mockup}
        </motion.div>
      </div>
    </section>
  );
}

function MockSkeleton({ rows, grid }: { rows: number; grid?: boolean }) {
  if (grid) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[5/7] animate-pulse rounded-lg bg-surface-lighter" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-lighter" />
      ))}
    </div>
  );
}

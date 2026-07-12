# Product

## Register

product

## Users

Primary users are **Trading Card Game (TCG) collectors** in Thailand and Southeast Asia who use the SwibSwap app as a daily companion for their collection.

- **Context:** They scan cards to add to their vault, check market prices, browse vault-backed listings, submit cards for grading/pre-grading, and decide whether to ship cards home or keep them in secure storage.
- **Primary job to be done:** Track, value, buy, sell, and protect collectible cards with confidence.
- **Secondary jobs:** Compare market data, manage wishlists, track grading orders, complete KYC, and respond to offers.
- **Emotional goals:** Feel like an expert curator, trust that high-value cards are safe, and enjoy the discovery of new cards without anxiety.

## Product Purpose

SwibSwap App is the all-in-one collector companion for the **Swap & Vault System (SWS)**. It combines a portfolio tracker, a vault-backed marketplace, and grading/pre-grading services into one cohesive mobile-first experience.

It exists so collectors can move seamlessly from "I just got this card" to "it's authenticated, insured, priced, and ready to sell or store" without switching between disconnected tools.

Success means users open the app daily to check portfolio value, complete purchases without hesitation, and leave valuable cards in the vault because they trust the platform.

## Brand Personality

**Playful + Trustworthy + Modern + Collector-First**

- **Playful:** Magenta and periwinkle accents, glowing CTAs, and card-first layouts celebrate collecting without feeling childish.
- **Trustworthy:** Clear KYC status, transparent order timelines, vault-verified badges, and market data reduce anxiety around high-value transactions.
- **Modern:** Dark surface UI, smooth motion, shadcn/ui primitives, and a clean Vite + React + Tailwind stack.
- **Collector-First:** The card image, rarity signals, and price history are always visible; UI chrome never buries the collectibles.

## Anti-references

- **Generic SaaS dashboards:** Avoid interchangeable gray-blue surfaces, dense data grids, and utilitarian forms.
- **Cartoonish gamified finance apps:** Avoid badges, confetti, or avatars that undermine trust when users are spending real money.
- **Dark-pattern marketplaces:** Avoid urgency timers, fake scarcity, hidden fees, or misleading status badges.
- **Heavy desktop-only admin UIs:** Avoid spreadsheet-like layouts and sidebar-heavy chrome as the default mobile experience.

## Design Principles

1. **Trust through transparency.** Every high-stakes screen — checkout, KYC, grading status, vault redemption — explains status clearly and surfaces the next step.
2. **Celebrate the cards.** Card art, rarity, condition, and price history stay in focus; UI chrome is minimal.
3. **Mobile-first, never mobile-only.** Patterns must feel native on a phone but expand gracefully into efficient multi-column desktop layouts.
4. **Playful precision.** Use color, glow, and motion to add personality, but keep interactions predictable and accessible.
5. **Calm transactions.** Reduce collector anxiety with timelines, tracking, real-time status, and clear empty/error states.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** compliance as a baseline.
- Honor **`prefers-reduced-motion`** by disabling non-essential animations and limiting motion to opacity/transform only when motion is enabled.
- Maintain visible focus indicators (`outline-2 outline-offset-2`) on all interactive elements.
- Support keyboard navigation for dialogs, selects, tabs, tables, and the main navigation shell.
- Ensure color is never the sole means of conveying status or actionability.

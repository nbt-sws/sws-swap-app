---
name: SwibSwap App
description: The dark, card-first collector companion for SWS — portfolio, vault-backed market, and grading services.
colors:
  brand: "#F06AA8"
  brand-light: "#F78BB8"
  brand-dark: "#D44E8E"
  periwinkle: "#7B8AF5"
  cyan: "#4FE0D0"
  success: "#4ADE80"
  danger: "#EF4444"
  warning: "#FFD84D"
  surface: "#151936"
  surface-light: "#1E2248"
  surface-lighter: "#282D5A"
  surface-dark: "#0D0F26"
  foreground: "#FFFFFF"
  muted: "#3D4280"
  border: "#282D5A"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "JetBrains Mono, SF Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-light}"
    textColor: "{colors.foreground}"
  button-secondary:
    backgroundColor: "{colors.periwinkle}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.surface-lighter}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: SwibSwap App

## 1. Overview

**Creative North Star: "The Vault at Night"**

SwibSwap App is designed to feel like a private, high-end collector's vault viewed after dark: deep surfaces, soft ambient glow, and precise magenta/periwinkle accents that highlight the cards without shouting. The Manropeface is calm, confident, and card-first. Every screen treats the collectible as the hero and the UI as the quiet frame around it.

This system rejects generic SaaS dashboards and cartoonish gamification. It also rejects the bright, airy marketplace default — the dark surface is intentional, chosen because collectors often browse prices and portfolios in low-light environments and because the magenta glow reads as premium, not playful.

**Key Characteristics:**
- Dark, tinted-neutral surfaces (`surface` #151936, `surface-light` #1E2248, `surface-lighter` #282D5A)
- Two disciplined accents: magenta (`brand`) for primary actions and periwinkle for secondary information
- Card-first layouts with rounded corners, subtle borders, and ambient glow on hover
- Fixed rem type scale and a single sans family (Manrope) across the product UI
- Motion that conveys state — page transitions, hover lift, active press — never decorative celebration
- Responsive shell that shifts from bottom navigation on mobile to a sidebar + top bar on desktop

## 2. Colors

The palette is built on a dark, cool-neutral ground with two bright accents. The dark surface lets card art and price data pop; the accents are rationed so they never overwhelm.

### Primary
- **Magenta Glow** (`#F06AA8`): The primary action color — CTAs, active tab indicators, active states, vault-verified highlights, and the scan FAB. It should occupy ≤10% of any screen.
- **Magenta Tint** (`#F78BB8`): Hover state for primary buttons and glows.
- **Magenta Deep** (`#D44E8E`): Active/pressed state for primary buttons.

### Secondary
- **Periwinkle** (`#7B8AF5`): Secondary actions, information chips, game/language filters, links, and chart accents.

### Tertiary
- **Cyan** (`#4FE0D0`): Success indicators, positive P/L, verification checkmarks, and trade-only badges.
- **Warning Gold** (`#FFD84D`): Pre-grade status, pending states, and rating stars.
- **Success Green** (`#4ADE80`): Positive price movement and live market indicators.
- **Danger Red** (`#EF4444`): Errors, negative P/L, sold status, and destructive actions.

### Neutral
- **Surface** (`#151936`): Default app background.
- **Surface Light** (`#1E2248`): Card backgrounds, input backgrounds, elevated containers.
- **Surface Lighter** (`#282D5A`): Hover states, badges, chips, and dividers.
- **Surface Dark** (`#0D0F26`): Deepest background layer, bottom sheets, and modal backdrops.
- **Foreground** (`#FFFFFF`): Primary text on dark surfaces.
- **Muted** (`#3D4280`): Secondary text, borders, and disabled states.
- **Border** (`#282D5A`): Default border color for cards, inputs, and dividers.

### Named Rules
**The One Accent Rule.** Magenta (`brand`) should occupy no more than 10% of any given screen. It is reserved for the highest-value action or the most important status indicator.

**The Dark Surface Rule.** Surfaces stay dark and cool-neutral. Do not introduce a light-mode body background; components that need elevation use `surface-light` or `surface-lighter`.

## 3. Typography

**Display Font:** Manrope, system-ui, sans-serif  
**Body Font:** Manrope, system-ui, sans-serif  
**Mono / Data Font:** JetBrains Mono, SF Mono, monospace  

**Character:** A single, clean geometric sans keeps the UI quiet and legible. JetBrains Mono is used only for prices, card codes, percentages, and data labels to give numbers a precise, technical feel.

### Hierarchy
- **Display** (700, 2.25rem/1.1, -0.02em): Page-level headings like "SwibSwap Market" and portfolio value.
- **Headline** (600, 1.5rem/1.2, -0.01em): Section titles inside a page.
- **Title** (600, 1.125rem/1.3): Card titles, dialog headings, list headers.
- **Body** (400, 0.875rem/1.55): Descriptions, form labels, body copy. Max line length 65–75ch for long prose.
- **Label** (500, 0.75rem/1.4, 0.01em): Badges, timestamps, small metadata, bottom-nav labels.
- **Mono Data** (500, 0.875rem/1.4, 0): Prices, P/L, card codes, order numbers.

### Named Rules
**The One Family Rule.** Product UI uses one sans family across headings, body, labels, and buttons. Do not introduce a display font for UI labels.

**The Fixed Scale Rule.** Use fixed rem sizes, not fluid clamp(). Collectors view the app at consistent device sizes; fluid type creates inconsistency across tabs.

## 4. Elevation

Depth is conveyed through tonal layering and subtle ambient glow rather than heavy drop shadows. Surfaces start flat; elevation appears as a response to state (hover, focus, open modals).

### Shadow Vocabulary
- **Glow** (`0 0 20px rgba(240, 106, 168, 0.3)`): Primary button and scan FAB ambient glow.
- **Glow Cyan** (`0 0 20px rgba(79, 224, 208, 0.3)`): Verification and success glow accents.
- **Card Hover** (`0 4px 12px rgba(0, 0, 0, 0.08)`): Gentle lift on desktop card hover.
- **Modal** (`0 12px 36px rgba(15, 18, 40, 0.18)`): Dialogs and bottom sheets.

### Named Rules
**The Flat-By-Default Rule.** Surfaces start flat. Shadows and glow appear as a response to state (hover, focus, elevation, open), never as permanent decoration.

**The No Ghost Card Rule.** Do not pair a 1px border with a wide soft shadow on the same element for decoration. Choose one: a clean border, or a defined shadow at ≤12px blur.

## 5. Components

### Buttons
- **Shape:** Rounded-xl (16px) with consistent padding (10px 24px for md, 12px 32px for lg).
- **Primary:** Magenta fill (`brand`), white text, subtle glow. Hover brightens to `brand-light`; active deepens to `brand-dark`.
- **Secondary:** Periwinkle fill, white text. Used for secondary CTAs and filter actions.
- **Ghost:** Transparent background, white text, hover uses `surface-lighter`.
- **Destructive:** Danger red fill for destructive actions.
- **Focus:** 2px brand ring with 2px offset. Loading state shows a spinner and disables click.

### Cards / Containers
- **Corner Style:** Rounded-xl (16px).
- **Background:** `surface-light` by default; `surface-lighter` for hover/selected states.
- **Border:** 1px `border` color when separation is needed; otherwise rely on tonal contrast.
- **Shadow Strategy:** Flat at rest; subtle shadow + lift on hover (desktop only).
- **Manropenal Padding:** 16px default; 20px for featured cards.

### Inputs / Fields
- **Style:** `surface-light` background, 1px `border` stroke, rounded-xl (16px).
- **Focus:** Border shifts to `brand`, subtle brand glow ring.
- **Placeholder:** Muted text color.
- **Error:** Border and text shift to danger red; helper text below.

### Chips / Badges
- **Style:** Pill shape (`rounded-full`), `surface-lighter` background, small label size.
- **State:** Selected chips use the accent color background (brand or periwinkle) with white text.
- **Usage:** Filters, status badges, rarity tags, shelf labels.

### Navigation
- **Mobile:** Floating bottom bar with a center scan FAB. Active item uses brand tint background and brand icon color.
- **Desktop:** Persistent left sidebar with icon + label links, plus a top app bar for search, notifications, and profile.
- **Active State:** Brand background tint + brand icon/text.
- **Hover:** `surface-lighter` background.

### Signature Component: Scan FAB
- A large circular button centered in the mobile bottom bar with a gradient from magenta to periwinkle and a strong glow. It is the single most prominent Manropeactive element on mobile and must remain reachable by thumb.

## 6. Do's and Don'ts

### Do:
- **Do** keep the magenta accent to ≤10% of any screen.
- **Do** use `surface-light` for cards and `surface-lighter` for hover/selected states.
- **Do** provide visible focus rings (2px brand, 2px offset) on every Manropeactive element.
- **Do** use JetBrains Mono for prices, card codes, P/L, and percentages.
- **Do** respect `prefers-reduced-motion` by disabling continuous animations and transforms.
- **Do** use skeleton screens and empty states instead of blank space.
- **Do** design every screen to work at 320px mobile width and expand gracefully to 1280px+ desktop.

### Don't:
- **Don't** use gradient text as a primary heading treatment. Gradient text is decorative and reduces readability.
- **Don't** use glassmorphism as a default card style. Glass is reserved for floating dock, overlays, and deliberate atmospheric moments.
- **Don't** use side-stripe borders (`border-left` >1px) as card accents.
- **Don't** ship placeholder copy like "Descriptionription", "Subtitle", or "Title".
- **Don't** rely on color alone for status. Pair badges/icons with text or labels.
- **Don't** use rounded corners larger than 16px on cards, sections, or inputs. Full pills are for buttons, tags, and badges only.
- **Don't** introduce a light-mode body background. The dark surface is core to the app's identity.

## 7. 8-bit Accent System

A restrained pixel-flavor layer that nods to retro collecting culture (TCG binders, arcade score counters) without turning the vault into a theme park. The goal is **a whiff of 8-bit, never a costume** — Playful must never erode Trustworthy.

**Pixel Font:** Silkscreen (400/700), fallback `JetBrains Mono, monospace` — Tailwind token `font-pixel`.
Chosen over Press Start 2P and Pixelify Sans because its tall x-height and open counters stay legible at 10–11px micro-label sizes; the alternatives blur or shout at that scale.

### Where the pixel font is allowed
- Micro-labels and badges (`.pxl-chip`)
- Status numbers, counters, and stepper indicators (`.pxl-num` / `font-pixel`)
- Small scan-flow accents (e.g. "STEP 2/4", rarity tags)

### Utilities (src/index.css)
- **`.pxl-chip`** (+ `--brand` / `--cyan` / `--peri` modifiers): notched-corner badge with pixel font. Meaning variants must always carry text — color is never the only signal.
- **`.pxl-corner`**: clip-path notched corners (default 4px, override via `--pxl-notch`). Shape primitive for small accents.
- **`.pxl-shadow`** (+ `--brand` / `--cyan` / `--peri`): hard 3px offset shadow with zero blur. Use sparingly, on one or two elements per screen max.
- **`.pxl-num`**: pixel font with tabular numerals for status numbers and steppers.
- **`.pxl-scanline`**: faint static cyan scanline texture (5% opacity, pointer-events: none). **Scan-related surfaces only** (viewfinder, scan progress) — never decorative wallpaper.

### Named Rules
**The Micro-Label Rule.** The pixel font is for micro-labels, badges, status numbers, and steppers only. Never use it for body text, headings, prices, buttons, or anything longer than ~4 words.

**The One-Room Rule.** Pixel accents live in small rooms, not on the whole house. Never apply pixel styling to an entire screen, page background, or primary card layout — one accent cluster per screen is enough.

**The Trust Rule.** Retro flavor must never undermine trust. No pixel styling on prices, payment, trade confirmations, or destructive flows; no flicker/CRT/glitch animations; all 8-bit utilities are static and inherit the global focus ring and reduced-motion protections.

**The Existing Palette Rule.** Pixel accents use only the existing palette — brand magenta, periwinkle, cyan, and surface/border tokens. Do not introduce new "retro" colors (NES reds, arcade yellows, neon greens) outside the token system.

### Site-wide rollout (chrome)

Codified by the system-level chrome rollout. Future contributors should reuse these patterns instead of inventing new ones.

**Scrollbar (R5).** The global scrollbar is thin (5px) with a brand-tinted thumb at low alpha (`rgba(240, 106, 168, 0.22)`, 0.35 on hover) over a transparent track; Firefox gets the equivalent via `scrollbar-width: thin` + `scrollbar-color`. Defined once in `src/index.css` — do not restyle scrollbars per page; `scrollbar-hide` remains the opt-out for internal scroll regions.

**Nav active-state pattern.** One shared language across BottomNav, Sidebar, TopBar, and the mobile sheet:
- Active icon/label take the category accent color over a low-alpha accent background (`accent/10`–`accent/15`); BottomNav's active icon pill is notched via `.pxl-corner`.
- A hard, square 2px indicator bar in the accent color — never rounded — marks the active item: top edge in BottomNav, left edge in Sidebar and the mobile sheet, bottom edge in TopBar.
- The active link carries `aria-current="page"`; touch targets stay ≥44px.
- BottomNav labels stay Manrope (Thai legibility) — the pixel flavor comes from the notched pill, square bar, and category color, not from the label font.

**Category wayfinding (R3).** The same color always means the same section, in nav chrome, chips, and dots alike:

| Section | Accent | Tokens |
| --- | --- | --- |
| Scan / AI | Brand magenta | `brand` / `--color-brand-primary*` |
| Market / prices / stores | Cyan | `cyan` / `--color-success*` |
| Vault / storage / security | Periwinkle | `periwinkle` / `--color-brand-secondary*` |

Neutral sections (home, profile, orders, wishlist, services, campaigns, admin) default to brand magenta.

**Pixel badges.** Use `<Badge variant="pixel">` (composes `.pxl-chip`) for status micro-labels anywhere; add `pxl-chip--brand` / `pxl-chip--cyan` / `pxl-chip--peri` via `className` for the category variants. Always pair with text — never color alone (R8).

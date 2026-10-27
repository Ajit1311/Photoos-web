# PhotoOS Design System & UI Specification (Phase B)

**Version:** 2.0.0  
**Design Philosophy:** Linear / Stripe / Apple-grade craft — restrained palette, high contrast, tactile depth, hairline precision, subtle motion, responsive and accessible.

---

## 1. Design Tokens & Foundations

### 1.1 Color Palette & Semantics

The palette is anchored by PhotoOS's signature deep corporate ocean blue, paired with neutral obsidian/slate surfaces rather than default generic colors.

#### Light Mode (`:root`)
- **Canvas / Background:** `#F8FAFC` (Slate 50 — clean, professional, non-glaring)
- **Surface / Card:** `#FFFFFF` (Pure white with 1px hairline border `#E2E8F0`)
- **Brand Primary:** `#0A3F61` (Signature PhotoOS Deep Navy)
- **Primary Foreground:** `#FFFFFF`
- **Secondary Surface:** `#F1F5F9` (Slate 100)
- **Secondary Foreground:** `#0A3F61`
- **Muted Background:** `#F1F5F9`
- **Muted Foreground:** `#475569` (Slate 600 — WCAG AA compliant contrast > 4.5:1)
- **Accent Highlight:** `#EBF5FB` / `#0A3F61`
- **Hairline Border:** `#E2E8F0`
- **Focus Ring:** `#0284C7` (Sky 600) with 3px 30% alpha halo

#### Dark Mode (`.dark`)
- **Canvas / Background:** `#090D14` (Deep obsidian dark slate)
- **Surface / Card:** `#0F172A` (Slate 900 — crisp layer distinction)
- **Brand Primary:** `#38BDF8` (Luminous sky cyan for optimal legibility)
- **Primary Foreground:** `#090D14`
- **Secondary Surface:** `#1E293B` (Slate 800)
- **Secondary Foreground:** `#F1F5F9`
- **Muted Background:** `#1E293B`
- **Muted Foreground:** `#94A3B8` (Slate 400 — high contrast on dark surfaces)
- **Accent Highlight:** `#1E293B` / `#38BDF8`
- **Hairline Border:** `#334155` (Slate 700 / 60% opacity)
- **Focus Ring:** `#38BDF8` (Sky 400)

#### Semantic Status Tokens
- **Success:** `#059669` (Light) / `#10B981` (Dark) — Emerald
- **Warning:** `#D97706` (Light) / `#F59E0B` (Dark) — Amber
- **Destructive:** `#BE123C` (Light) / `#F43F5E` (Dark) — Rose
- **Info:** `#0284C7` (Light) / `#38BDF8` (Dark) — Sky

---

### 1.2 Typography & Scale

- **Font Family:** `font-sans` (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- **Headings (`h1`, `h2`, `h3`):** Tight letter spacing (`tracking-tight`, `-0.025em`), bold weight (`font-semibold` / `font-bold`), crisp foreground contrast.
- **Body Text:** Leading `leading-relaxed` (1.6) for sustained reading comfort.
- **Labels & Microcopy:** `text-xs` or `text-[11px]`, `tracking-wide`, uppercase for metadata chips.

---

### 1.3 Depth & Layered Shadows

Linear/Apple-style soft multi-stop shadows rather than harsh directional drop shadows:
- **`shadow-2xs`:** `0 1px 2px 0 rgba(0, 0, 0, 0.03)` (Cards, input fields)
- **`shadow-xs`:** `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)` (Buttons, pill badges)
- **`shadow-card`:** `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 6px 16px -2px rgba(0, 0, 0, 0.05)` (Elevated cards)
- **`shadow-hover`:** `0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 12px 24px -4px rgba(0, 0, 0, 0.08)` (Card lifts on hover)
- **`glass-panel`:** `backdrop-filter: blur(12px)` + hairline border for headers and command dialogs.

---

### 1.4 Motion & Micro-interactions

- **Duration:** 150ms for micro-actions (toggles, buttons), 200ms for hover states, 250ms for sheet/modal entrances.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out curve).
- **Tactile feedback:** `active:scale-[0.98]` on buttons.
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions.

---

## 2. Refactored Component Library

### 2.1 Buttons (`components/ui/button.tsx`)
- **States:** Default, Hover, Active (`scale-[0.98]`), Focus-visible (`ring-3 ring-ring/40`), Disabled (`opacity-50 pointer-events-none`), Loading (`loading={true}` renders `<Loader2>` spinner).
- **Variants:** `default`, `brand`, `outline`, `secondary`, `ghost`, `destructive`, `link`.
- **Sizes:** `xs` (28px), `sm` (34px), `default` (38px), `lg` (44px), `touch` (min 44px for mobile WCAG compliance).

### 2.2 Cards (`components/ui/card.tsx`)
- 1px hairline border (`border-border/70`).
- Optional `hoverable` prop for interactive lift (`hover:-translate-y-0.5 hover:shadow-md`).
- Structured subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`.

### 2.3 Input Fields (`components/ui/input.tsx`)
- Minimum 44px tap area on mobile to avoid iOS auto-zoom and input mis-taps.
- Subtle hairline border, high-contrast placeholder (`placeholder:text-muted-foreground/80`), focus ring with soft glow.

### 2.4 Badges (`components/ui/badge.tsx`)
- Refined semantic variants: `brand`, `success`, `warning`, `info`, `destructive`, `outline`, `secondary`, `ghost`.
- Small pill form (`h-5.5 rounded-full px-2.5 text-[11px] font-medium tracking-tight`).

### 2.5 Skeleton Loaders (`components/ui/skeleton.tsx`)
- Shimmer wave animation (`after:animate-[shimmer_2s_infinite]`) to replace jarring spinners.

### 2.6 Empty State Component (`components/ui/empty-state.tsx`)
- Standardized pattern: Icon container, Title, Explanatory copy, Primary action CTA, Secondary action button.

### 2.7 Theme Toggle (`components/ui/theme-toggle.tsx`)
- Accessible 3-state toggle (Light / Dark / System) with smooth icon transition and zero layout shift.

---

## 3. Key Screen Transformations (Before & After)

| Screen | Before (Phase A Baseline) | After (Phase B Premium Polish) |
| :--- | :--- | :--- |
| **Global Theme & Layout** | Hardcoded light mode with inconsistent dark tokens; no theme switcher. | Native Light & Dark mode support via `next-themes` ThemeProvider, `ThemeToggle` pill in header and login, smooth transitions, high-contrast dark surfaces (`#090D14`). |
| **Top Navigation Header** | Static un-blurred background (`bg-card`); hardcoded `#0A3F61` hover in breadcrumb. | `sticky top-0 z-30 bg-card/85 backdrop-blur-md` with hairline border, theme toggle integration, dynamic contrast breadcrumbs. |
| **Dashboard Loading State** | Generic centered spinner with plain text. | High-fidelity Dashboard Skeleton with animated pulse, matching 4-card metric placeholders, quick action bars, and 2-column layout. |
| **Login Experience** | Fixed light background; unoptimized `<img>` tag; no legal links or theme switch. | Saturated dual-tone hero with glass card, next/image optimization, floating theme switcher, and direct links to DPDP Privacy Policy & Terms. |
| **Error Handling (404 / 500)** | Default unstyled Next.js error pages. | Branded photography-themed 404 (`app/not-found.tsx`) with camera aperture motif, safe error boundary (`app/error.tsx`) masking internal digests, and streaming loader (`app/loading.tsx`). |
| **Interactive Controls** | Basic hover states; default size buttons; spinners inside raw text. | 150-250ms ease-out transitions, `active:scale-[0.98]` tactile depression, mobile 44px minimum tap target compliance, automatic `<Loader2>` spinner in `Button`. |


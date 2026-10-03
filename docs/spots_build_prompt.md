# SpotS — Master Build Prompt

> Copy-paste this entire prompt into a new session to start building SpotS.

---

## Your Role

You are building **SpotS** — a mobile-first, curated city-discovery web app for Patna, Bihar. This is a greenfield project. There is no existing codebase. You will scaffold the entire project from scratch.

You have two canonical reference documents in the workspace:

- **`PRD.md`** — Product Requirements Document. The authoritative source of truth for features, data model, API design, user roles, and functional requirements.
- **`DESIGN-SYSTEM.md`** — Design System. The authoritative source for all visual decisions: tokens, typography, layout, components, motion, and mobile rules.

**Read both files in full before writing a single line of code.** All implementation decisions must be consistent with these two documents. If anything in your output contradicts either document, that is a bug — not a design choice.

---

## Project Overview

**SpotS** is a curated Patna city-discovery platform. Key surfaces:
- **Map** — Google Maps with custom category-colored droplet pins, bottom sheet on pin tap
- **Spots Feed** — searchable, filterable, paginated card grid + HotSpots leaderboard
- **Events** — grid of upcoming events linked to venue spots
- **Profile** — Google OAuth user, bookmarks, submissions, theme toggle
- **Admin Console (`/admin`)** — role-gated curation portal (spoter / super_admin)

---

## Tech Stack (non-negotiable)

| Layer | Technology |
|---|---|
| Frontend | React 18 + **JavaScript** (not TypeScript) + Vite 6 + Tailwind CSS v3 |
| Animations | Framer Motion (`motion/react`) — spring physics only |
| Icons | React Icons (multi-pack) — Phosphor is preferred per the design system |
| Map | Google Maps JavaScript API (key from `.env`) |
| Backend | Node.js + Express.js |
| Database | **Supabase Postgres** (primary) |
| Storage | **Supabase Storage** (images/media) |
| Auth | Custom Google OAuth 2.0 → server-issued JWT in **httpOnly cookies** |
| Dev Fallback | `mockData.js` — used only when backend is unreachable in dev |
| Frontend Host | Vercel |
| Backend Host | Render |

**Do not substitute any of these.** No TypeScript, no Next.js, no Firebase, no Axios (use `fetch`), no Zustand/Redux (use React context + hooks), no Bootstrap/MUI.

---

## Design System Ground Rules

These are hard constraints, not suggestions. Violating them is a bug.

### Colors — use CSS custom properties only
Never use raw hex values (`bg-[#CA2019]`) in component code. Use tokens:
```css
/* Light theme (:root) / Dark theme (.dark) */
--primary-kumkum: #CA2019
--secondary-amber: #FCA102
--bg-canvas: #FBE8C0
--surface-card: #FFF6E5
--surface-pill: #F3DFC1
--border-subtle: #E8D3B0
--text-primary: #2B1D15
--text-secondary: #5C4533
--text-tertiary: #7A624E
```
The dark theme swaps only neutrals (bg/surface/border/text). Brand accents stay the same hue.

### Typography — four fonts, four jobs
- **Kalam** — display only: one hero headline per screen, spot card names
- **Poppins** — everything else: UI, buttons, body, meta, tags
- **Playfair Display** — editorial/long-form copy only
- **Rozha One** — ceremonial stamp badges only (rare)

Never stack more than two font families in one view. Never use Kalam for buttons, tags, or meta text.

**16px minimum on all `<input>`, `<textarea>`, `<select>` on mobile — no exceptions.**

### Layout & Responsiveness
- **Mobile-first** — default styles target phones. Scale up with `md:` (768px) and `lg:` (1024px) breakpoints.
- **Navigation:** Bottom tab bar on mobile/tablet → full left sidebar (220px) on desktop (`lg:`).
- **Card grid:** 1 column on mobile → 2 columns on desktop (`lg:grid-cols-2`).
- **Content max-width:** 1200px centered on desktop.
- **Edge insets:** 16px mobile, 24px tablet, 32px desktop.

### Motion
- All Framer Motion transitions use the three presets from the design system:
  - **Snap** (spring): `{ type: "spring", stiffness: 480, damping: 30 }` — toggles, bottom sheet settle
  - **Settle** (ease): `duration: 0.22s, ease: [0.23,1,0.32,1]` — content swaps, modal enter
  - **Press**: `active:scale(0.97)` on every tappable element
- Animate only `transform` and `opacity`. Never animate `width`, `height`, `padding`, `top`.
- Gate all transitions behind `@media (prefers-reduced-motion: no-preference)`.

### Mobile Platform Rules
- `viewport-fit=cover` and `interactive-widget=resizes-content` in the `<meta>` viewport tag
- `env(safe-area-inset-bottom)` on all fixed bottom elements (nav, FAB, modal footers)
- `touch-action: manipulation` on all tappable elements
- `overscroll-behavior: none` on `html, body`
- `overscroll-behavior: contain` on scrollable sheets/feeds
- `-webkit-tap-highlight-color: transparent` globally
- Minimum 44×44px touch targets everywhere

### Z-Index Scale (use these, no others)
```
--z-card: 1  |  --z-sticky: 10  |  --z-nav: 100  |  --z-fab: 110
--z-scrim: 200  |  --z-modal: 210  |  --z-toast: 300
```

---

## Project Structure

Scaffold with this directory layout:

```
spots/
├── client/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/               # API client modules (public.js, admin.js)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Design-system primitives (Button, Card, Toast, etc.)
│   │   │   ├── map/           # Map-specific components
│   │   │   ├── spots/         # Spot feed, cards, detail
│   │   │   ├── events/        # Event cards, grid
│   │   │   └── admin/         # Admin console components
│   │   ├── context/           # ThemeContext, AuthContext
│   │   ├── hooks/             # Custom hooks (useSpots, useAuth, etc.)
│   │   ├── pages/             # Route-level components
│   │   ├── utils/             # Helpers
│   │   ├── mockData.js        # Dev fallback data (mirrors DB schema exactly)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # CSS custom properties + global base styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
├── server/                    # Express backend
│   ├── routes/
│   ├── middleware/
│   ├── db/                    # Supabase client + query helpers
│   └── index.js
├── schema.sql                 # Authoritative Postgres schema
```

---

## Build Order

Follow this sequence — do not skip ahead:

### Phase 1 — Foundation
1. Initialize Vite + React project in `client/`
2. Install all dependencies (Tailwind v3, Framer Motion, React Router, React Icons, Google Maps packages)
3. Configure `tailwind.config.js` — include the complete Mithila color palette, font families, custom shadows, border radii, and z-index scale from the design system
4. Write `index.css` — set up CSS custom properties for both `:root` (light) and `.dark` (dark theme), base global styles (tap highlight, overscroll, touch-action, font smoothing)
5. Wire up `index.html` — Google Fonts (Poppins, Kalam, Playfair Display, Rozha One), viewport meta with `viewport-fit=cover`, dual `theme-color` meta tags
6. Create `ThemeContext` — toggles `.dark` class on `<html>`, persists to `localStorage`
7. Create `AuthContext` — wraps Google OAuth state, exposes `user`, `login()`, `logout()`
8. Set up React Router with all routes from PRD §7.1

### Phase 2 — API & Data Layer
9. Write `schema.sql` matching the exact data model from PRD §6 (USERS, CATEGORIES, SPOTS, SPOT_IMAGES, EVENTS, LIKES, BOOKMARKS, SPOT_SUBMISSIONS)
10. Set up Express server with Supabase client, rate limiting, CORS
11. Implement all public endpoints (PRD §5.1)
12. Implement auth endpoints with Google OAuth flow (PRD §5.2)
13. Implement authenticated endpoints (likes, bookmarks, submissions)
14. Implement admin endpoints (role-guarded)
15. Write `mockData.js` — mirrors the schema with realistic Patna data (5–10 spots, 3 events, 6 categories)
16. Write API client modules: `api/public.js` and `api/admin.js` — both fall back to mock data in dev

### Phase 3 — Design System Components
Build these as reusable primitives before any page:
17. `Button` — primary, secondary/ghost, destructive variants (§8.4 of design system)
18. `SpotCard` — full spec from design system §8.1
19. `EventCard` — design system §8.3
20. `BottomNav` — mobile bottom tab bar (§5.3)
21. `Sidebar` — desktop nav (§5.4)
22. `Toast` — design system §8.9
23. `Skeleton` — warm shimmer variant (§8.10)
24. `Modal` — full-screen mobile / centered desktop (§8.6)
25. `BottomSheet` — spring-physics drag sheet (§8.6)
26. `FAB` — 56px kumkum circle with glow (§8.5)
27. `EmptyState` — folk-motif illustration variant (§8.12)
28. `ErrorState` — design system §8.13

### Phase 4 — Pages & Features
Build in this order (each depends on Phase 3 components):
29. **Map page** — Google Maps, custom SVG pins per category color, MapBottomSheet
30. **Spots Feed** — search, category/area/pincode/time filters, card grid, load more
31. **HotSpots Leaderboard** — horizontal rank cards (§8.2 design system), medals for top 3
32. **Events page** — grid, upcoming/past toggle
33. **Spot Detail** — modal + deep link page, gallery carousel, like/bookmark/share
34. **Event Detail** — deep link page
35. **Suggest a Spot** — full-screen form (mobile) / modal (desktop), location picker
36. **Profile** — user card, bookmarks list, submissions list, theme toggle
37. **Admin Console** — dashboard, spot management, submission triage, category CRUD, event CRUD, media library

### Phase 5 — Polish
38. Skeleton loading states on all data-fetching surfaces
39. Error boundary components around major sections
40. `prefers-reduced-motion` support across all animations
41. ARIA labels on all icon-only buttons
42. Focus ring (`--focus-ring` token) on all interactive elements
43. SEO: `<title>` and `<meta description>` per route, Open Graph tags on deep links

---

## Critical Don'ts

- ❌ Don't use raw hex values in component classes — always use token classes (`text-mithila-primary`, `bg-mithila-card`) or CSS custom properties
- ❌ Don't use `backdrop-filter` blur anywhere in the consumer app (no glassmorphism)
- ❌ Don't use navy/cold colors — the dark theme is warm near-black (`#1B1511`), never slate
- ❌ Don't use Kalam for anything except the one biggest headline on a screen
- ❌ Don't drop input `font-size` below 16px on mobile
- ❌ Don't animate `width`, `height`, `padding`, or `top` — transform/opacity only
- ❌ Don't store JWTs in `localStorage` — httpOnly cookies only
- ❌ Don't use mock data in production
- ❌ Don't allow anonymous likes/bookmarks — must prompt Google sign-in
- ❌ Don't hardcode categories in frontend — they're DB-driven
- ❌ Don't place a Destructive button adjacent to a Primary button without ≥24px gap
- ❌ Don't tile folk-art motifs across backgrounds — motifs are structural accents only (dividers, empty states)
- ❌ Don't use z-index values outside the defined scale

---

## How to Start

Say: **"I've read PRD.md and DESIGN-SYSTEM.md. Starting Phase 1."**

Then begin with Phase 1, Step 1. Complete each step fully before moving to the next. After each phase, briefly confirm what was built and ask if I want to proceed to the next phase.

When you are unsure about a visual or UX decision, default to what DESIGN-SYSTEM.md specifies. When you are unsure about a feature or data decision, default to what PRD.md specifies. If neither document covers it, ask before assuming.
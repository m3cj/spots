# SpotS Design System — Light (Mithila Field Guide) & Dark (Night Field Guide)

This is the canonical, implementable design system for SpotS — a hand-picked Patna discovery app.

---

## 1. Personality & Brand Voice

**Metaphor:** Hand-painted city field notes — a curated Patna discovery app inspired by local signboards, travel journals, and illustrated maps. It should feel like a well-worn pocket guide a local friend annotated.

**Adjectives:** Cultural, structured, inviting, authentic, warm, playful (in micro-interactions, not in typography).

**Anti-adjectives:** Cold corporate blue, glossy futuristic gradients, tech-SaaS clutter, washed-out flashbang mist, glass/blur UI panels, juvenile or distracting motion, dense paragraphs of content, literal folk-art illustration (scenes/characters/full motif coverage), cold navy (no `#0D1B28`-family colors — the dark theme is warm near-black, not cold slate).

**Voice rule:** Motifs are structural DNA, not decoration-for-its-own-sake. A Mithila lotus or triangle-bunting border earns its place as a section divider or empty-state illustration. It does not tile across every card background.

---

## 2. Tokens — Color

### 2.1 Light Theme — "Mithila Field Guide" (default)

| Token | Hex | Role | Usage |
|---|---|---|---|
| `--bg-canvas` | `#FBE8C0` | Warm parchment base | Full page background |
| `--surface-card` | `#FFF6E5` | Hand-pressed paper card | Spot cards, inputs, modals |
| `--surface-pill` | `#F3DFC1` | Warm tag surface | Tag chips, inactive filter pills |
| `--border-subtle` | `#E8D3B0` | Earthen clay boundary | Card outlines, dividers, modal headers |
| `--primary-kumkum` | `#CA2019` | High-intent cultural red | Active pills, like-hearts, map pins, primary CTA |
| `--primary-kumkum-hover` | `#B01B15` | Darkened red | Hover states on primary buttons and interactive elements |
| `--primary-kumkum-active` | `#961712` | Deep pressed red | Active/pressed states on primary elements |
| `--secondary-amber` | `#FCA102` | Marigold / genda phool | Category icon accents, clocks, toggle track |
| `--text-primary` | `#2B1D15` | Kohl / soot ink | Headings, spot names, active button text |
| `--text-secondary` | `#5C4533` | Walnut brown, darker step | Body paragraphs, descriptions |
| `--text-tertiary` | `#7A624E` | Walnut brown, lighter step | Meta text, area \| pincode, timing, timestamps |
| `--overlay-scrim` | `rgba(0,0,0,0.45)` | Translucent dark scrim (not a blur panel) | Category bubble / like-counter badge **on top of photos only** |

### 2.2 Dark Theme — "Night Field Guide"

| Token | Hex | Role | Usage |
|---|---|---|---|
| `--bg-canvas` | `#1B1511` | Warm near-black ink | Full page background |
| `--surface-card` | `#251D17` | Lamp-lit paper | Spot cards, inputs, modals |
| `--surface-pill` | `#2E241C` | Warm tag surface | Tag chips, inactive filter pills |
| `--border-subtle` | `#3D2F25` | Dim clay boundary | Card outlines, dividers |
| `--primary-kumkum` | `#CA2019` | Same brand red | Active pills, like-hearts, map pins |
| `--primary-kumkum-hover` | `#E2342C` | Brightened red | Hover states — brightened for contrast on dark backgrounds |
| `--primary-kumkum-active` | `#F04038` | Bright pressed red | Active/pressed states on dark |
| `--secondary-amber` | `#FCA102` | Same marigold | Category accents, toggle track |
| `--text-primary` | `#F9EED9` | Warm ivory | Headings, spot names |
| `--text-secondary` | `#D8C4AE` | Muted ivory, darker step | Body paragraphs, descriptions |
| `--text-tertiary` | `#B8A494` | Muted ivory, lighter step | Meta text, timestamps |
| `--overlay-scrim` | `rgba(0,0,0,0.6)` | Translucent dark scrim | Category bubble / like-counter badge on photos — slightly stronger than light mode |

**Rule:** Only the neutral scaffold (bg/surface/border/text) inverts between themes. Brand accent hues (kumkum, amber) stay constant so the brand reads identically in both modes — hover/active steps shift direction (darken in light, brighten in dark) to maintain contrast.

### 2.3 Semantic / State Tokens

Kept deliberately small — this is not a rainbow system.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--state-success` | `#2D5A43` | `#3E7D5C` | Approve actions, published status — lotus-leaf green |
| `--state-danger` | `#9A3324` | `#C2452F` | Reject / delete actions only — muted terracotta, deliberately distinct from `--primary-kumkum` |
| `--state-warning` | `#FCA102` | `#FCA102` | Pending / caution badges — reuses `--secondary-amber` |
| `--state-neutral` | `--text-tertiary` on `--surface-pill` | Same (dark tokens) | Neutral/pending status chips — no blue per anti-adjectives |

### 2.4 Interactive State Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--focus-ring` | `0 0 0 2px var(--surface-card), 0 0 0 4px var(--primary-kumkum)` | Same formula (adapts via var references) | Double-ring focus indicator on all focusable elements — inner ring matches surface, outer ring is kumkum red |

---

## 3. Tokens — Typography

Four font families, each with exactly one job — no overlapping roles, no guessing which font a new component should use.

| Family | Role | Weights loaded |
|---|---|---|
| **Poppins** | All UI: body copy, buttons, nav, form fields, meta text | 300, 400, 500, 600, 700, 800 |
| **Kalam** | Display only: hero titles, spot card names | 400, 700 |
| **Playfair Display** | Editorial: long-form copy in Help articles and event descriptions | 600, 700, 800, 600-italic |
| **Rozha One** | Ceremonial accents only: rare stamp-like badges ("Est. Patna"), never body or UI | 400 |

**Hard rule:** Never stack more than two font families in one view. Kalam is for the single biggest headline in a screen — not for buttons, not for tags, not for meta text.

### 3.1 Type Scale

| Role | Family | Weight | Size (mobile) | Size (desktop) | Line height | Letter spacing | Usage |
|---|---|---|---|---|---|---|---|
| Display / H1 | Kalam | 700 | 28px | 34px | 1.15 | 0 | Hero title, modal headline |
| Spot Name | Kalam | 700 | 19px | 20px | 1.25 | 0 | Card title (→ `--primary-kumkum` on hover/press) |
| Section Heading | Poppins | 700 | 16px | 18px | 1.3 | -0.01em | Section titles, dashboard cards |
| Meta / Subtitle | Poppins | 500 | 12px | 12px | 1.3 | 0.01em | Area \| pincode, best timing |
| Body | Poppins | 400 | 14px | 15px | 1.5 | 0 | Real paragraphs (Help, event descriptions) |
| Caption / Hook | Poppins | 400 | 12px | 12px | 1.45 | 0.01em | 2-line-clamp card description |
| Tags / Chips | Poppins | 500 | 11px | 11px | 1.0 | 0.02em | `#Riverfront`, `#Chai` pills |
| Button / CTA | Poppins | 600 | 13px | 13px | 1.0 | 0.01em | "Map", "View", "Submit" |
| Editorial | Playfair Display | 500-italic | 15px | 16px | 1.6 | 0 | Long-form article copy |
| Ceremonial | Rozha One | 400 | 12px (caps) | 12px | 1.0 | 0.04em | Rare stamp-style badges |

**Non-negotiable input rule:** Every `<input>`, `<textarea>`, `<select>` renders at **16px minimum** on mobile, regardless of its visual role above. iOS Safari zooms in on focus below 16px and never zooms back out. If a design calls for visually smaller inputs, use the `transform: scale()` technique, never shrink the actual `font-size`.

---

## 4. Tokens — Spacing, Radius & Elevation

**Base unit:** 4px.

| Steps | px | Typical use |
|---|---|---|
| 1 / 2 | 4 / 8 | Icon-to-label gaps, tight chip padding |
| 3 / 4 | 12 / 16 | Card internal padding, gap between bordered controls |
| 5 / 6 | 20 / 24 | Section padding, gap between unrelated control groups |
| 8 / 10 | 32 / 40 | Between major sections |
| 12+ | 48+ | Page-level vertical rhythm |

**Rules:**
- Mobile edge inset minimum: 16px.
- Group spacing must be ≥ 2× the spacing used within the group (Gestalt proximity) — if card internals use 8px gap, separate cards by at least 16–24px.
- Never glue full-width buttons to the viewport edge — inset by 16px with rounded corners.

### 4.1 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 8px | Small chips, input fields |
| `--radius-sm` | 12px | Default cards, buttons |
| `--radius-md` | 16px | Elevated cards, modals |
| `--radius-lg` | 24px | Bottom sheets, hero cards |
| `--radius-xl` | 32px | Large modal containers |
| `--radius-pill` | 9999px | Pills, avatars, theme toggle, FAB |

**Concentric radius rule:** When nesting a rounded element inside a rounded container, the outer radius equals the inner radius plus the padding between them:

$$r_{outer} = r_{inner} + padding$$

A `--radius-md` (16px) card with 8px internal padding should wrap children at `--radius-xs` (8px). Mismatched, non-concentric radii make nested elements look sloppy.

### 4.2 Elevation / Shadow

Shadows are tinted toward each theme's ink color — pure black shadows read muddy on warm parchment.

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(43,29,21,0.08)` | `0 2px 8px rgba(0,0,0,0.3)` | Resting cards, inputs |
| `--shadow-md` | `0 8px 24px rgba(43,29,21,0.12)` | `0 8px 30px rgba(0,0,0,0.45)` | Raised cards, dropdowns |
| `--shadow-lg` | `0 16px 40px rgba(43,29,21,0.18)` | `0 16px 48px rgba(0,0,0,0.55)` | Modals, bottom sheets |
| `--shadow-nav` | `0 -8px 24px rgba(43,29,21,0.10)` | `0 -8px 32px rgba(0,0,0,0.55)` | Bottom nav bar |
| `--shadow-glow-red` | `0 4px 20px rgba(202,32,25,0.35)` | `0 4px 20px rgba(226,52,44,0.45)` | Primary CTA emphasis, FAB glow — used sparingly |

### 4.3 Z-Index Scale

Defined layers to prevent z-index conflicts between overlapping elements.

| Token | Value | Usage |
|---|---|---|
| `--z-card` | `1` | Resting cards with elevation |
| `--z-sticky` | `10` | Sticky headers, pinned filter bars |
| `--z-nav` | `100` | Bottom nav (mobile), sidebar (desktop) |
| `--z-fab` | `110` | Floating action button — always above nav |
| `--z-scrim` | `200` | Modal/sheet backdrop overlay |
| `--z-modal` | `210` | Modal and bottom sheet surfaces |
| `--z-toast` | `300` | Toast notifications — always topmost |

---

## 5. Layout & Responsiveness

### 5.1 Breakpoints

Mobile-first — the default (no media query) styles target phones. Two breakpoints scale up:

| Name | Min-width | Target |
|---|---|---|
| *default* | 0 | Phones (portrait & landscape) |
| **md** | 768px | Tablets |
| **lg** | 1024px | Desktop |

### 5.2 Page Shell

| Element | Mobile (<768px) | Tablet (768–1023px) | Desktop (≥1024px) |
|---|---|---|---|
| **Navigation** | Bottom tab bar (fixed, `--z-nav`) | Bottom tab bar | Left sidebar, 220px wide, fixed, full-height |
| **Content area** | Full-width, 16px edge insets | Full-width, 24px edge insets | `max-width: 1200px`, centered, 32px edge insets |
| **FAB** | 16px above bottom nav, right-aligned | 16px above bottom nav, right-aligned | Pinned to sidebar bottom |

**Content max-width rule:** On desktop, the main content area is capped at 1200px and horizontally centered within the viewport (minus sidebar width). This prevents cards and text from stretching unreadably on ultrawide monitors.

### 5.3 Navigation — Bottom Bar (Mobile / Tablet)

- Surface: `--surface-card`, `--shadow-nav`, safe-area bottom padding (`env(safe-area-inset-bottom, 0px)`).
- 4 tabs: Map, Spots, Events, Profile.
- Active tab icon: `fill` weight Phosphor icon, `--primary-kumkum`. Inactive: `regular` weight, `--text-tertiary`.
- Active tab label: `--primary-kumkum`, Poppins 500 11px. Inactive label: `--text-tertiary`.
- Minimum 44×44px tap target per tab, even if the visual icon is 24px.

### 5.4 Navigation — Sidebar (Desktop)

- Surface: `--surface-card`, `--shadow-md`, fixed left, full viewport height.
- Width: 220px.
- Structure: App logo/name at top → nav items (icon + label, vertically stacked) → FAB at bottom.
- Active item: `--primary-kumkum` text and icon, `--surface-pill` background with `--radius-sm`.
- Inactive item: `--text-secondary` text and icon, transparent background.
- Hover: `--surface-pill` background, `--text-primary` text.
- Border: 1px `--border-subtle` on the right edge.

### 5.5 Card Grid

| Breakpoint | Columns | Gap |
|---|---|---|
| Mobile (<768px) | 1 | 16px |
| Desktop (≥1024px) | 2 | 24px |

Cards fill the available column width. On single-column mobile, cards span the full content width minus edge insets.

### 5.6 Scrollable Containers

Horizontal scroll areas (category pills, image carousels, tag overflow) follow these rules:

- `scroll-snap-type: x mandatory` with `scroll-snap-align: start` on each child.
- Scrollbar hidden: `-webkit-scrollbar { display: none }` and `scrollbar-width: none`.
- `overscroll-behavior: contain` to prevent parent-scrolling bleed.
- Edge padding: match the page's edge inset (16px mobile, 24px tablet, 32px desktop) so the first/last items aren't flush against the viewport edge.
- Fade indicators: optional subtle gradient fade on the right edge to signal more content is scrollable.

---

## 6. Iconography

**Library:** Phosphor Icons React.

**Standard:**
- Default weight: `regular` for inactive/idle icons.
- Active / selected state: `fill` weight, colored `--primary-kumkum`.
- Never mix weights within the same icon group (e.g., a category row must be all-`regular` except the one active item, which is `fill`).
- Minimum rendered size: 20px visual, with hit area expanded to 44px (see Mobile Rules).

---

## 7. Motion & Transitions

### 7.1 Animation Presets

| Preset name | Values | Usage |
|---|---|---|
| **Snap** (spring) | `{ type: "spring", stiffness: 480, damping: 30 }` | Toggles, knobs, draggable sheet settle |
| **Settle** (ease) | `duration: 0.22s`, `ease: [0.23, 1, 0.32, 1]` | Icon cross-fades, content swaps |
| **Press** | `active:scale(0.97)`, `100ms cubic-bezier(0.16,1,0.3,1)` | Every tappable element |

### 7.2 Animation Rules

- Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `padding` — causes layout thrash on mobile GPUs.
- Respect `prefers-reduced-motion: reduce` — disable non-essential spring/slide animation, keep opacity cross-fades.
- Modals/popovers scale in from their trigger origin; true full-screen modals scale from center.
- Bottom sheets hand off release velocity directly to the spring (no re-computing from scratch on release).

### 7.3 Property Transitions

All property transitions are gated behind `@media (prefers-reduced-motion: no-preference)`.

| Element | Properties | Duration | Easing |
|---|---|---|---|
| Buttons | `background-color`, `box-shadow` | 150ms | ease |
| Cards | `box-shadow`, `transform` | 200ms, 100ms | ease |
| Links / Text | `color` | 150ms | ease |
| Icons | `color`, `opacity` | 150ms | ease |
| Input focus ring | `box-shadow` | 150ms | ease |

---

## 8. Components

### 8.1 Spot Card

- Surface: `--surface-card`, `--radius-md`, `--shadow-sm` resting / `--shadow-md` on press.
- Hero image: full-bleed top, `--radius-md` applied only to top corners, `aspect-ratio: 3/2`, `object-fit: cover`, lazy-loaded below the fold.
- Category bubble (top-left) & like-counter (top-right): `--overlay-scrim` background, white text, `--radius-pill`, positioned with 8px inset from image edge.
- Title: Kalam 700 19px `--text-primary`, → `--primary-kumkum` on press.
- Meta row: Poppins 500 12px `--text-tertiary`.
- Description: Poppins 400 12px `--text-secondary`, clamped to 2 lines.
- Tag pills: `--surface-pill` background, `--text-tertiary` text, `--radius-pill`.

### 8.2 HotSpots Leaderboard Card

- Layout: horizontal — rank badge on the left, hero image thumbnail (square, 64×64px, `--radius-sm`, `object-fit: cover`), text block (name, category, area), like count on the far right.
- Surface: `--surface-card`, `--radius-sm`, `--shadow-sm`.
- **Top 3 styling:** Gold (#D4A853), Silver (#A8A8A8), Bronze (#CD7F32) left accent border (3px), matching medal emoji in the rank badge.
- **Ranks 4–10:** Numbered circle badge in `--surface-pill` with `--text-secondary` text, no accent border.
- Name: Kalam 700 16px `--text-primary`.
- Category + area: Poppins 400 12px `--text-tertiary`.
- Like count: Poppins 600 14px `--primary-kumkum`, paired with a heart icon.

### 8.3 Event Card

- Surface: `--surface-card`, `--radius-md`, `--shadow-sm`.
- Hero image: full-bleed top, `--radius-md` top corners only, `aspect-ratio: 16/9`, `object-fit: cover`.
- Date/time strip: `--surface-pill` background, `--text-primary` text, Poppins 600 12px, positioned at the bottom of the hero image or immediately below it.
- Title: Poppins 700 16px `--text-primary`.
- Venue (spot name + area): Poppins 400 12px `--text-tertiary`, linked to the spot.
- Category chips: same styling as Spot Card tag pills.
- Price badge: "Free" uses `--state-success` background with white text; priced events use `--surface-pill` with `--text-primary`.
- Age limit badge (if applicable): `--surface-pill` background, `--text-tertiary` text.
- "Book Now" link (if applicable): `--primary-kumkum` text, underlined, opens `booking_link` externally.

### 8.4 Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `--primary-kumkum` | `--surface-card` (near-white) | none | Single highest-priority action per screen |
| Secondary / Ghost | transparent | `--text-primary` | 1px `--border-subtle` | Paired secondary actions |
| Destructive | `--state-danger` | white | none | Reject/delete only — never in the same button group as Primary without a visible gap ≥ 24px |

All buttons: `--radius-pill` or `--radius-sm` (pick one per surface, don't mix within a screen), Poppins 600 13px, `touch-action: manipulation`, min 44×44px hit area, `active:scale(0.97)`, focus ring via `--focus-ring`.

### 8.5 FAB (Floating Action Button)

- Shape: circle, 56px diameter, `--radius-pill`.
- Fill: `--primary-kumkum`.
- Icon: white "+" (Phosphor `Plus` icon, 24px).
- Shadow: `--shadow-glow-red` — the red glow draws attention without being garish.
- **Mobile position:** fixed, 16px from right edge, 16px above the bottom nav bar. Respects `env(safe-area-inset-bottom)`.
- **Desktop position:** pinned to the sidebar bottom, centered horizontally within the sidebar, 16px from the bottom edge.
- Press: `active:scale(0.92)` (slightly more dramatic than regular buttons since it's circular).
- Focus ring: `--focus-ring`.

### 8.6 Modal / Bottom Sheet

**Mobile (<768px):**
- Modals render as full-screen overlays — slide up from the bottom using **Settle** preset.
- Surface: `--surface-card`, `--radius-lg` on top corners only, full viewport height.
- Dismiss: swipe-down gesture (drag handle at top center), or close button (top-right).

**Desktop (≥1024px):**
- Modals render as centered overlays — scale in from center using **Settle** preset.
- Surface: `--surface-card`, `--radius-md`, max-width 560px, max-height 85vh.
- Backdrop: `--overlay-scrim` dimmer at `--z-scrim`.
- Dismiss: click backdrop, Escape key, or close button.

**Shared rules (both breakpoints):**
- Header: `--border-subtle` 1px bottom divider.
- Action buttons: sticky footer, stays above `env(safe-area-inset-bottom)`, never scrolls with body content.
- Z-index: `--z-modal` (210).

**Bottom Sheets (map-specific):**
- Drag handle: small pill-shaped indicator (40×4px, `--border-subtle`, centered).
- Dismiss via drag uses the **Snap** preset with overshoot-clamp — no springing past the screen edge.
- Velocity passthrough: release velocity feeds directly into the spring, no re-computing.

### 8.7 Search / Text Input

- Surface: `--surface-card`, `--radius-xs`, 1px `--border-subtle`, focus ring `--focus-ring`.
- Font size: 16px minimum on mobile (see Typography hard rule) — no exceptions.
- Label above input, never placeholder-as-label.
- Errors below input in `--state-danger`, linked via `aria-describedby`.

### 8.8 Overlay Scrim Badge

- `--overlay-scrim` background, white text/icon, `--radius-pill` or `--radius-xs`.
- Used only on top of photographic content for legibility.
- This is **not** a blurred glass panel — no `backdrop-filter`, just a flat translucent fill.

### 8.9 Toast / Snackbar

- Position: **mobile** — fixed, horizontally centered, 16px above the bottom nav, full width minus 32px edge insets. **Desktop** — fixed bottom-right corner, 24px from edges, max-width 400px.
- Surface: `--surface-card`, `--radius-sm`, `--shadow-md`.
- Left accent border: 3px, colored by state (`--state-success` for success, `--state-danger` for error, `--state-warning` for warnings).
- Text: Poppins 400 14px `--text-primary` (message), optional Poppins 500 12px `--text-secondary` (subtitle).
- Icon: Phosphor icon matching the state, colored to match the accent border.
- Entrance: slide up from below using **Settle** preset.
- Auto-dismiss: 3.5 seconds. Swipe-to-dismiss (horizontal swipe on mobile).
- Z-index: `--z-toast` (300).

### 8.10 Skeleton Loaders

- Shape: match the component being loaded — rectangular blocks for images, rounded pills for text lines, circles for avatars.
- Color: pulsing shimmer between `--surface-card` and `--surface-pill` (warm parchment pulse, not cold gray).
- Animation: `@keyframes shimmer` — a left-to-right gradient sweep, 1.5s duration, infinite loop.
- Respect `prefers-reduced-motion`: under reduced motion, use a static `--surface-pill` fill with no animation.
- Apply to: spot cards, event cards, map pins, leaderboard entries, admin tables, profile sections.

### 8.11 Profile / User Info Card

- Surface: `--surface-card`, `--radius-md`, `--shadow-sm`.
- Avatar: 64px circle (`--radius-pill`), `object-fit: cover`, Google OAuth avatar URL, 1px `--border-subtle` ring.
- Name: Poppins 700 18px `--text-primary`.
- Email: Poppins 400 13px `--text-tertiary`.
- Action links (Bookmarks, My Submissions, Theme Toggle, Logout): Poppins 500 14px `--text-secondary`, vertical list with `--border-subtle` dividers between items, 44px minimum row height for touch.

### 8.12 Empty States

- Layout: centered vertically and horizontally within the content area.
- Illustration: a hand-drawn folk motif (lotus, small map doodle, illustrated compass) rendered in `--text-tertiary` tones, muted and subtle. This is one of the approved structural uses of Mithila motifs.
- Headline: Poppins 600 16px `--text-primary` (e.g., "No spots found", "Your bookmarks will appear here").
- Subtitle: Poppins 400 13px `--text-tertiary` (e.g., "Try adjusting your filters", "Explore spots and tap the bookmark icon").
- Optional CTA: secondary/ghost button below the subtitle (e.g., "Explore Spots", "Clear Filters").
- Illustrations should be SVG, max 120×120px, and feel like marginalia in a field notebook — not polished vector art.

### 8.13 Error States

- Layout: centered, same positioning as empty states.
- Icon: Phosphor `WifiSlash` or `Warning` icon, 48px, `--state-danger` color.
- Headline: Poppins 600 16px `--text-primary` (e.g., "Connection issue", "Something went wrong").
- Subtitle: Poppins 400 13px `--text-tertiary` (e.g., "Check your internet connection and try again").
- CTA: Primary button labeled "Retry" — triggers the failed action again.
- No silent failures — every API error surfaces a visible error state or toast.

### 8.14 Image & Media Rules

| Context | Aspect Ratio | Object Fit | Radius | Loading |
|---|---|---|---|---|
| Spot Card hero | `3:2` | `cover` | Top corners match parent card (`--radius-md`) | `loading="lazy"` below fold |
| Event Card hero | `16:9` | `cover` | Top corners match parent card (`--radius-md`) | `loading="lazy"` below fold |
| HotSpots thumbnail | `1:1` (64×64px) | `cover` | `--radius-sm` | Eager (above fold) |
| Spot Detail gallery | `3:2` | `cover` | `--radius-sm` | Eager for first image, lazy for rest |
| Profile avatar | `1:1` (64×64px) | `cover` | `--radius-pill` | Eager |

---

## 9. Mobile & Platform Rules

| Rule | Detail |
|---|---|
| `viewport-fit=cover`, `interactive-widget=resizes-content` | Set in `<meta name="viewport">` |
| Dual `theme-color` meta | Light: `#FBE8C0`, Dark: `#1B1511` — use `media="(prefers-color-scheme: light\|dark)"` attribute |
| `-webkit-tap-highlight-color: transparent` | Applied globally |
| `touch-action: manipulation` on tappables | Prevents double-tap-to-zoom delay |
| Hover gated behind `(hover: hover) and (pointer: fine)` | Hover effects only on devices that support real hover |
| `overscroll-behavior: none` on `html, body` | Prevents pull-to-refresh and overscroll bounce |
| `overscroll-behavior: contain` on scrollable sheets/feeds | Prevents parent scroll bleed from inner scroll containers |
| 16px minimum font-size on all inputs | Prevents iOS Safari auto-zoom on focus |
| 44×44px minimum touch targets | All interactive elements — icons, buttons, tabs, links |
| Safe-area padding on fixed bottom elements | Bottom nav, modal footers, FAB — use `env(safe-area-inset-bottom)` |
| No `user-scalable=no` / `maximum-scale=1` | Never restrict pinch-to-zoom |
| Single `darkMode: 'class'` + one ThemeContext | `<html>` element receives `.dark` class, toggled via React context, persisted to `localStorage` |

---

## 10. Accessibility

- Color is never the only signal — destructive/danger actions pair `--state-danger` with an icon and text label, never color alone.
- Minimum contrast: `--text-primary` on `--bg-canvas` and `--text-primary` on `--surface-card` both pass WCAG AA in both themes.
- Focus states: visible double-ring focus indicator via `--focus-ring`, never `outline: none` without a replacement.
- Touch targets: 24×24px WCAG 2.5.8 floor, 44×44px is the SpotS standard everywhere.
- Never disable pinch-zoom or text resizing.
- Respect `prefers-reduced-motion`.
- Proper heading hierarchy: single `<h1>` per page.
- Modals and bottom sheets are keyboard-navigable with focus trapping.

---

## 11. Do's and Don'ts

### Do

- Use named tokens (`--primary-kumkum`, `--text-secondary`, etc.) or their Tailwind equivalents everywhere — never a raw arbitrary hex.
- Keep motifs (lotus, triangle bunting) structural: dividers, empty states, rare accents.
- Keep brand accent hues (kumkum, amber) constant across light/dark; only neutrals invert.
- Reserve Kalam for exactly one display moment per screen.
- Tint shadows toward each theme's ink color.
- Apply the concentric radius formula when nesting rounded elements.
- Gate hover effects behind `@media (hover: hover) and (pointer: fine)`.
- Gate transitions behind `@media (prefers-reduced-motion: no-preference)`.

### Don't

- Don't use cold navy/slate colors (`#0D1B28`-family) — the dark theme is warm near-black.
- Don't use `backdrop-filter` blur panels (glassmorphism) anywhere in the consumer app.
- Don't illustrate full folk-art scenes — motifs are structural accents only.
- Don't drop input font-size below 16px on mobile.
- Don't use `--state-danger` and `--primary-kumkum` in the same button group without a clear ≥24px gap — they must never be confusable.
- Don't stack more than two font families in a single view.
- Don't animate layout properties (`width`, `height`, `padding`, `top`) — transform/opacity only.
- Don't use z-index values outside the defined scale (§4.3) — prevent stacking conflicts.

---

## 12. Quick Start — CSS Custom Properties

```css
:root {
  /* Light — Mithila Field Guide */
  --bg-canvas: #FBE8C0;
  --surface-card: #FFF6E5;
  --surface-pill: #F3DFC1;
  --border-subtle: #E8D3B0;
  --primary-kumkum: #CA2019;
  --primary-kumkum-hover: #B01B15;
  --primary-kumkum-active: #961712;
  --secondary-amber: #FCA102;
  --text-primary: #2B1D15;
  --text-secondary: #5C4533;
  --text-tertiary: #7A624E;
  --overlay-scrim: rgba(0, 0, 0, 0.45);

  --state-success: #2D5A43;
  --state-danger: #9A3324;
  --state-warning: #FCA102;

  --shadow-sm: 0 2px 8px rgba(43, 29, 21, 0.08);
  --shadow-md: 0 8px 24px rgba(43, 29, 21, 0.12);
  --shadow-lg: 0 16px 40px rgba(43, 29, 21, 0.18);
  --shadow-nav: 0 -8px 24px rgba(43, 29, 21, 0.10);
  --shadow-glow-red: 0 4px 20px rgba(202, 32, 25, 0.35);

  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 9999px;

  --z-card: 1;
  --z-sticky: 10;
  --z-nav: 100;
  --z-fab: 110;
  --z-scrim: 200;
  --z-modal: 210;
  --z-toast: 300;

  --focus-ring: 0 0 0 2px var(--surface-card), 0 0 0 4px var(--primary-kumkum);
}

.dark {
  /* Dark — Night Field Guide */
  --bg-canvas: #1B1511;
  --surface-card: #251D17;
  --surface-pill: #2E241C;
  --border-subtle: #3D2F25;
  --primary-kumkum: #CA2019;
  --primary-kumkum-hover: #E2342C;
  --primary-kumkum-active: #F04038;
  --secondary-amber: #FCA102;
  --text-primary: #F9EED9;
  --text-secondary: #D8C4AE;
  --text-tertiary: #B8A494;
  --overlay-scrim: rgba(0, 0, 0, 0.6);

  --state-success: #3E7D5C;
  --state-danger: #C2452F;
  --state-warning: #FCA102;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.55);
  --shadow-nav: 0 -8px 32px rgba(0, 0, 0, 0.55);
  --shadow-glow-red: 0 4px 20px rgba(226, 52, 44, 0.45);

  /* Radius and z-index tokens are theme-independent — inherited from :root */
}
```

---

## 13. Quick Start — Tailwind Config

```js
// client/tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mithila: {
          bg: "#FBE8C0",
          card: "#FFF6E5",
          pill: "#F3DFC1",
          border: "#E8D3B0",
          primary: "#CA2019",
          primaryHover: "#B01B15",
          primaryActive: "#961712",
          secondary: "#FCA102",
          text: "#2B1D15",
          textSecondary: "#5C4533",
          muted: "#7A624E",
          darkBg: "#1B1511",
          darkCard: "#251D17",
          darkPill: "#2E241C",
          darkBorder: "#3D2F25",
          darkPrimaryHover: "#E2342C",
          darkPrimaryActive: "#F04038",
          darkText: "#F9EED9",
          darkTextSecondary: "#D8C4AE",
          darkMuted: "#B8A494",
        },
        state: {
          success: "#2D5A43",
          successDark: "#3E7D5C",
          danger: "#9A3324",
          dangerDark: "#C2452F",
          warning: "#FCA102",
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        handwritten: ['Kalam', 'cursive'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        heritage: ['"Rozha One"', '"Playfair Display"', 'serif'],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(43, 29, 21, 0.08)',
        md: '0 8px 24px rgba(43, 29, 21, 0.12)',
        lg: '0 16px 40px rgba(43, 29, 21, 0.18)',
        nav: '0 -8px 24px rgba(43, 29, 21, 0.10)',
        'glow-red': '0 4px 20px rgba(202, 32, 25, 0.35)',
      },
      zIndex: {
        card: '1',
        sticky: '10',
        nav: '100',
        fab: '110',
        scrim: '200',
        modal: '210',
        toast: '300',
      },
    },
  },
};
```

---

## 14. Component Contracts

Quick-reference checklist for verifying a component matches the design system. Use when building or reviewing components.

### Spot Card
- [ ] `--surface-card` background, `--radius-md`, `--shadow-sm` resting
- [ ] Hero image: `aspect-ratio: 3/2`, `object-fit: cover`, top corners only rounded
- [ ] Category bubble (top-left): `--overlay-scrim` fill, white text, `--radius-pill`, 8px inset — no `backdrop-filter`
- [ ] Like counter (top-right): same styling as category bubble
- [ ] Title: Kalam 700 19px `--text-primary`, → `--primary-kumkum` on press
- [ ] Tag pills: `--surface-pill` background, `--text-tertiary` text, `--radius-pill`
- [ ] No cold gray, no glassmorphism, no navy

### Primary CTA Button
- [ ] `--primary-kumkum` fill, near-white text (`--surface-card`)
- [ ] `--radius-pill`, Poppins 600 13px
- [ ] Hover: `--primary-kumkum-hover` (darken on light, brighten on dark)
- [ ] `active:scale(0.97)` press feedback
- [ ] 44px minimum height, `touch-action: manipulation`
- [ ] `--focus-ring` on keyboard focus

### Destructive Button
- [ ] `--state-danger` fill — never `--primary-kumkum`
- [ ] Paired with icon + text label ("Reject"/"Delete") — never color alone
- [ ] Never adjacent to a Primary button without ≥24px gap

### Bottom Sheet
- [ ] `--surface-card`, `--radius-lg` top corners only, `--shadow-lg`
- [ ] Drag handle: 40×4px pill, `--border-subtle`, centered
- [ ] **Snap** spring preset (stiffness: 480, damping: 30)
- [ ] Sticky action footer above `env(safe-area-inset-bottom)`
- [ ] `--z-modal` (210)

### Toast
- [ ] `--surface-card`, `--radius-sm`, `--shadow-md`
- [ ] 3px left accent border colored by state
- [ ] Slide up with **Settle** preset, auto-dismiss 3.5s
- [ ] `--z-toast` (300)

### Dark Mode (any component)
- [ ] Swap only neutral tokens (bg/surface/border/text) to dark equivalents
- [ ] Brand accents (kumkum, amber) stay the same hue
- [ ] Hover/active steps brighten (not darken) for contrast on dark backgrounds
- [ ] No cold navy, no cold gray — dark theme is warm near-black

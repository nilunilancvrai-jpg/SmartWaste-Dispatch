---
name: Executive Dispatch & Civic Ecology
colors:
  surface: '#0f1510'
  surface-dim: '#0f1510'
  surface-bright: '#353b35'
  surface-container-lowest: '#0a0f0b'
  surface-container-low: '#171d18'
  surface-container: '#1b211c'
  surface-container-high: '#262b26'
  surface-container-highest: '#303631'
  on-surface: '#dee4dc'
  on-surface-variant: '#becabd'
  inverse-surface: '#dee4dc'
  inverse-on-surface: '#2c322c'
  outline: '#889488'
  outline-variant: '#3e4940'
  surface-tint: '#77db99'
  primary: '#77db99'
  on-primary: '#00391c'
  primary-container: '#047d45'
  on-primary-container: '#bbffcc'
  inverse-primary: '#006d3b'
  secondary: '#a9d0b1'
  on-secondary: '#143721'
  secondary-container: '#2e5038'
  on-secondary-container: '#9bc2a3'
  tertiary: '#ffb2b7'
  on-tertiary: '#610f1f'
  tertiary-container: '#b04c57'
  on-tertiary-container: '#ffeaeb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#93f8b3'
  primary-fixed-dim: '#77db99'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#00522b'
  secondary-fixed: '#c5eccc'
  secondary-fixed-dim: '#a9d0b1'
  on-secondary-fixed: '#00210e'
  on-secondary-fixed-variant: '#2c4e36'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000e'
  on-tertiary-fixed-variant: '#7f2734'
  background: '#0f1510'
  on-background: '#dee4dc'
  surface-variant: '#303631'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1.0rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an executive command center aesthetic tailored for modern environmental logistics, municipal oversight, and location-aware fleet routing. Blending high-density functional utility with poised, institutional elegance, the interface transforms daily waste tracking, citizen reports, and vehicle routing into a calm, authoritative digital workspace.

### Brand Personality & Core Principles
- **Authoritative & Trustworthy:** Anchored by deep forest greens and clinical neutral surfaces, the interface projects environmental stewardship combined with municipal reliability.
- **Surgical Precision:** Every component, datum, and status metric is rendered with strict geometric alignment, zero decorative clutter, and absolute typographic legibility across harsh sunlight and field operations.
- **Role-Aware Hierarchy:** Information density shifts seamlessly across three primary operational postures:
  1. *Public:* Welcoming, friction-free reporting with clear feedback and effortless location capture.
  2. *Worker:* High-contrast, tactile, quick-scanning task lists and turn-by-turn route adherence under rapid operational pressure.
  3. *Supervisor:* Dense, analytical command layers balancing live GIS telemetry, exception monitoring, and resource allocation.

### Design Movement
**Executive Functionalism:** A synthesis of Swiss modernist layout grids, subtle corporate minimalism, and tactile data visualization. Visual weight is articulated through measured tonal layering, fine hairline borders, and targeted chromatic punctuation rather than loud gradients or heavy ornamentation.

## Colors

The palette establishes an unmistakable environmental footprint anchored by vibrant evergreen hues, balanced against pristine utility surfaces engineered for maximum contrast on mapping displays and dashboard grids in a dark operational environment.

### Core Architecture
- **Primary (`#1C884F` - Vibrant Forest):** The structural core. Used for brand navigation landmarks, primary action anchors, active telemetry indicators, and structural headers.
- **Secondary (`#5B7F64` - Muted Sage):** Actionable interactive states, successful completions, and key data visualizations.
- **Tertiary (`#B04C57` - Accent Crimson):** Soft interactive states, active container backdrops, badge fills, and highlighted telemetry routes or specialized alerts.
- **Neutral Surface & Canvas:**
  - *App Canvas Background:* `#047D45` — Deep dark civic canvas that prevents eye fatigue over prolonged operational shifts.
  - *Cards & Surface Containers:* `#1C884F` — Dark tinted surfaces creating crisp separation against the dark canvas.
  - *Hairline Borders:* `#5B7F64` — Strict 1px structural delimitation preserving layout integrity without visual noise.

### Text Contrast Hierarchy
- **Primary Text (`#EAF5EE`):** Light pine-tinted white delivering AA/AAA compliant legibility on all dark containers.
- **Secondary / Muted Text (`#737972`):** Slate-moss neutral for ancillary metadata, timestamps, units of measure, and inactive icons.

### Semantic Telemetry Palette
- **Success (`#198754`):** Verified route completion, cleared hazard, closed ticket.
- **Warning (`#E5A000`):** Approaching container capacity, delayed route dispatch, schedule deviation.
- **Critical (`#DC5555`):** Spills, urgent citizen escalations, bin overflow, vehicle breakdown.
- **Info (`#3984D6`):** Vehicle status updates, sensor heartbeats, GIS boundary overlays.

## Typography

The typographic hierarchy balances the poised, architectural geometry of **Manrope** for analytical headings and KPI metrics with the utilitarian neutrality of **Inter** for transactional records, data tables, map callouts, and field forms.

### Hierarchy & Application
- **Executive Display (`headline-xl`, `headline-lg`):** Reserved for fleet summary views, global KPI dashboards, and major modal dialogs. Set tight with negative tracking to convey density and command.
- **Section & Component Headers (`headline-md`, `headline-sm`):** Used inside map overlay cards, dispatch queues, and inspection records.
- **Narrative & Records (`body-lg`, `body-md`, `body-sm`):** Applied across incident reports, worker instructions, citizen descriptions, and GIS coordinate feeds.
- **Data Labels & Badges (`label-lg`, `label-md`, `label-sm`):** Rendered with a slight positive letter-spacing (`0.01em` - `0.03em`) and medium/semibold weight for status pills, telemetry badges, form labels, and table column heads.

## Layout & Spacing

The layout is constructed on an adaptable 8pt/4pt mathematical scale engineered for multi-role workflows: supervisor multi-column operation desks, in-cab tablet cradles, and field smartphone layouts.

### Structural Breakpoints & Grid Rules
- **Desktop & Command Workstations (1280px+):** 12-column dynamic grid, `margin-lg` (2.5rem) and `gutter-lg` (2rem). Supports multi-pane layouts: full-bleed vector map viewport pinned left (60-70% width) with real-time dispatch queue and incident panels docked right.
- **Tablet & In-Cab Mounts (768px - 1279px):** 8-column layout, `margin-md` (1.5rem) and `gutter-md` (1.5rem). The map canvas defaults to full-screen with slide-over drawers or bottom sheet controls sized for single-finger interaction.
- **Mobile Handheld (320px - 767px):** 4-column layout, `margin` (1rem) and `gutter` (1rem). Prioritizes one primary action per viewport (e.g., bin verification, camera capture, or turn routing).

### Internal Rhythm & Padding
- **Micro Spacing (`space-xs`, `space-sm`):** For input icon padding, chip metadata gaps, badge insets, and compact status row alignments.
- **Element Spacing (`space-md`, `space-lg`):** Standard interior padding for cards, modals, form groupings, and inspector panels.
- **Macro Spacing (`space-xl`, `space-2xl`):** Primary section separations, dashboard segment breaks, and landing hero structures.

## Elevation & Depth

To preserve extreme clarity and map readability in a dark environment, elevation relies on clean, low-opacity ambient shadows paired with crisp structural hairline borders (`1px solid #5B7F64`). This prevents heavy drop-shadows from occluding map tiles, topography, and geo-pins.

### Tonal Elevation Stack
- **Level 0 (Flat / Canvas):** Applied to the base canvas (`#047D45`) and background map tiles. Zero elevation, no border.
- **Level 1 (Card / Grid Tile):** Dark tinted container (`#1C884F`), `1px solid #5B7F64`, subtle shadow: `0 1px 3px rgba(0, 0, 0, 0.3)`. Used for list items, dashboard data cards, and static panels.
- **Level 2 (Active Map Overlays & Floating Panels):** Floating navigation tools, pinned route controls, and collapsible side inspectors. Border `1px solid #5B7F64`, shadow: `0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)`.
- **Level 3 (Modals, Overlays & Menus):** Dispatch overrides, vehicle assignment sheets, and context dropdowns. Border `1px solid rgba(91, 127, 100, 0.9)`, shadow: `0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 6px 14px -2px rgba(0, 0, 0, 0.3)`.

Shadow tints incorporate deep black and dark green tones, producing natural organic depth consistent with the dark forest aesthetic.

## Shapes

The geometric visual identity specifies **Level 2 Roundedness** (0.5rem base radius). This produces balanced corners that soften clinical data density while retaining precise executive geometry.

### Radius Distribution
- **Base Components (`0.5rem` / `8px`):** Buttons, standard form inputs, textareas, list group items, map control buttons, and table row groupings.
- **Containers & Surfaces (`rounded-lg` - `1rem` / `16px`):** Analytical dashboard cards, floating map bottom sheets, inspection modal windows, and dispatch queues.
- **Structural Dialogs & Sheets (`rounded-xl` - `1.5rem` / `24px`):** Primary command modals, mobile bottom sheet handle containers, and hero cards.
- **Badges & Interactive Markers (`rounded-full`):** Filter pills, status chips, route pin avatars, and map icon clusters.

## Components

### Buttons
- **Primary:** Vibrant forest background (`#1C884F`), crisp white text (`#EAF5EE`), `rounded` (8px), height `40px` (desktop) / `48px` (worker mobile). Hover state lightens slightly with subtle lift. Active state retains `#1C884F` with inner ring.
- **Secondary:** Surface dark (`#1C884F`) with `1px solid #5B7F64`, text `#EAF5EE`. On hover, subtle tint to `#5B7F64` with border shifting to secondary highlight.
- **Ghost / Map Control:** Dark surface container (`#1C884F`), `shadow-sm`, border `1px solid #5B7F64`, icon `#EAF5EE`. Height `36px` to `40px`.
- **Critical / Danger:** Semantic critical (`#DC5555`) background, white text, for immediate vehicle shutdown or route cancellation.

### Chips & Badges
- **Status Pills:** Pill-shaped (`rounded-full`), `space-xs` vertical padding, `space-sm` horizontal padding. Font: `label-sm`.
  - *Normal / Pending:* Background `#5B7F64`, text `#EAF5EE`.
  - *Active Routing:* Background `#5B7F64`, border `1px solid #1C884F`, text `#EAF5EE`.
  - *Overdue / Hazard:* Background `#3A1C1C`, text `#DC5555`.
  - *Warning / Cap Near:* Background `#3A331C`, text `#E5A000`.
- **Filter Chips:** Dark background (`#1C884F`), `1px solid #5B7F64`, text `#737972`. Selected state toggles to background `#1C884F` with text `#EAF5EE`.

### Form Inputs & Selectors
- **Input Fields:** Dark surface (`#1C884F`), `1px solid #5B7F64`, `rounded` (8px), height `40px` (desktop) / `48px` (mobile). Text `#EAF5EE`, placeholder `#737972`.
- **Focus State:** 2px ring in `#5B7F64` with zero offset blur.
- **Error State:** Border shifts to `#DC5555`, helper text in `#DC5555` with `label-sm`.
- **Location Picker Field:** Includes integrated GPS icon leading pin (`#5B7F64`) and clear visual feedback badge when locked.

### Lists & Dispatch Queues
- **List Container:** Borderless or enclosed within `#1C884F` container with `1px solid #5B7F64` divider lines between rows.
- **Queue Item:** Internal padding `space-md`. Hover state applies `#5B7F64`. Selected route or bin item features a `3px` solid `#5B7F64` left accent border.
- **Worker Checklist Items:** Large tap target (min 56px height) with full-row tap zone and tactile haptic-ready check animations.

### Checkboxes & Radios
- **Checkbox:** `18px x 18px`, `rounded` (4px), border `1.5px solid #5B7F64`. Checked state: background `#1C884F`, border `#1C884F`, with sharp white checkmark.
- **Radio:** `18px x 18px`, circular, border `1.5px solid #5B7F64`. Selected state: border `#5B7F64` with centered `#5B7F64` inner dot.

### Cards & Analytical Panels
- **Standard Card:** Background `#1C884F`, border `1px solid #5B7F64`, radius `1rem` (16px), elevation `Level 1`. Inner content separated by subtle `#5B7F64` dividers.
- **KPI / Stat Card:** Header with `label-md` uppercase text in `#737972`, prominent metric in `headline-lg` (`#EAF5EE`), and trailing variance badge (`#5B7F64` for improvement, `#DC5555` for backlog growth).

### Specialized Domain Components
- **Map Telemetry Pin:** Dual-ring marker: outer translucent ring in `#5B7F64` (pulsing when active), inner solid core in `#1C884F` or `#DC5555` for high-priority incidents.
- **Capacity Progress Gauge:** Linear meter with track `#5B7F64` and dynamic fill transitioning from `#5B7F64` (0-79%) to `#E5A000` (80-89%) to `#DC5555` (90%+).
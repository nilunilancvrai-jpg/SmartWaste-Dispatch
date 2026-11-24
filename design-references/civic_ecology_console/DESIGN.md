---
name: Civic Ecology Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
  metric-readout:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an elevated operational environment tailored for municipal telemetry, automated fleet routing, and resource recovery logistics. The aesthetic pairs a pristine, analytical light-mode canvas with rich jewel emerald accents, evoking environmental stewardship executed with institutional precision.

### Personality & Values
- **Operational Precision:** High-density, high-legibility layout structures that prioritize real-time telemetry, routing clarity, and mission-critical metrics over decorative overhead.
- **Ecological Stewardship:** Deep, vibrant emerald green reinforces civic responsibility, environmental recovery, and clean technology.
- **Architectural Calm:** Pure porcelain and off-white backdrops eliminate visual noise during long shifts, giving dispatchers an uncluttered visual field that minimizes cognitive fatigue.

### Visual Style
The interface follows a structured Modern Corporate & Analytical Utility paradigm. It relies on crisp border discipline, subtle tonal stratification, and clean geometric type to achieve depth and readability without heavy dropped shadows or simulated physical textures.

## Colors

The palette is engineered around high-contrast tabular legibility against cool, sanitizing light surfaces.

### Primary & Brand Accents
- **Primary (`#059669`):** Jewel Emerald serves as the primary operational anchor, used for primary action states, confirmed dispatch markers, active vehicle statuses, and positive environmental yield indicators.
- **Primary Bright (`#10B981`):** Applied selectively to real-time status pulses, hover highlights on actionable emerald elements, and telemetry gauges.

### Neutrals & Structural Framework
- **Canvas Base (`#F8FAF9`):** Porcelain off-white with a minute cool green cast, serving as the master viewport canvas to eliminate glare.
- **Surface Elevation (`#FFFFFF`):** Pure white container surfaces for cards, telemetry panels, and data tables.
- **Slate Primary (`#0F172A`):** Deepest slate for headlines, high-priority metric readouts, and high-impact UI triggers.
- **Slate Body (`#334155`):** Muted slate for standard UI text, secondary labels, and column headers.
- **Border Slate (`#E2E8F0`):** Subtle structural divider color used across grid lines, container perimeters, and input boundaries.

### Semantic Alerts
- **Warning Amber (`#F59E0B`):** Bin capacity warnings (>85%), route congestion, or minor telemetry timeouts.
- **Alert Crimson (`#EF4444`):** Hazardous waste flags, vehicle breakdown, route breach, or collection emergency.

## Typography

The typography architecture balances structural presence with dense telemetry clarity.

- **Headlines & Telemetry Metrics (Manrope):** Geometric yet open, Manrope delivers an architectural tone suited for route IDs, zone headers, and high-level KPI summaries. Figures must render with proportional or tabular numeric alignments when utilized in analytical panels.
- **Operational Data & Body Text (Inter):** Highly legible, neutral, and compact, Inter handles dense dispatch manifests, live status descriptions, vehicle payloads, and interactive form fields.
- **Tabular Numerics:** All live telemetry readouts, coordinates, bin capacities, and vehicle timestamps must enforce `font-feature-settings: "tnum" 1` to prevent jitter during streaming updates.

## Layout & Spacing

The layout is built upon an operational fluid-column grid system optimized for multi-pane dispatch screens, split map/list views, and high-density telemetry dashboards.

### Responsive Breakpoints & Grid Strategy
- **Desktop (>= 1280px):** 12-column layout with fixed 320px or 380px dispatch sidebars. 24px gutters (`gutter-desktop`) and 32px canvas margins (`margin-desktop`). Allows concurrent map telemetry and route list inspection.
- **Tablet (768px - 1279px):** 8-column layout with collapsible control panels. 16px gutters and 24px margins. Panels switch between docked side-sheets and stacked views.
- **Mobile (< 768px):** 4-column fluid layout with 16px margins. Bottom-sheet modals handle asset details and action workflows to keep map viewports accessible.

### Spacing Rhythm
- **Internal Component Packing (`space-xs`, `space-sm`):** Micro-spacing applied to button icons, status badges, chip groups, and compact metric pairs.
- **Structural Grouping (`space-md`, `space-lg`, `space-xl`):** Card interior padding, panel separation, and section groupings across data grids.

## Elevation & Depth

Visual hierarchy uses crisp geometric boundaries and disciplined planar layering rather than heavy shadows, sustaining an analytical, clean-room dashboard atmosphere.

### Depth Hierarchy
- **Level 0 (Canvas Base):** Ground `#F8FAF9`. Hosts spatial map canvases, background telemetry grids, and non-interactive surface regions.
- **Level 1 (Structural Cards & Data Tables):** Pure `#FFFFFF` resting on `#F8FAF9`, outlined with a 1px solid `#E2E8F0` border. Shadows are absent or minimized to a flat ambient ring (`0 1px 2px 0 rgba(15, 23, 42, 0.04)`).
- **Level 2 (Floating Controls & Popovers):** Active control clusters, floating route action chips, and map toolbars. Defined by `#FFFFFF` with `#E2E8F0` perimeter borders and a crisp, shallow shadow (`0 4px 12px -2px rgba(15, 23, 42, 0.08)`).
- **Level 3 (Modal Sheets & Alert Drawers):** Critical dispatch dialogues, emergency override sheets, and filter drawers. Accompanied by a 24% `#0F172A` neutral backdrop wash.

## Shapes

The design system incorporates a disciplined `roundedness: 2` (0.5rem base radius) convention. This delivers modern precision while avoiding both stark utilitarian sharpness and overly playful pill contours.

### Shape Application Guidelines
- **Containers, Cards, & Panels:** Standard `rounded` (0.5rem / 8px). Maintains consistent perimeter alignment across multi-column data views.
- **Dialogs & Large Modals:** `rounded-lg` (1rem / 16px) for softened containment without feeling bulbous.
- **Badges, Tags, & Status Pills:** `rounded` (0.375rem to 0.5rem) to ensure legible structural framing alongside tabular typography.
- **Interactive Buttons & Inputs:** Uniform 0.5rem radius, providing muscle-memory cohesion between entry fields and action triggers.

## Components

### Buttons
- **Primary:** Background `#059669`, text `#FFFFFF`, font `Inter` 500. Subtle hover elevation to `#047857`. Focus ring: 2px offset with `#10B981`.
- **Secondary / Tactical:** Background `#FFFFFF`, border 1px solid `#E2E8F0`, text `#0F172A`. Hover: background `#F8FAF9`, border `#CBD5E1`.
- **Destructive / Urgent:** Background `#EF4444`, text `#FFFFFF`. Hover: `#DC2626`.

### Cards & Telemetry Containers
- Built on `#FFFFFF` with 1px border in `#E2E8F0` and 0.5rem corner radius.
- Headers feature uppercase `label-sm` tracking with subtle `#64748B` label text paired directly with deep slate metric readouts.
- Divider rules between card segments use hair-thin 1px `#F1F5F9`.

### Status Badges & Chips
- **Nominal / Cleared:** Light emerald tint `#ECFDF5`, text `#065F46`, 1px border `#A7F3D0`.
- **Warning / Full Load:** Amber tint `#FFFBEB`, text `#92400E`, 1px border `#FDE68A`.
- **Critical / Interrupted:** Crimson tint `#FEF2F2`, text `#991B1B`, 1px border `#FECACA`.
- **Vehicle Type / Passive:** Cool gray `#F1F5F9`, text `#334155`, 1px border `#E2E8F0`.

### Data Tables & Dispatch Lists
- Alternate row backgrounds are avoided; separation is achieved purely through 1px `#F1F5F9` bottom borders.
- Header cells: `label-sm` in `#64748B`, uppercase, tracking +0.05em, height 40px.
- Interactive rows highlight with `#F8FAF9` on hover, with a 3px active indicator bar in `#059669` along the left border when selected.

### Input Fields & Controls
- Form inputs feature `#FFFFFF` fill, 1px `#E2E8F0` boundary, and 0.5rem radius.
- Height standards: Compact 36px for dense filter bars; 44px for primary modal forms.
- Checkboxes and radios use `#059669` fill when checked, styled with clean white iconography.

### Specialized Telemetry Displays
- **Capacity Progress Bars:** 6px track height with `#E2E8F0` track background. Fill transitions dynamically from `#059669` (<75%) to `#F59E0B` (75-89%) to `#EF4444` (90%+).
- **Fleet Map Waypoint Markers:** 28px circular markers with a white center ring, a solid `#0F172A` or `#059669` body, and a high-contrast direction arrow indicator.
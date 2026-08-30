---
name: Lumina Space Tracker
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#bc0b3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff7886'
  on-tertiary-container: '#780021'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
---

## Brand & Style

The design system is built for a community-driven public space occupancy tracker, emphasizing clarity, utility, and real-time reliability. The personality is civic-minded, helpful, and transparent.

The design style follows **Minimalism** with a focus on high-contrast accessibility for outdoor visibility. It utilizes a "light-first" approach to ensure readability under direct sunlight. Visual noise is eliminated to prioritize data—specifically the "pulse" of public spaces. The aesthetic is clean and modern, using generous whitespace and a systematic hierarchy to reduce cognitive load for users on the move.

## Colors

The palette is optimized for immediate status recognition and outdoor legibility. 

- **Primary (Emerald Green):** Indicates low occupancy and "available" states. Used as the primary action color.
- **Secondary (Amber):** Indicates moderate occupancy or "filling up" states.
- **Tertiary (Coral Red):** Indicates high occupancy or "at capacity" states.
- **Neutral:** A range of soft grays (Slate/Gray) for secondary text, borders, and structural elements.
- **Backgrounds:** Pure white (#FFFFFF) for primary surfaces and very light gray (#F9FAFB) for secondary containers to maintain high contrast.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, modern character. 

The type scale is generous to accommodate outdoor usage. High-priority information, such as occupancy percentages or "Status: Full," should use `headline-lg` or `display` roles. Secondary metadata uses `body-md`. All interactive labels must be at least 14px (`label-lg`) to ensure readability. For mobile devices, `headline-lg` should downscale to `headline-lg-mobile` to prevent awkward line breaks in space names.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for mobile devices. 

- **Grid:** A 4-column layout for mobile, moving to an 8-column layout for tablets.
- **Touch Targets:** All interactive elements maintain a minimum hit area of 48x48px.
- **Rhythm:** An 8px linear scale is used for all spatial relationships. 
- **Margins:** A standard 20px side margin ensures content does not feel cramped against device edges.
- **Padding:** Use `md` (16px) for internal card padding and `lg` (24px) for section vertical spacing to maintain the minimalist, airy feel.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. 

The background is flat, while interactive cards and surface containers use a subtle, highly-diffused shadow (Blur: 12px, Opacity: 4%, Color: #000000) to appear slightly lifted. This creates a clear distinction between the "ground" and "interactive" layers without the heaviness of traditional shadows. 

Avoid heavy borders; instead, use a 1px solid border in a very light neutral tint (#E5E7EB) to define boundaries on white backgrounds.

## Shapes

The shape language is **Rounded** (Role 2), striking a balance between professional utility and community friendliness.

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Large cards and informational modules use a 1rem (16px) radius to create a soft, approachable framing for data.
- **Status Indicators:** Occupancy pips or live-status indicators may use a full pill shape for distinct visual identification.

## Components

- **Buttons:** Primary buttons use the Emerald Green background with white text. They should be full-width on mobile for easy thumb access. Secondary buttons use a light gray ghost style with a subtle border.
- **Occupancy Cards:** The centerpiece of the UI. Must feature a large status indicator (color-coded circle or bar) and the name of the space in `headline-md`.
- **Status Chips:** Small, pill-shaped tags used to show "Quiet," "Busy," or "Opening Soon." These use a semi-transparent version of the status color with high-contrast text.
- **Input Fields:** Minimalist design with a 1px border. Focus states are indicated by a 2px Emerald Green stroke.
- **Lists:** Clean rows with 16px vertical padding, separated by hair-line dividers (#F3F4F6).
- **Interactive Map Pins:** High-contrast circles with a white border to ensure they pop against map textures. The color of the pin must match the current occupancy status.
---
name: SmartyPark
colors:
  surface: '#f4fbf4'
  surface-dim: '#d4dcd5'
  surface-bright: '#f4fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6ee'
  surface-container: '#e8f0e9'
  surface-container-high: '#e3eae3'
  surface-container-highest: '#dde4dd'
  on-surface: '#161d19'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2b322d'
  inverse-on-surface: '#ebf3eb'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f4fbf4'
  on-background: '#161d19'
  surface-variant: '#dde4dd'
  success: '#10b981'
  warning: '#f59e0b'
  danger: '#ef4444'
  slate-50: '#f8fafc'
  slate-100: '#f1f5f9'
  slate-200: '#e2e8f0'
  slate-800: '#1e293b'
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
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
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
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter: 16px
---

## Brand & Style
The design system for this product is centered on the intersection of urban technology and ecological stewardship. The brand personality is **reliable, community-driven, and intuitive**, functioning as a vital "civic pulse" for modern smart cities.

The chosen style is **Modern Minimalist with an Ecological core**. It prioritizes a "light-first" approach to ensure maximum legibility for citizens using the app in varied outdoor lighting conditions. By utilizing generous white space and a systematic hierarchy, the design eliminates visual noise, allowing users to quickly assess space affluence and smart city data. The aesthetic is clean and professional, using high-contrast elements to convey reliability and transparency.

## Colors
The palette is engineered for immediate cognitive processing through a semantic color strategy. 

The **Primary "Smart Green"** serves as the signature brand color and denotes "Available" or "Optimal" states, reinforcing the ecological theme. The **Deep Slate Neutrals** provide a sophisticated, grounded foundation for typography and structural elements, ensuring a professional "Smart City" feel.

High-contrast status colors are reserved for critical information: **Warning Amber** for moderate affluence and **Danger Red** for capacity limits. Surfaces should primarily utilize pure whites and the `slate-50` tier to maintain a fresh, airy atmosphere that feels modern and unencumbered.

## Typography
The design system exclusively utilizes **Inter** to leverage its exceptional legibility and neutral, functional character. 

To accommodate users on the move, the type scale is prioritized for quick scanning. Real-time metrics and occupancy percentages should be rendered in `headline-lg` or `display` to ensure they are the first elements perceived. For data-heavy lists, `body-md` provides a compact yet readable density. All interactive labels must utilize `label-lg` to meet accessibility standards for mobile touch-points. On smaller devices, use `headline-lg-mobile` for park titles to maintain optimal line-wrapping.

## Layout & Spacing
This design system employs a **fluid grid** model tailored for mobile-first smart city interactions. 

The rhythm is governed by an 8px linear scale. On mobile, a 4-column grid is used with a 20px side margin to prevent content from crowding the screen edges. As the viewport scales to tablet (768px+), the layout expands to an 8-column grid. 

Interactive elements must maintain a minimum 48x48px hit area. Vertical rhythm is driven by the `lg` (24px) unit between major sections, while `md` (16px) is the standard for internal component padding to maintain a spacious, breathable feel.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** supplemented by **Ambient Shadows**. This approach creates a clear hierarchy without adding visual weight.

The base background is flat. Interactive cards and "floating" elements utilize a soft, highly-diffused shadow (12px blur, 4% opacity, using a slate-tinted shadow color) to indicate lift. This subtle elevation signals interactivity while keeping the UI grounded in its minimalist roots. Surface boundaries on white backgrounds should be defined by 1px solid borders in `slate-100` or `slate-200` rather than heavy shadows to maintain a crisp, architectural look.

## Shapes
The shape language is consistently **Rounded**, using an 8px (0.5rem) base corner radius. This choice bridges the gap between the precision of "smart" technology and the approachability of community-focused design.

Standard components like buttons, input fields, and small cards use the 8px radius. Larger informational containers and map overlays should utilize `rounded-lg` (16px) to create a softer, more inviting frame for complex data. Status pips and real-time "live" indicators should use full pill-shaped rounding to distinguish them as dynamic, changing elements.

## Components
- **Buttons:** Primary actions use a solid Smart Green background with white text. On mobile, these should be full-width to accommodate thumb-reach zones. Secondary actions use the Ghost style: a `slate-200` border with `slate-800` text.
- **Affluence Cards:** The primary data container. These must feature a prominent status pip (Green/Amber/Red) and use `headline-md` for the location name.
- **Status Chips:** Small, pill-shaped tags used for "Quiet" or "Busy" labels. Use a 15% opacity background of the status color with a 100% opacity text color for high legibility.
- **Input Fields:** Minimalist containers with a 1px `slate-200` border. On focus, the border transitions to 2px Smart Green with a subtle glow.
- **Smart City Indicators:** Custom icons for air quality, noise levels, or weather, paired with `label-sm` metadata. These should be grouped in a horizontal scroller or a tight grid within the main cards.
- **Interactive Map Pins:** High-contrast circular markers with a white 2px stroke to ensure visibility against varied map textures.
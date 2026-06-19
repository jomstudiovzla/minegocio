---
name: Admin Engine v2
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#444652'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#757683'
  outline-variant: '#c5c5d4'
  surface-tint: '#3f58b0'
  primary: '#001b62'
  on-primary: '#ffffff'
  primary-container: '#103088'
  on-primary-container: '#859dfa'
  inverse-primary: '#b6c4ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fcbc11'
  on-secondary-container: '#6b4d00'
  tertiary: '#1d2429'
  on-tertiary: '#ffffff'
  tertiary-container: '#32393e'
  on-tertiary-container: '#9ba2a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#244097'
  secondary-fixed: '#ffdea2'
  secondary-fixed-dim: '#fcbc11'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5c4200'
  tertiary-fixed: '#dce3ea'
  tertiary-fixed-dim: '#c0c7ce'
  on-tertiary-fixed: '#151c21'
  on-tertiary-fixed-variant: '#41484d'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
  surface-ice: '#f9f9ff'
  glass-border: rgba(226, 232, 240, 0.8)
  success-green: '#16a34a'
  error-red: '#ba1a1a'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.03em
  code-sm:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
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
  xl: 40px
  xxl: 64px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style
The brand personality is authoritative yet approachable, blending **Corporate Modern** reliability with **Glassmorphism** accents to signify a high-tech, data-driven environment. It targets senior logistics managers and administrative staff who require high-density information without visual fatigue. The UI evokes a sense of "command and control" through deep navy tones and crisp white surfaces, softened by subtle background blurs and generous spacing that prevents the interface from feeling cramped or purely utilitarian.

## Colors
The palette is anchored by a deep **Navy Primary** (#103088) used for structural branding and critical calls to action. A **Vibrant Amber Secondary** (#f8b808) provides high-contrast accents for status indicators and promotional actions. The background utilizes a cool "Ice" blue-white (#f9f9ff) to reduce glare, while container layers use varying saturations of blue-tinted grays to establish hierarchy. Functional colors (Green for growth, Red for critical alerts) are used with semi-transparent background containers to signify status without overwhelming the user.

## Typography
The system uses **Plus Jakarta Sans** exclusively to maintain a modern, friendly, and highly legible geometric look. 
- **Headlines:** Use tighter letter-spacing and heavier weights (700-800) to create a strong visual anchor.
- **Body Text:** Standardized at 16px with a 1.5 line height for comfortable reading of tabular data and descriptions.
- **Data Labels:** Utilize a slightly heavier weight (600) at 14px to distinguish field headers from field values.
- **Mono Space:** Reserved for SKUs and ID strings to ensure character distinction (e.g., distinguishing '0' from 'O').

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The primary sidebar navigation is fixed at 256px (64 units), while the main content canvas flows to a maximum width of 1280px with centered alignment. 
- **Grid:** A standard 12-column grid is implied for the main content, but frequently expressed through a **Bento Grid** style for dashboard widgets.
- **Rhythm:** An 8px base unit drives all spacing. Gutters are consistently 24px (lg) to provide breathing room between complex data modules.
- **Adaptive Rules:** On mobile, the sidebar collapses into a bottom navigation bar, and horizontal padding reduces from 24px to 16px.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layering** rather than heavy shadows.
- **Level 0 (Background):** Solid `#f9f9ff` surface.
- **Level 1 (Cards):** Semi-transparent white (`rgba(255,255,255,0.8)`) with a 12px backdrop blur and a soft `#e2e8f0` border.
- **Level 2 (Interactive/Sticky):** Items like the Top App Bar use a subtle `shadow-sm` and remain fixed to the viewport.
- **Interactive States:** Hovering over cards or table rows triggers a slight horizontal translation or a depth increase via `shadow-md`, providing immediate tactile feedback.

## Shapes
The shape language is **Rounded**, favoring 0.5rem (8px) as the default for most interactive elements. 
- **Standard Cards & Input Fields:** 12px (xl) roundedness to create a soft, modern container feel.
- **Primary Action Buttons:** 12px (xl) or fully rounded (pill) for high-emphasis buttons.
- **Image Containers:** 8px (lg) roundedness to maintain alignment with card borders.
- **Selection Indicators:** Small 4px (sm) radius for badges and progress bar fills.

## Components
- **Buttons:** Primary buttons use a solid Navy background with white text and a 12px corner radius. Secondary buttons (e.g., "Add Product") use the Amber Secondary container with high-contrast text.
- **Inputs:** Fields use a 1px border (`#c5c5d4`) that transitions to the Primary Navy on focus, accompanied by a soft blue outer ring (focus-ring).
- **Data Tables:** Feature light-blue headers (`#f0f3ff`) and row hover states (`#e7eeff`). Inline progress bars are used for stock levels to provide immediate visual data parsing.
- **Chips/Badges:** Use high-contrast foregrounds on light-tinted backgrounds (e.g., Green text on light green background) for status visibility.
- **Sidebar:** Navigation items use a clear "Active" state with a background fill (`#103088`) and text color shift.
- **Glass Cards:** Used for dashboard stats, combining a blurred background with a subtle border and 24px internal padding.
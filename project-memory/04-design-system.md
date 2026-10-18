# World-Class Design System & Spatial Engineering Manifesto

> Single source of truth for semantic design tokens, optical typography scales, spatial geometry laws, and micro-interaction choreographies.
> Enforced across all frontend implementations to guarantee Apple / Linear / Vercel-tier aesthetic taste and pristine user experience.

---

## 1. Perceptual Surface Science & Luminance Stepping

Dark-mode surfaces avoid saturated hues. Elevation is rendered through **achromatic luminance stepping** paired with **hairline specular highlights** (`inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`), not heavy drop shadows.

```css
@layer tokens, base, primitives, utilities;

@layer tokens {
  :root {
    /* Color Scheme & Canvas */
    color-scheme: dark light;

    /* Surfaces (Stepped Elevation) */
    --surface-base: #09090B;        /* Page background canvas */
    --surface-subtle: #121215;      /* Inset sections, sidebars */
    --surface-card: #18181B;        /* Default card / container surface */
    --surface-overlay: #222226;     /* Dropdowns, tooltips, dialogs */
    --surface-hover: #27272A;       /* Interactive hover state */
    --surface-active: #2E2E33;      /* Interactive pressed state */

    /* Text Hierarchy (Luminance Calibrated & WCAG 2.1 AA Compliant) */
    --text-primary: #FAFAFA;        /* High-contrast headings and body copy */
    --text-secondary: #A1A1AA;      /* Secondary descriptions, metadata */
    --text-muted: #8E8E99;          /* Calibrated: 4.65:1 on card, 5.62:1 on base */
    --text-inverse: #09090B;        /* Text on light accent buttons */

    /* Semantic Borders & Specular Hairlines */
    --border-hairline: rgba(255, 255, 255, 0.08); /* 1px structural borders */
    --border-subtle: rgba(255, 255, 255, 0.12);   /* Card boundaries */
    --border-focus: #FAFAFA;                       /* Keyboard focus-visible ring */
    --border-specular: inset 0 1px 0 0 rgba(255, 255, 255, 0.09); /* Top-edge light catch */

    /* Semantic Feedback (Low-Chroma Dark Calibration) */
    --color-success: #10B981;
    --color-warning: #F59E0B;
    --color-error: #F43F5E;
    --color-info: #0EA5E9;
    --color-accent: #FAFAFA;
  }

  /* Light Theme Variant Tokens */
  [data-theme="light"] {
    --surface-base: #FFFFFF;
    --surface-subtle: #F4F4F5;
    --surface-card: #FFFFFF;
    --surface-overlay: #FAFAFA;
    --surface-hover: #F4F4F5;
    --surface-active: #E4E4E7;

    --text-primary: #09090B;
    --text-secondary: #52525B;
    --text-muted: #71717A;
    --text-inverse: #FAFAFA;

    --border-hairline: rgba(0, 0, 0, 0.08);
    --border-subtle: rgba(0, 0, 0, 0.12);
    --border-focus: #09090B;
    --border-specular: inset 0 1px 0 0 rgba(0, 0, 0, 0.05);

    --color-accent: #09090B;
  }
}
```

---

## 2. Typographic Precision & Optical Rhythm

Body text readability and display authority follow strict optical scaling:

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, monospace;

  /* Display & Headings (Fluid Optical Scaling) */
  --font-display-2xl: 700 clamp(2.25rem, 4vw + 1rem, 3rem)/1.1 var(--font-sans);  letter-spacing: -0.035em;
  --font-display-xl:  650 clamp(1.75rem, 3vw + 0.75rem, 2.25rem)/1.15 var(--font-sans); letter-spacing: -0.03em;
  --font-heading-lg:  600 24px/1.25 var(--font-sans); letter-spacing: -0.025em;
  --font-heading-md:  600 18px/1.35 var(--font-sans); letter-spacing: -0.015em;

  /* Body Copy: Optimized for sustained reading (measure capped at 65ch) */
  --font-body-lg:     400 16px/1.55 var(--font-sans); letter-spacing: -0.005em;
  --font-body-md:     400 14px/1.5  var(--font-sans); letter-spacing: 0;
  --font-body-sm:     400 12px/1.45 var(--font-sans); letter-spacing: 0.01em;

  /* Micro-labels & Badges: Positive tracking for legible small caps */
  --font-label-caps:  600 11px/1 var(--font-sans);    letter-spacing: 0.04em; text-transform: uppercase;
  --font-code:        400 13px/1.5 var(--font-mono);
}
```

### Typographic Invariants
1. **Numeric Discipline:** Any component displaying numbers, prices, timestamps, metric cards, or tabular rows MUST specify:
   ```css
   font-variant-numeric: tabular-nums lining-nums;
   ```
2. **Measure Constraint:** Paragraph copy containers must never exceed `65ch` to preserve optical reading flow:
   ```css
   max-width: 65ch;
   ```

---

## 3. Spatial Geometry & The Concentric Radius Law

To avoid visual tension caused by mismatched curves, nested corners must follow the **Concentric Radius Law**:

$$\mathbf{R_{\text{outer}} = R_{\text{inner}} + P_{\text{gap}}}$$

*Example: If a child button has `border-radius: 6px` inside a container with `padding: 8px`, the outer container MUST have `border-radius: 14px`.*

```css
:root {
  /* Concentric Radius Scale */
  --radius-xs: 4px;   /* Micro-badges, tags */
  --radius-sm: 6px;   /* Buttons, inputs, chips */
  --radius-md: 10px;  /* Cards with 4px internal elements */
  --radius-lg: 14px;  /* Modals, outer containers with 8px internal padding */
  --radius-xl: 20px;  /* Large dialogs */
  --radius-full: 9999px; /* Avatars, pills */

  /* 4px Base Spacing Grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 4. Multi-Layered Depth & Hairline Shadows

Avoid muddy, single-layer shadows. Elevation combines an ambient occlusion shadow with a crisp boundary ring:

```css
:root {
  /* Layered Shadows */
  --shadow-card:
    0 0 0 1px var(--border-hairline),
    0 1px 2px rgba(0, 0, 0, 0.16);

  --shadow-overlay:
    0 0 0 1px var(--border-subtle),
    0 4px 8px -2px rgba(0, 0, 0, 0.24),
    0 12px 24px -4px rgba(0, 0, 0, 0.32);

  --shadow-modal:
    0 0 0 1px var(--border-subtle),
    0 12px 32px -8px rgba(0, 0, 0, 0.48),
    0 24px 64px -16px rgba(0, 0, 0, 0.64);
}
```

---

## 5. Micro-Interactions, Spring Physics & Motion Laws

1. **Banned Property Transitions:** NEVER use `transition: all` or `linear` easing. It causes sluggish rendering and animates layout properties.
2. **Allowed Animated Properties:** Only animate `transform`, `opacity`, `background-color`, `border-color`, and `box-shadow`.
3. **Spring Timing & Easing Curves:**
   ```css
   /* Snappy feedback (hover, press, toggle) */
   --ease-snappy: cubic-bezier(0.16, 1, 0.3, 1); /* Out-expo */
   --duration-snappy: 160ms;

   /* Enter & Exit (modals, drawers, tooltips) */
   --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
   --duration-enter: 200ms;
   --duration-exit: 120ms;
   ```
4. **Touch & Click Target Geometry:**
   - Desktop interactive elements: minimum `32px` height/width.
   - Mobile interactive elements: minimum `44px` height/width.
   - Keyboard Focus Ring:
     ```css
     :focus-visible {
       outline: 2px solid var(--border-focus);
       outline-offset: 2px;
     }
     ```
5. **Zero Cumulative Layout Shift (CLS = 0) Skeletons:**
   - Loading states MUST render shimmer skeletons whose width, height, and border-radius precisely match the final loaded component.
   - Blank screens and centered generic spinners are strictly prohibited.

---

## 6. Accessibility & Reduced Motion Invariants (WCAG 2.3.3)

Users who enable reduced motion must receive instant transitions without disorienting layout movements or animation nausea:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-snappy: 0.01ms !important;
    --duration-enter: 0.01ms !important;
    --duration-exit: 0.01ms !important;
  }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .skeleton-shimmer {
    animation: none !important;
    background: var(--surface-card) !important;
  }
}
```

---

*Last updated: 2026-10-17. Enforced by: scope-enforcer.js, docs/design/design-tokens.css, and 10-frontend-engineer.*

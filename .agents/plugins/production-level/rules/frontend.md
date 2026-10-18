# Frontend Development Rules

## Component Architecture
- Server Components by default (Next.js App Router) — `use client` only for interactivity
- One component per file — no multi-component files
- Props: explicit TypeScript interface, never inline type
- Co-locate tests: `Button.tsx` → `Button.test.tsx` in same directory
- Co-locate styles: `Button.tsx` → `Button.module.css` or Tailwind classes

## Design System Compliance
- ALL styling via design tokens — NEVER hardcode hex, RGB, HSL, pixel values
- Check Storybook catalog before creating a new component
- Every component has a Storybook story with all variants
- Mobile-first: implement for smallest breakpoint first, enhance up
- Responsive behavior tested at all defined breakpoints

## Accessibility (WCAG 2.1 AA — MANDATORY)
- Every interactive element is keyboard accessible (Tab, Enter, Escape, arrows)
- Every image has meaningful alt text (or `alt=""` if decorative)
- Form inputs have associated labels — never placeholder-as-label
- Color contrast meets WCAG AA minimum (4.5:1 normal text, 3:1 large text)
- Focus visible on all interactive elements
- ARIA labels where semantic HTML is insufficient

## State Coverage
Every data-dependent component MUST implement:
- **Loading state** — shown while data is being fetched
- **Empty state** — shown when data is loaded but empty
- **Error state** — shown when data fetch fails (with retry action)
- **Success state** — the normal rendered component
- **Edge cases:** long text truncation, missing optional fields, zero values

## Performance
- No unnecessary re-renders — use `useMemo`/`useCallback` when appropriate
- Images: use Next.js `Image` component with proper sizing
- Code splitting: `dynamic(() => import(...))` for heavy components
- No blocking JavaScript in the critical rendering path

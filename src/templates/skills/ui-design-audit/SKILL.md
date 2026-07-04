---
name: ui-design-audit
description: Quality assurance playbook for auditing user interfaces for accessibility (WCAG), layout defects, responsive scaling, and over-engineering.
---

# UI Design Audit & QA Playbook

## 1. Accessibility (WCAG 2.1 AA Compliance)
- **Contrast Check**: Verify hex color values for text and interactive indicators against backgrounds. Normal text must satisfy $\ge 4.5:1$ contrast ratio, and large text must satisfy $\ge 3:1$.
- **Focus Rings**: Verify that all interactive elements have visible `:focus` or `:focus-visible` outline rings to support keyboard-only navigation.
- **Semantic Structure**: Ensure proper HTML heading hierarchy (never skip heading levels like `h1` directly to `h3`). Ensure proper ARIA roles and labels on dynamic components (modals, dropdowns).

## 2. Layout & Responsiveness
- **Breakpoint Overflows**: Check for hardcoded pixel widths (`width: 500px`) that cause horizontal scrolling on smaller viewports. Ensure flexible percentage or viewport-based units (`w-full`, `max-w-*`) are used.
- **Alignment Integrity**: Check that grids, flexboxes, and columns do not overlap or misalign at intermediate screen widths.
- **Empty States**: Ensure any dynamic layout accounts for loading or empty states with clean indicators.

## 3. Performance & Asset Optimization
- **Static Assets**: Verify that images are loaded in modern formats (e.g. `.webp` instead of high-resolution `.png` / `.jpg`) and contain explicit width/height parameters to avoid cumulative layout shifts (CLS).
- **Fonts**: Ensure external web fonts are preloaded or styled with a proper fallback font stack (e.g., `font-family: 'Inter', sans-serif;`) to prevent layout flickering.

## 4. Visual Over-Engineering Check
- Ensure that the CSS is clean and organized, avoiding excessive layers of unneeded nested rules, duplicate styling declarations, or unused CSS utility classes.

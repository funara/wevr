---
name: ui-design-system
description: Playbook and guidelines for creating visually rich, innovative, and modern user interfaces (design system, spacing, typography, and micro-interactions).
---

# UI Design System & Guidelines

## 1. Typography & Hierarchy
- **Primary Font**: Use modern, clean typography (e.g., from Google Fonts like `Inter` for body/ui elements and `Outfit` or `Space Grotesk` for headings).
- **Scale**:
  - Headings (`h1`, `h2`): Semibold/Bold, tighter line-height (`1.2`), tracking tight.
  - Body: Regular, line-height `1.5` or `1.6`, tracking normal.
  - Labels/Buttons: Medium, uppercase or medium weight, tracking wide.

## 2. Spacing & Grid System
- **Spacing Scale**: Enforce a strict spacing scale based on multiples of 4px/8px (e.g., Tailwind's `p-2`, `p-4`, `p-6`, `p-8` scales). Never use random "magic numbers" for margins or padding.
- **Grids & Flexbox**: Always align elements using responsive flexbox or grid layouts. Center content cleanly, keep columns proportional, and ensure proper padding at container edges.

## 3. Visual Depth & Aesthetics
- **Elevations & Depth**: Use subtle border strokes (e.g. `rgba(255,255,255,0.08)` in dark mode) paired with soft shadows to define elevation.
- **Gradients**: Utilize smooth, harmonious color gradients for key accent elements, headers, and call-to-action buttons.
- **Glassmorphism**: When creating modern panels or modals, prefer semi-transparent backgrounds with background blur (e.g., `backdrop-filter: blur(12px)`).
- **Color Accents**: Avoid primary saturated primaries (e.g., plain `#ff0000`, `#0000ff`). Use tailored palettes (e.g. HSL tailored neon/pastel gradients, sleek slate/charcoal backgrounds).

## 4. Micro-Interactions & Transitions
- **Interactive States**: Every interactive element (buttons, cards, inputs) must have explicit `:hover`, `:focus-visible`, and `:active` styles.
- **Transitions**: Apply smooth transition effects (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) to avoid sudden visual snapping on hover or state change.

## 5. Mobile-First Responsiveness
- Start layouts mobile-first. Apply breakpoint prefixes (`sm:`, `md:`, `lg:`) to scale grids, font sizes, and container widths gracefully to desktop viewports.

## 6. Mockup & Prototype Delivery Protocol
When tasked with generating a visual layout, mockup, or interface prototype:
- **No ASCII Drawing**: Do not output textual ASCII grids or drawings.
- **Self-Contained File**: Generate a complete, valid HTML5 file.
- **Embedded CSS**: Include a `<style>` block containing fonts (Inter/Outfit), layout variables, component styles, states (:hover, :focus), and smooth transition curves.
- **Embedded JS**: Include a `<script>` block implementing DOM interactions (tab switching, theme toggles, modal open/close) so it works as a fully responsive, interactive live prototype.

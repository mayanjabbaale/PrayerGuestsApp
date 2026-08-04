# AGENT.md — UI Design Direction

## Project UI Style: **Bauhaus**

This project follows a **Bauhaus** design language for all user-facing interfaces. The Bauhaus movement (1919–1933) emphasizes geometric purity, primary color theory, functional minimalism, and the unification of art, craft, and technology. Every page, component, and visual asset in this project should reflect this aesthetic.

---

## 1. Core Design Principles

1. **Form follows function** — every element must serve a clear purpose. No decoration without utility.
2. **Geometric purity** — favor circles, squares, triangles, and rectangles. Avoid organic or overly ornate shapes.
3. **Honest materials** — flat color, no skeuomorphism, no realistic textures, no drop shadows used as ornament.
4. **Asymmetric balance** — compositions should be deliberately unbalanced yet visually stable, using a strong grid.
5. **Sans-serif typography** — use geometric sans-serifs (e.g., Futura, Bauhaus 93, Avenir, Helvetica, Inter as a web-safe fallback).
6. **Minimal ornamentation** — line, color, and shape do the talking.

---

## 2. Color Palette

Bauhaus design is anchored in **primary colors plus black and white**. Do not introduce secondary or tertiary hues as base colors.

| Token            | Hex       | Usage                                    |
|------------------|-----------|------------------------------------------|
| `--bauhaus-red`    | `#E63946` | Primary action, emphasis, alerts         |
| `--bauhaus-yellow` | `#F4C430` | Highlights, badges, secondary CTAs       |
| `--bauhaus-blue`   | `#1D4E89` | Links, info, primary brand accents       |
| `--bauhaus-black`  | `#1A1A1A` | Text, strong borders, structural shapes  |
| `--bauhaus-white`  | `#FAFAFA` | Background, negative space, text on dark |
| `--bauhaus-beige`  | `#E8DCC4` | Optional warm neutral for surfaces       |

**Rules:**
- Never use gradients between these colors.
- Color blocks should be **flat and unmodulated**.
- A single composition should typically feature **2–3 colors maximum**, not all six at once.

---

## 3. Typography

- **Headings:** Geometric sans-serif, often **uppercase**, tight letter-spacing, bold weight. Consider Futura, Bauhaus 93, or web-safe Inter/Helvetica.
- **Body:** Same family, regular weight, sentence case, comfortable line-height (1.5–1.7).
- **Hierarchy** is established by **size, weight, and color** — not by serif/sans-serif mixing.
- No italic, no script fonts, no decorative typefaces.
- Type may be set **inside or beside** colored geometric blocks as a compositional element.

---

## 4. Shapes & Geometry

- Use **circles, squares, triangles, and rectangles** as primary compositional elements.
- Shapes can function as:
  - Section dividers
  - Buttons and CTAs
  - Background panels
  - Iconography
- Iconography must be **flat, single-color, geometric** — no realism, no outlines-only line art, no 3D effects.

---

## 5. Layout & Grid

- Use a **strong underlying grid** (8px or 12-column). Whitespace is structural, not decorative.
- Compositions favor **asymmetric balance** — large blocks anchored by small accent shapes.
- Edges are crisp. Borders are thick (2–4px) and black when used.
- Avoid rounded corners beyond a modest 2–4px radius. Sharp 90° corners are preferred.

---

## 6. Components — Conventions

| Component      | Bauhaus Treatment                                                              |
|----------------|--------------------------------------------------------------------------------|
| Buttons        | Solid color block, uppercase text, no shadow, square or circular shape         |
| Cards          | Flat color or white surface, thick black border, no drop shadow                |
| Navbar         | Bold color band, geometric logo mark, uppercase links                          |
| Forms          | Underline-only inputs or thick-bordered boxes; minimal labels                  |
| Hero sections  | Large geometric composition: one dominant color block + one accent shape       |
| Images         | Cropped into or overlaid by geometric masks (circle, square, triangle)        |
| Tables / Lists | High contrast rows; thin black rules; no zebra shading unless color-blocked    |

---

## 7. Motion & Interaction

- Motion is **functional**, not decorative.
- Permitted: simple position, scale, or color transitions on hover/active (≤ 200ms).
- Forbidden: parallax, bouncy easing, scroll-jacking, decorative animations.

---

## 8. Accessibility

- Maintain **WCAG AA** contrast at minimum — verify the primary palette on white and on black.
- Never rely on color alone to convey meaning; pair color with shape or text.
- Hit targets ≥ 44×44px even when the visual shape is small.

---

## 9. What to Avoid

- Gradients, glows, glassmorphism, neumorphism.
- Skewed or "trendy" 3D shapes.
- Pastel or washed-out palettes.
- Serif, script, or display fonts.
- Drop shadows used as decoration (a single subtle elevation shadow for layered UI is acceptable only when strictly necessary).
- Stock photography that is not geometrically composed; if imagery is used, it should feel deliberate and stylized.

---

## 10. Reference Mood

Before making UI decisions, hold this mental reference:
> **Kandinsky's compositions · Joost Schmidt's posters · Herbert Bayer's universal typography · Marcel Breuer's furniture · Lyonel Feininger's prisms.**

When in doubt, simplify. The Bauhaus is a discipline of **reduction**, not addition.

---

## 11. Applying This Guide

This file governs:
- All Django templates under `home/templates/`, `theme/templates/`, and any other app.
- All CSS/SCSS in `static/` and `theme/static/`.
- Any future frontend framework integration.
- Marketing assets, documentation visuals, and email templates.

Any deviation from this guide requires a written justification committed alongside the change.

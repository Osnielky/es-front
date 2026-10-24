---
name: es-design
description: Use before building or changing any UI in this repo (pages, components, styles, admin screens) — loads the E&S Car Sales design system (tokens, type, component classes, page patterns, copy rules) so new work matches the site.
---

# E&S design system

1. Read `DESIGN.md` at the repo root in full before writing any JSX or CSS.
2. Use the tokens in `tailwind.config.ts` and the shared classes in `src/app/globals.css`. Do not introduce new hex colours, fonts, radii or shadows inline; add a token or class if one is genuinely missing.
3. Red (`accent-500`) is for the price and the single primary action. WhatsApp is always `btn-wa`. Navy bands open every page.
4. Start from the phone layout (390px) and widen. Check the shipping checklist at the end of `DESIGN.md` before saying the work is done.
5. When a change is visual, run the dev server and screenshot the page at 390px and 1280px (the `browse` skill does this) and look at the result before reporting.

# E&S Car Sales — Design System

Source of truth for how the site looks and behaves. Read this before touching any UI in `src/app` or `src/components`. Tokens live in `tailwind.config.ts`; shared classes live in `src/app/globals.css`.

## Who it's for

Buyers in Naples and Southwest Florida, mostly on phones, often arriving from Facebook Marketplace, Google, or a WhatsApp link. Many are Spanish speakers. They want to see the cars, the price, and a way to message the dealer in under ten seconds. The site is a small independent lot (5 to 40 cars), not a 500-car franchise store.

## The look

Light and airy, like a bright Florida morning. Frosted white cards float over a soft sky-blue and gold backdrop. Navy carries the headings and buttons; gold carries the accents (eyebrows, icons, one highlighted phrase per heading). Corners are generously rounded, shadows are soft and wide, motion is short and smooth. WhatsApp keeps its own green so it is always recognisable.

Reference: the "Come see the cars in person" section on the home page is the canonical example of the theme.

## Principles

1. **Inventory first.** The cars are the content. Every page gets to a vehicle, a price, or a contact action within one scroll on a phone.
2. **Honest numbers.** Prices, payment estimates, hours, mileage. Never invent stats. Payment estimates always carry the `FINANCE_DISCLAIMER`. Drive times are labelled approximate.
3. **Navy acts, gold accents.** Buttons and prices are navy. Gold is for eyebrows, icon tiles, dividers and one highlighted phrase in a heading. Never gold body text smaller than 14px at weight 600 (use `accent-600`+ for small text).
4. **WhatsApp is the front door.** The WhatsApp action is green and sits first or beside the primary action on every vehicle surface. Call is secondary.
5. **Glass, not grey.** Surfaces are white at 80% with a blur over the backdrop, a hairline white border and a soft shadow. No flat grey panels, no dark glass.
6. **No AI-slop defaults.** No purple gradients, no stock handshake photos, no fake stats bars, no "01 / 02 / 03" markers unless the content is a sequence.

## Color tokens (`tailwind.config.ts`)

| Token | Hex | Use |
|---|---|---|
| `brand-600` | `#1B2D5B` | Navy. Headings, primary buttons, prices, active nav text |
| `brand-700` / `brand-800` | `#15254B` / `#0F1B3A` | Button hover, footer background |
| `brand-200` / `brand-300` | `#B9C4E0` / `#8E9FC9` | Muted text on navy (footer) |
| `accent-500` | `#C19A3E` | Gold. Highlighted phrase in headings, check marks, large icons |
| `accent-600` / `accent-700` | `#9A7A2C` / `#775E20` | Gold for small text: eyebrows, pills, icon tiles |
| `accent-50` / `accent-100` | `#FBF7EC` / `#F4EAD0` | Gold tints: icon tiles, pills |
| `wa-500` / `wa-600` | `#1FAF54` / `#17883F` | WhatsApp only |
| `paper` | `#F5F7FB` | Page base under the backdrop glows |
| `ink` / `ink-muted` | `#172036` / `#5C6579` | Body text / supporting text |
| `line` | `#E1E6EF` | Hairlines, input borders, dividers |
| `slate-400/500/600` | Tailwind | Placeholder, muted, mid text |
| `emerald-*`, `amber-*`, `red-*` | Tailwind | Semantic good / warning / error only |

The backdrop is `body::before` in globals.css: fixed radial glows (sky blue top-right, gold left, blue bottom) over white→paper. Every frosted surface blurs it.

## Type

- One family, **Barlow**. Body 400/500/600 (`font-sans`); display 700/800 (`font-display`) for headings, prices, buttons, nav labels.
- Headings: sentence case, `tracking-[-0.01em]`, navy, with at most one `<span class="highlight">` in gold.
- Eyebrow: `.eyebrow` — 13px, uppercase, `tracking-[0.18em]`, gold, followed by a short gold rule. One per section at most.
- Scale: h1 42px phone / 64px desktop. Section h2 via `.section-title` (30/40px). Card title 24px. Body 16px. Supporting 14px. Captions 12px.
- Running text max ~65ch. `tabular-nums` on any column of numbers.

## Spacing and shape

- Radius: `rounded-xl` (12px) on buttons, inputs, chips over photos; `rounded-2xl` (16px) on cards and panels; `rounded-full` only for filter chips and the heart button.
- Shadows: `shadow-panel` on cards, `shadow-glow` on navy buttons, `shadow-card-hover` on hover. Nothing else.
- Section padding: `py-10` phone, `py-12`–`py-16` desktop. Page gutter `px-4`. Page width `max-w-site`.
- Touch targets ≥ 44px. Buttons are `min-h-[48px]`; compact `.btn-sm` is 42px.

## Components (globals.css)

| Class | Role |
|---|---|
| `.btn-primary` / `.btn-navy` | Navy with glow. The main action (See the cars, Get directions, Sign in, Check availability) |
| `.btn-secondary` | Frosted white with navy text and a navy-tinted border. Second action (Book a visit, Call) |
| `.btn-wa` | Green. WhatsApp only |
| `.btn-gold` | Gold. Rare; promotional only |
| `.btn-ghost-white` | Outline on navy surfaces (footer) |
| `.card` / `.card-hover` | Frosted white panel; hover lifts 2px and deepens the shadow |
| `.input` / `.label` | Form controls. 16px text so iOS doesn't zoom |
| `.eyebrow` | Gold uppercase label with rule |
| `.highlight` | Gold span inside a navy heading |
| `.icon-tile` | 48px gold-tinted square with a gold icon |
| `.chip` | Dark navy pill over photos (condition · miles) |
| `.pill` | Gold-tinted tag (body style, stock #) |
| `.filter-chip` | Round toggle; `aria-pressed` makes it navy |
| `.price` | Navy display extrabold, tabular numerals |
| `.hero-band` | Frosted strip at the top of inventory, landing and secondary pages |
| `.section-title` / `.section-sub` | Section heading pair |
| `.vdp-*` | Vehicle page panel, eyebrow, heading, buttons, inputs (all map to the classes above) |
| `.admin-bar` | Sticky frosted top bar on admin pages |

## Page patterns

- **Header:** sticky frosted white, 60/68px. Logo + wordmark, nav with a gold underline on the active item, phone, green WhatsApp, Admin last.
- **Hero (home):** eyebrow, navy headline with a gold second phrase, lede, frosted 3-field finder (plain GET to `/inventory`), three gold check proofs. Right: spotlight photo card with a frosted price tag, or the logo card when no car has photos.
- **Vehicle card:** 4:3 photo with chip + heart, title (24px), trim · colour, dashed-rule price row (navy price left, est. payment right), three spec icons, `WhatsApp` + `Details` buttons, compare checkbox.
- **Inventory:** frosted hero band with eyebrow, headline, search card, quick-pick chips; frosted sticky toolbar; filter card on desktop; `.vehicle-grid`.
- **Vehicle page:** gallery left, frosted contact panel right (gold eyebrow, navy price, WhatsApp, Check availability, Schedule test drive, Call), section nav, spec panel, equipment, particulars, visit. Frosted sticky bottom bar on phones.
- **Visit section:** eyebrow, "Come see the cars **in person**", three info cards with gold icon tiles (Address, Hours, Phone), navy + outline buttons, four gold-icon points; right: frosted map card with pin label, "View larger map", and an approximate drive-time strip.
- **Secondary pages:** `.hero-band` with navy h1 and one sentence, then frosted cards.
- **Admin:** same backdrop; cards and bars frosted; login is a single centred card with the logo.
- **Footer:** `brand-800` navy, four columns, social squares, small print.

## Motion

- Page enter: 260ms fade + 8px rise via `src/app/template.tsx` (`.page-enter`).
- Buttons: 200ms colour + 1px lift + shadow on hover, press returns to flat.
- Cards: 200ms 2px lift + shadow on hover. Photos: 1.03 zoom on card hover.
- Dialogs: 220ms fade/scale (sheet slide on phones) with a blurred backdrop.
- No scroll-triggered reveals, no autoplay video. `prefers-reduced-motion` turns everything off (globals.css).

## Copy

Sentence case. Plain verbs. Say what happens ("Request test drive", not "Submit"). Name things the way a buyer does. Spanish is welcome where it helps ("Hablamos español"). Never claim "no dealer fees" or any number we can't back.

## Checklist before shipping UI

- [ ] Phone first: right at 390px, no horizontal scroll, 16px gutter
- [ ] Navy heading with at most one gold highlight; one eyebrow per section
- [ ] One primary (navy) action, WhatsApp green and visible
- [ ] Text contrast ≥ 4.5:1 (gold small text uses `accent-600`+; no `slate-500` on navy)
- [ ] Surfaces use `.card`; no flat grey panels
- [ ] Every interactive element ≥ 44px with a visible focus ring
- [ ] Empty, loading and error states written, not left blank
- [ ] Real data only; no placeholder numbers or lorem ipsum

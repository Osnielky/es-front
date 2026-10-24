# E&S Car Sales — Design System

Source of truth for how the public site looks and behaves. Read this before touching any UI in `src/app` or `src/components`. Tokens live in `tailwind.config.ts`; shared classes live in `src/app/globals.css`.

## Who it's for

Buyers in Naples and Southwest Florida, mostly on phones, often arriving from Facebook Marketplace, Google, or a WhatsApp link. Many are Spanish speakers. They want to see the cars, the price, and a way to message the dealer in under ten seconds. The site is a small independent lot (5 to 40 cars), not a 500-car franchise store.

## Principles

1. **Inventory first.** The cars are the content. Every page gets to a vehicle, a price, or a contact action within one scroll on a phone.
2. **Honest numbers.** Prices, payment estimates, hours, mileage. Never invent stats (no "500+ vehicles", no "4.9 stars"). Payment estimates always carry the `FINANCE_DISCLAIMER`.
3. **One loud thing.** Red is reserved for the price and the single primary action on a page. Everything else is quiet: navy, white, slate.
4. **WhatsApp is the front door.** The WhatsApp action is green and sits first or beside the primary action on every vehicle surface. Call is the secondary.
5. **Window-sticker vernacular.** Condensed type, dotted leaders, a spec table, a red price tag. The site should feel like the paper sticker on the car window, not like a SaaS dashboard.
6. **No AI-slop defaults.** No Inter, no purple gradients, no rounded-2xl on everything, no ALL-CAPS eyebrow labels, no "01 / 02 / 03" markers unless the content is a real sequence, no hero stats bar.

## Color tokens (`tailwind.config.ts`)

| Token | Hex | Use |
|---|---|---|
| `brand-600` | `#15295A` | Navy. Hero bands, header text, primary navy buttons, footer |
| `brand-800` | `#0C1A3D` | Darker navy. Footer background, hover for navy buttons |
| `brand-200` / `brand-300` | `#B9C4E0` / `#8E9FC9` | Muted text on navy surfaces |
| `accent-500` | `#C1121F` | Red. Prices, `.btn-primary`, active nav underline, hero band rule |
| `accent-600` | `#A50E19` | Red hover |
| `wa-500` / `wa-600` | `#1FAF54` / `#17883F` | WhatsApp only. Never for anything else |
| `paper` | `#F3F5F9` | Page background (cool off-white, never cream) |
| `ink` / `ink-muted` | `#131B2E` / `#5C6579` | Body text / supporting text |
| `line` | `#D7DCE6` | Hairlines, card borders, dividers |
| `slate-100/400/500/700` | Tailwind | Subtle fills, placeholder text, muted text, mid text |
| `emerald-600/50/700` | Tailwind | Semantic "good": clean title, success. Not an accent |
| `amber-*`, `red-50` | Tailwind | Semantic warning / error only |

Rules: text on navy uses white or `brand-200`. Text on paper/white uses `ink` or `slate-500`. Never put `slate-500` on navy.

## Type

- **Display:** Barlow Condensed 600/700/800 (`font-display`). Headings, prices, buttons, nav labels, stat values.
- **Body:** Barlow 400/500/600 (`font-sans`). Everything else.
- Headings are sentence case, never all caps. Letter-spacing is default; buttons use `tracking-wide`.
- Scale: h1 40px phone / 52–64px desktop. Section h2 via `.section-title` (30/36px). Card title 24px. Body 16px. Supporting 14px. Captions 12px.
- Running text max ~65ch. `tabular-nums` on any column of numbers.

## Spacing and shape

- Radius: `rounded` (4px) on buttons, inputs and chips; `rounded-md` (6px) on cards and panels; `rounded-panel` (8px) on VDP panels; `rounded-full` only for filter chips and the heart button.
- No drop shadows on cards. Hierarchy comes from borders (`border-line`) and background steps (paper → white).
- Section padding: `py-9` phone, `py-10`–`py-12` desktop. Page gutter `px-4`. Page width `max-w-site`.
- Touch targets ≥ 44px. Buttons are `min-h-[46px]`; compact `.btn-sm` is 40px.

## Components (globals.css)

| Class | Role |
|---|---|
| `.btn-primary` | Red. The one main action on a page (See the cars, Apply, Send) |
| `.btn-navy` | Navy. Secondary strong action (Details, Get directions, Check availability) |
| `.btn-wa` | Green. WhatsApp only |
| `.btn-secondary` | White outline. Call, Cancel, tertiary |
| `.btn-ghost-white` | Outline on navy bands |
| `.card` / `.card-hover` | White, 1px `line` border, 6px radius; hover turns the border navy |
| `.input` / `.label` | Form controls. 16px text so iOS doesn't zoom |
| `.chip` | Dark navy pill over photos (condition · miles) |
| `.pill` | Light grey tag (body style, stock #) |
| `.filter-chip` | Round toggle; `aria-pressed` makes it navy |
| `.price` | Red condensed extrabold, tabular numerals |
| `.hero-band` | Navy band with 6px red rule at the bottom. Every secondary page opens with one |
| `.section-title` / `.section-sub` | Section heading pair |
| `.vdp-*` | Vehicle page panel, eyebrow, heading, buttons, inputs |

## Page patterns

- **Header:** sticky, white, 60/66px. Logo + wordmark, nav with red underline on the active item, phone, green WhatsApp, Admin last.
- **Hero (home):** navy band. Left: headline, promise, 3-field finder form (plain GET to `/inventory`), three check-mark proofs. Right: spotlight photo with a white price tag, or the logo panel when no car has photos.
- **Vehicle card:** 4:3 photo with chip + heart, title (24px condensed), trim · color, dashed-rule price row (red price left, est. payment right), 3 spec icons, `WhatsApp` + `Details` buttons, compare checkbox.
- **Inventory:** navy hero with search + quick picks, white sticky toolbar (count, compare, sort, grid/list), filter sidebar on desktop, collapsible on phones, `.vehicle-grid`.
- **Vehicle page:** gallery left, white contact panel right (red price, est. payment, WhatsApp, Check availability, Schedule test drive, Call), section nav, spec panel, equipment, particulars, visit. Sticky bottom bar on phones with price + WhatsApp + Contact.
- **Secondary pages:** `.hero-band` with h1 and one sentence, then white cards on paper.
- **Footer:** `brand-800`, four columns (brand, Shop, Dealership, Visit), social squares, small print with Sitemap / Staff / Site by OSMIO.

## Copy

Sentence case. Plain verbs. Say what happens ("Request test drive", not "Submit"). Name things the way a buyer does (miles, price, test drive), not the way the system does. Spanish is welcome where it helps ("Hablamos español"). Never claim "no dealer fees" or any number we can't back.

## Motion

Only on user action: hover border colour, 1.03 photo zoom on card hover, dialog slide-in. No scroll-triggered reveals, no autoplaying video. Respect `prefers-reduced-motion` (globals.css already does).

## Checklist before shipping UI

- [ ] Phone first: looks right at 390px, no horizontal scroll, 16px gutter
- [ ] Price red, one primary action, WhatsApp green and visible
- [ ] Text contrast ≥ 4.5:1 (no `slate-500` on navy, no `brand-200` on white)
- [ ] Headings in `font-display`, body in `font-sans`, no Inter
- [ ] Every interactive element ≥ 44px and has a visible focus ring
- [ ] Empty, loading and error states written, not left blank
- [ ] Real data only; no placeholder numbers or lorem ipsum

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**es-front** is the mobile-first, SEO-focused website for E&S Car Sales (Naples, FL): public vehicle inventory, lead capture, and a small admin panel for managing inventory. Next.js 15 (App Router) + TypeScript + Tailwind, PostgreSQL via Prisma, deployed to Google Cloud Run with images in Google Cloud Storage.

## Commands

```bash
npm run dev              # Dev server on localhost:3000
npm run build            # Standalone Next.js build (used by the Docker image)
npm run lint             # next lint
npx tsc --noEmit         # Type check — the main automated correctness check
npm run db:migrate       # prisma migrate dev (create + apply a migration)
npm run db:push          # Push schema without a migration
npm run db:seed          # tsx prisma/seed.ts — sample vehicles
npm run db:studio        # Prisma Studio
npm run db:generate      # Regenerate Prisma client
```

There is no test suite. `next dev` and `next build` share `.next/`, so don't run a production build while a dev server is running; it breaks the dev server's assets. Verify changes with `npx tsc --noEmit`, `npm run lint`, and manual QA in the browser.

Local env vars live in `.env` (see `dev.env.example` for the list). Required: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (≥32 chars, or auth throws). Optional: `GCS_BUCKET_NAME`/`GCS_PROJECT_ID` (uploads), `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` (lead emails; silently skipped if unset), `MAX_UPLOAD_SIZE_MB`, and `NEXT_PUBLIC_DEALER_*`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Architecture

### Data access & caching

- **Public pages read through `src/lib/data.ts`**, not Prisma directly. Reads are wrapped in `unstable_cache` (tag `vehicles`, 300s). Admin create/update/delete routes call `revalidateTag(VEHICLES_TAG)`. Any new write path must do the same, or public pages stay stale for up to 5 minutes. The cache is per Cloud Run instance, so other instances catch up on the 300s timer.
- `data.ts` only returns `AVAILABLE` vehicles, converts `Decimal` price to `number`, and rehydrates Dates (the cache JSON-serializes them). Domain types in `src/types/index.ts` use `number`.
- **Inventory filtering is URL-driven.** `VehicleFilters` pushes query params, and `/inventory` re-renders on the server. `GET /api/vehicles` is only used by `/admin/vehicles`.
- `getInventoryFacets()` returns makes, models and body styles with counts. It powers the landing pages, the sitemap and the "Shop by" links.

### URLs, canonicals & landing pages

- **Always build vehicle links with `vehiclePath()`/`vehicleUrl()`** from `lib/seo.ts`. They use the VIN, falling back to the slug when the VIN is null or empty. `/inventory/[vin]` accepts a slug or VIN and 308-redirects to the canonical URL.
- SEO landing pages: `/cars-for-sale/[make]`, `/cars-for-sale/[make]/[model]`, `/cars-for-sale/type/[bodyStyle]`. Build their paths with `makePath`/`modelPath`/`bodyStylePath` (which use `slugify`). They 404 when nothing matching is in stock. Shared UI is in `components/inventory/InventoryLanding.tsx`, and copy and metadata in `lib/landing.ts`.
- VDPs and landing pages use ISR (`revalidate = 300`, `generateStaticParams` returns `[]`, so the Docker build needs no DB). `sitemap.ts` is `force-dynamic` for the same reason.
- `/inventory` canonical rules: `?make=` points to the make landing page, price/year/model filters get `noindex,follow`, and paginated pages canonicalize to themselves.

### Single sources of truth (keep NAP consistent)

- `lib/seo.ts`: `LOCATION` (structured address, `geo`), `DEALER_ADDRESS`, `BUSINESS_HOURS` (feeds the schema, FAQ, footer, contact and about pages), `stockNumber()`, `serializeJsonLd()`. **Always** inject JSON-LD with `serializeJsonLd`, because it escapes `<`.
- `lib/contact.ts`: `DEALER_PHONE`, `TEL_HREF`, `whatsappHref()`. It normalizes to E.164; never hand-build `tel:`/`wa.me` links.
- `lib/finance.ts`: `estimateMonthlyPayment()` and `FINANCE_DISCLAIMER`. Every "Est. $X/mo" must show the disclaimer on the same page.
- Structured data: one `AutoDealer` entity (`@id` `/#organization`), and VDPs use `["Product","Car"]`. Don't add review or rating markup unless it comes from real, visible reviews.

### Inventory listing UI

- `/inventory` query params: `q` (keyword search across make/model/trim/body/color), `make`, `bodyStyle`, `priceMin`/`priceMax`, `yearMin`/`yearMax`, `mileageMax`, `sort` (keys of `VEHICLE_SORTS` in `data.ts`), `view=list`, `page`. The search box is a plain GET form, and the view toggle and pagination are links, so they work without JS.
- **Saved cars and compare** live in `localStorage` via `lib/shortlist.ts` (`useSavedCars`, `useCompare`, max `MAX_COMPARE` = 3, defined in `lib/vehicle-display.ts` so server code can import it). UI islands are in `components/inventory/ShortlistControls.tsx`. `/inventory/compare?ids=` is a `noindex` server page.
- Never import values from a `'use client'` module into server code; put shared constants in a plain module.
- `Vehicle.cleanTitle` is set by an admin checkbox after verifying title history. The "Clean title" badge renders **only** when it's true. Never hardcode trust badges.

### Leads

`POST /api/leads` validates with `leadSchema` (`lib/validations/lead.ts`; email **or** phone is required, and `Lead.email` is nullable), creates a `Lead`, then fires `sendLeadNotification` (`lib/email.ts`, Resend, HTML-escaped) without awaiting it. Lead sources: `LeadForm` (contact, financing, trade-in), the VDP `InquiryForm` (`VEHICLE` for "Check availability", `TEST_DRIVE` for test-drive *requests*: there is no booking service, so the preferred day/time goes into the message and the dealer confirms), and `WhatsAppButton` (cards, VDP panel, VDP mobile bar), which logs a `WHATSAPP` lead on click before opening WhatsApp. The VDP form folds vehicle name, stock #, VIN, id and URL into the message. Adding a `LeadType` requires a Prisma migration plus updates to the Zod schema and `TYPE_LABEL` in `email.ts`.

### Admin

- Auth: `lib/admin-auth.ts` signs HS256 JWTs with `jose` (12h TTL) and stores them in the `admin_session` HTTP-only cookie. Credentials are compared against the `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (single admin, no user table).
- `src/middleware.ts` guards `/admin/*` (redirects to `/admin/login`) and `/api/admin/*` (returns 401). Admin API routes (`upload`, `decode-vin`, etc.) **also** re-check the cookie themselves with a local `isAdmin()` helper. Keep that pattern for new admin routes.
- Admin pages are client components that call `/api/admin/*`.
- `POST /api/admin/upload` writes to the GCS bucket and returns public `storage.googleapis.com` URLs, which get stored in `Vehicle.images[]`. It enforces `MAX_UPLOAD_SIZE_MB` and returns 413 for oversized files.
- VIN entry: `components/admin/VinScanner.tsx` scans barcodes with `html5-qrcode`. `GET /api/admin/decode-vin?vin=` calls NHTSA vPIC and maps body class and fuel type to the site's vocabulary.

### SEO

`src/lib/seo.ts` holds all metadata/JSON-LD builders (`buildVehicleJsonLd`, `buildLocalBusinessJsonLd`, `buildPageMetadata`, FAQ/financing/trade-in schemas, etc.) and the `LOCATION` constant for the dealership. Pages inject JSON-LD as inline `<script type="application/ld+json">`. `robots.ts` and `sitemap.ts` are generated. Vehicle pages use ISR (`revalidate = 300`).

### Styling

Shared component classes (`.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.label`, `.badge-*`) are defined in `src/app/globals.css`. Reuse them instead of repeating long inline Tailwind strings. Layouts are mobile-first. The fixed header height is the `--header-h` CSS variable (76px phones, 108px from `sm`); use it for sticky offsets and `scroll-mt`. Page width is `max-w-site` (`--site-max`: 1536px, 1760px from 1800px screens), shared by the header and the inventory pages so content lines up with the logo; use it for new full-width containers.

**Vehicle detail page** (`app/inventory/[vin]/page.tsx`, components in `components/vdp/`): `VdpProvider` (`VdpContext.tsx`) holds the serializable `VdpVehicle` and opens the inquiry `<dialog>` (`InquiryDialog`/`InquiryForm`, lazy-loaded); `VdpGallery` (Embla + thumbnails; hero only loads first) opens `VdpLightbox` (yet-another-react-lightbox with Zoom/Thumbnails, loaded on first open); `ContactPanel` (price, est. payment, CTAs; sticky from the `desk` = 1200px breakpoint); `VehicleSpecs`, `SectionNav` (scroll-spy), `MobileActionBar` (<768px, hides while an overlay is open). VDP classes: `.vdp-*` in globals.css (glass versions of panels, buttons, inputs), `rounded-panel`. Order at every width below 1200px: back link/title → gallery → price panel → sections (overview/specs, features, details, visit). Missing inventory fields render "Not listed"; never infer values from photos.

**Glass theme (public site):** `<body>` paints a fixed dark "Gulf dusk" backdrop (`body::before` in `globals.css`: navy #0c1e33 with teal/peach glows). Public pages wrap their content in `.theme-glass`, which restyles `.card` (frosted panel), `.btn-primary` (ivory with navy text), `.btn-secondary`, `.input`, `.label`, `.badge-*`, `.section-title` (serif) and `.lead-form-header`. Surfaces use `.glass` (frosted panel) or `.glass-strong` (denser, for panels over photos/video or text that scrolls underneath); both fall back to solid navy without `backdrop-filter` or with reduced transparency. Text is `text-ivory` with opacity steps (`/75` supporting, `/55` faint); the accent is sunset peach written as `[#F0B27A]` (focus rings too, offset `[#0c1e33]`). Headlines use the serif (`font-serif`, Cormorant, loaded on `<html>`); body, forms, prices and specs stay Inter. Don't paint opaque page backgrounds, and use `text-navy` only on ivory buttons/chips. Admin pages don't use `.theme-glass` and keep the light styles (they paint their own `bg-gray-50`). Vehicle lists use the `.vehicle-grid` class (auto-fill columns with a 20rem minimum, 22rem from `xl`), so cards keep a steady size and a short result set leaves room instead of stretching; don't hardcode `grid-cols-*` for inventory card grids. On `/inventory` the filters are a sticky left sidebar from `lg` (`VehicleFilters`, collapsible above the results below `lg`); the results column has a toolbar that is sticky from `md` (count, removable filter chips, sort, view, and `FiltersButton` below `lg` to jump back to the collapsed panel). Tailwind config changes need a dev-server restart, and don't add object-style `screens` entries (they disable the `min-[…]`/`max-[…]` variants); use arbitrary media variants such as `[@media(min-height:940px)]:` instead.

Remote images must match `remotePatterns` in `next.config.ts` (`storage.googleapis.com`, `images.unsplash.com`).

### Performance rules

- **Images:** always use `next/image`. Pass `priority` + `fetchPriority="high"` only for the LCP image (VDP hero, first 2 cards in a list); everything else is `loading="lazy"`. Use either explicit `width`/`height` or `fill` inside a fixed `aspect-*` box, so nothing shifts layout. `imageSizes` includes 256 for 80px thumbnails on 3x screens, and `minimumCacheTTL` is 30 days because uploads have unique filenames.
- **VDP gallery:** only the hero photo loads up front. Neighbor photos prefetch after `requestIdleCallback` or on first interaction.
- **Third-party embeds and scripts** (maps, chat, CRM, analytics) must never load during initial render. Use the facade pattern in `components/layout/LazyMapEmbed.tsx` (render when visible + idle, desktop only), or `next/script` with `strategy="lazyOnload"` for widgets. Never add a raw `<script src>` to the layout.
- The hero videos (`HeroVideoRotator`) mount only after `load`, on desktop, when neither Save-Data nor reduced motion is set.

## Deployment

- `Dockerfile`: multi-stage node:20-slim build, serves `.next/standalone` on port 8080. `output: 'standalone'` in `next.config.ts` is required. `prisma/schema.prisma` has `binaryTargets` for Debian OpenSSL. Keep them when changing the generator.
- Runtime secrets (`DATABASE_URL`, `ADMIN_*`) are attached by `gcloud run deploy --update-secrets` from Secret Manager (`*_DEV` secrets). The migrate step reads `DATABASE_URL_MIGRATE` via `availableSecrets` and connects through the Cloud SQL proxy's Unix socket. Never hardcode credentials in the Dockerfile or Cloud Build config.
- `NEXT_PUBLIC_*` values are inlined at **build time**, so they are passed as Docker `--build-arg`s. Changing them requires a rebuild, not just a Cloud Run env change.
- `cloudbuild-dev.yaml` (the only pipeline in the repo) triggers on the `dev` branch. It builds and pushes to Artifact Registry, runs `prisma migrate deploy` through the Cloud SQL proxy, and deploys the `es-front-dev` Cloud Run service (project `es-cars-dev`, region `us-east1`). Migrations must therefore be committed under `prisma/migrations/`.
- GCP setup (Secret Manager, IAM, Cloud SQL) is documented in `CLOUD_SETUP.md`, with helper scripts in `scripts/`.

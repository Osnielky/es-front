# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**es-front** is a mobile-first, SEO-friendly car dealership website built on Google Cloud Platform. It showcases vehicle inventory, captures customer leads, and runs on Next.js with a PostgreSQL backend.

**Stack:**
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL with Prisma migrations
- Cloud: Google Cloud Run (via Docker + Cloud Build)
- Media: Google Cloud Storage for vehicle images
- Forms: React Hook Form + Zod validation
- Auth: Custom session-based admin authentication (JWT tokens in cookies)

**Core Data Models:**
- `Vehicle` — inventory with images, pricing, specs, status tracking
- `Lead` — customer inquiries (general, vehicle-specific, financing, trade-in)
- Enums: `Condition` (NEW/USED/CERTIFIED), `VehicleStatus` (AVAILABLE/SOLD/PENDING), `LeadType`

## Development Commands

```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Produce standalone Next.js bundle for Cloud Run
npm run start            # Run production build locally
npm run lint             # Run ESLint
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Create and run new migration
npm run db:push          # Push schema changes without migrations
npm run db:seed          # Populate database with sample vehicles
npm run db:studio        # Open interactive Prisma Studio GUI
npx tsc --noEmit         # Type check without emitting JS
```

**First-time setup:**
```bash
# Copy .env and fill in DATABASE_URL and other required vars
npm install
npm run db:migrate
npm run db:seed           # Optional: load sample inventory
npm run dev
```

## Architecture

### Directory Structure

```
src/
  app/                    # Next.js App Router
    api/
      vehicles/           # GET paginated/filtered inventory (public)
      leads/              # POST lead capture (public)
      admin/              # Protected: login, logout, stats, vehicle CRUD
    admin/                # Protected: dashboard, vehicle management UI
    inventory/            # Public: list and detail pages (server components)
    contact/              # Contact form page
    layout.tsx            # Root layout with Header, Footer, SEO metadata
    globals.css           # Shared component classes (btn-primary, card, input, etc.)
    robots.ts             # robots.txt generation
    sitemap.ts            # XML sitemap generation
  components/
    layout/               # Header (client, with mobile nav), Footer
    inventory/            # VehicleCard, VehicleFilters (client), VehicleDetailGallery
    leads/                # LeadForm (client, react-hook-form + zod)
  lib/
    prisma.ts             # Singleton Prisma client with HMR caching
    seo.ts                # JSON-LD builders, title/description helpers, LOCATION config
    admin-auth.ts         # JWT token generation/verification, session management
    data.ts               # Data fetching utilities
    validations/
      lead.ts             # Zod schema for lead form
      vehicle.ts          # Zod schema for vehicle filters
    vehicle-makes-models.ts  # Master list of vehicle makes/models
  types/index.ts          # Domain type interfaces (Vehicle, Lead, VehicleFilters)
  middleware.ts           # Auth guard for /admin/* and /api/admin/* routes
prisma/
  schema.prisma           # Source of truth for database schema
  migrations/             # Migration files (tracked in git)
  seed.ts                 # Sample data loader
public/                   # Static assets (og-image.jpg, etc.)
```

### Data Flow & Key Patterns

**Public Inventory (Browsing):**
1. Client requests `/inventory` → server component fetches via `prisma.vehicle.findMany()`
2. Filters applied client-side by `VehicleFilters` component → calls `/api/vehicles` with query params
3. `/api/vehicles` validates with `vehicleFilterSchema` (Zod) → queries Prisma → returns paginated results
4. Server converts Prisma `Decimal` prices to `number` before passing to components

**Lead Capture:**
1. User fills LeadForm → validates with `leadSchema` (Zod)
2. POST to `/api/leads` with form data
3. Route validates + creates Lead record in database
4. Response includes confirmation or error

**Admin Operations:**
1. User navigates to `/admin/login` or `/admin` → middleware checks cookie token
2. `/api/admin/login` verifies email/password (ADMIN_EMAIL/ADMIN_PASSWORD env vars) → issues JWT in secure cookie
3. Middleware verifies token on each admin request
4. Admin CRUD routes (`/api/admin/vehicles`) handle vehicle management
5. Image uploads go to Google Cloud Storage via `/api/admin/upload`

### Critical Conventions & Gotchas

**Prisma Decimal Handling:**
- Prisma stores `price` as `Decimal(10, 2)` in schema
- **Must convert to `number` at page/route boundary** before passing to React components
- Example: `const price = Number(vehicle.price)` before rendering
- Domain types (`types/index.ts`) use `number` for consistency

**Component Location Matters:**
- Server components: fetch directly via `prisma.*` (no `'use client'`)
- Client components: must have `'use client'` directive at top and fetch via `/api/*` routes
- Hooks (useState, useCallback, etc.) **require** `'use client'`

**Shared Classes in globals.css:**
- Always use predefined utility classes: `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.label`, `.badge-*`
- Do not repeat inline Tailwind classes; define them in globals.css instead for consistency

**SEO Metadata:**
- Dynamic titles/descriptions built with helpers in `lib/seo.ts`
- JSON-LD injected inline in page components as `<script>` tags
- Naples, FL location details centralized in `LOCATION` export from `seo.ts`
- Root layout sets global defaults; individual pages override as needed

**Environment Variables:**
- `NEXT_PUBLIC_*` vars must be set at **build time** for client components (see Dockerfile ARG section)
- Database secrets (DATABASE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET) are server-only
- Cloud Run secrets passed as env vars in cloud.google.com console

**Admin Auth:**
- JWT tokens issued by `/api/admin/login` and stored in secure HTTP-only cookies
- Tokens verified by middleware; session secret in `ADMIN_SESSION_SECRET`
- Login credentials: `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment

**Image Handling:**
- Vehicles can have multiple images (array in schema)
- New images uploaded to Google Cloud Storage bucket (name in `GCS_BUCKET_NAME` env var)
- Uploaded URLs returned and stored in vehicle.images array
- Next.js `remotePatterns` in `next.config.ts` allow loading from `storage.googleapis.com` and `images.unsplash.com`

### Page Components & Routing

**Public Pages (Server Rendered):**
- `/` — Home page with hero, featured inventory, CTAs
- `/inventory` — Filtered vehicle list with client-side filters
- `/inventory/[vin]` — Dynamic vehicle detail page
- `/contact` — Contact form page
- `/robots.txt` and `/sitemap.xml` — Generated dynamically

**Admin Pages (Protected):**
- `/admin/login` — Email/password login
- `/admin` — Dashboard (stats, vehicle list)
- `/admin/inventory` — Manage vehicles (list, create, edit)
- `/admin/inventory/[id]/edit` — Edit vehicle details + upload images

**API Routes:**
- `GET /api/vehicles` — Returns paginated, filtered inventory
- `POST /api/leads` — Capture lead inquiries
- `POST /api/admin/login` — Authenticate and issue session token
- `POST /api/admin/logout` — Clear session
- `GET /api/admin/stats` — Inventory stats for dashboard
- `GET/POST/PATCH /api/admin/vehicles` — Manage inventory
- `POST /api/admin/upload` — Upload images to GCS

## Deployment

**Docker & Cloud Run:**
- `Dockerfile` uses multi-stage build: deps → builder → production runtime
- `output: 'standalone'` in `next.config.ts` required; do not remove
- Cloud Run service reads env vars from secrets: `DATABASE_URL`, `ADMIN_*`, `GCS_*`, `NEXT_PUBLIC_*`
- Migrations run automatically as a pre-deployment step (see cloudbuild.yaml)

**Cloud Build CI/CD:**
- `cloudbuild.yaml` — Production pipeline
- `cloudbuild-dev.yaml` — Development builds
- Pushes image to Artifact Registry, then deploys to Cloud Run

## Testing & Type Safety

- Run `npx tsc --noEmit` to check TypeScript without emitting code
- Zod schemas validate all form inputs and API query params
- No dedicated test suite in place; focus on type safety and manual QA

## Important File Reference

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition and enums |
| `src/lib/seo.ts` | SEO helpers, JSON-LD builders, location config |
| `src/lib/validations/` | Zod schemas for forms and API inputs |
| `src/app/globals.css` | Component utility classes |
| `src/middleware.ts` | Admin auth guard |
| `src/lib/admin-auth.ts` | JWT token utilities |
| `.env` | Local environment variables (not committed) |
| `Dockerfile` | Container image definition |
| `cloudbuild.yaml` | GCP deployment pipeline |

## Coding Guidelines

**When Adding Features:**
1. Define Zod schema for validation first (in `lib/validations/`)
2. Create API route(s) with validation middleware
3. Build UI components (server or client as appropriate)
4. Update SEO metadata if user-facing
5. Test types with `npx tsc --noEmit`
6. Ensure images and secrets are not committed

**Database Changes:**
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` and name the migration descriptively
3. Migrations are tracked in git for reproducible deployments
4. Test locally before pushing

**Mobile-First Mindset:**
- Start layouts from phone screens (use Tailwind breakpoints: default = mobile, sm/md/lg = larger screens)
- Vehicle detail priority on mobile: images → price → title → specs → lead CTA → financing → description
- Ensure form fields, buttons, and galleries are touch-friendly

**SEO and Content:**
- Use dynamic metadata helpers from `lib/seo.ts` for all pages
- Include JSON-LD structured data for vehicles and local business schema
- Clean, SEO-friendly slugs (vehicles use VIN as slug)
- Internal linking between inventory and detail pages for crawlability

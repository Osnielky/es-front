# Copilot Instructions — es-front (Car Dealer Website)

## Stack
- **Next.js 15** (App Router, `output: 'standalone'`), TypeScript, Tailwind CSS
- **PostgreSQL** + **Prisma ORM** — `Vehicle` + `Lead` models
- **React Hook Form** + **Zod** for all form validation
- **Google Cloud Run** via Docker + Cloud Build (`cloudbuild-dev.yaml`, deploys the `dev` branch)
- **Google Cloud Storage** for vehicle images, **Resend** for lead notification emails

## Project Structure
```
src/
  app/                   # Next.js App Router pages + API routes
    api/vehicles/        # GET – paginated, filtered inventory (used by admin)
    api/leads/           # POST – lead capture + email notification
    api/admin/           # Protected: login, logout, stats, vehicles CRUD, upload, decode-vin
    inventory/           # Server component – list page (filters via URL search params)
    inventory/[vin]/     # Server component – vehicle detail (accepts slug or VIN)
    admin/               # Protected admin UI (client components)
    contact/ financing/ trade-in/ about/
  components/
    layout/              # Header (client, mobile nav), Footer
    inventory/           # VehicleCard, VehicleFilters, VehicleDetailGallery, WhatsAppButton
    leads/               # LeadForm (client, react-hook-form + zod)
    admin/               # VinScanner (html5-qrcode)
  lib/
    data.ts              # Server-side data access (AVAILABLE vehicles, Decimal → number)
    prisma.ts            # Singleton Prisma client (global cache for dev HMR)
    seo.ts               # JSON-LD builders, title/description helpers, LOCATION
    admin-auth.ts        # JWT (jose) admin session in `admin_session` cookie
    email.ts             # Resend lead notifications
    validations/         # Zod schemas: lead.ts, vehicle.ts
  middleware.ts          # Guards /admin and /api/admin
  types/index.ts         # Domain types (Vehicle, Lead, VehicleFilters)
prisma/
  schema.prisma          # Source of truth for DB schema
  seed.ts                # Sample vehicles — run: npm run db:seed
```

## Critical Conventions
- **Prisma `Decimal` → `number` conversion** must happen at the page/route boundary before passing to components (e.g., `price: Number(vehicle.price)`). Public pages should read through `src/lib/data.ts`, which already does this.
- Server components fetch on the server; client components fetch via `/api/*` routes.
- All client components that use hooks require `'use client'` at the top.
- Utility classes `btn-primary`, `btn-secondary`, `card`, `input`, `label`, `badge-*` are defined in `src/app/globals.css` — use them instead of repeating inline classes.
- SEO metadata is generated with helpers in `src/lib/seo.ts`; JSON-LD scripts are injected inline in page components.
- Admin API routes re-verify the admin cookie themselves in addition to the middleware.

## Developer Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed sample vehicles
npm run db:studio        # Open Prisma Studio
npx tsc --noEmit         # Type check
```

## Environment Setup
Copy `dev.env.example` → `.env` and fill in `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (≥32 chars) and dealer info before running.

## Deployment
Pushing to `dev` triggers `cloudbuild-dev.yaml` → builds and pushes to Artifact Registry → runs `prisma migrate deploy` → deploys to Cloud Run.
Secrets (`DATABASE_URL`, `ADMIN_*`) come from Secret Manager (see `CLOUD_SETUP.md`); never put them in the Dockerfile or Cloud Build config.
`NEXT_PUBLIC_*` values are build-time Docker build args.
The Dockerfile uses Next.js standalone output — do not remove `output: 'standalone'` from `next.config.ts`.

## Key Files to Know
- `prisma/schema.prisma` — DB schema, enums (`Condition`, `VehicleStatus`, `LeadType`)
- `src/lib/seo.ts` — all SEO/JSON-LD helpers
- `src/app/globals.css` — shared component class definitions
- `cloudbuild-dev.yaml` — GCP deployment pipeline

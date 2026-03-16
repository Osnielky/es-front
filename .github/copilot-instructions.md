# Copilot Instructions — es-front (Car Dealer Website)

## Stack
- **Next.js 15** (App Router, `output: 'standalone'`), TypeScript, Tailwind CSS
- **PostgreSQL** + **Prisma ORM** — single `Vehicle` + `Lead` models
- **React Hook Form** + **Zod** for all form validation
- **Google Cloud Run** via Docker + Cloud Build (`cloudbuild.yaml`)
- **Google Cloud Storage** for vehicle images

## Project Structure
```
src/
  app/                   # Next.js App Router pages + API routes
    api/vehicles/        # GET – paginated, filtered inventory
    api/leads/           # POST – lead capture
    inventory/           # Server component – list page
    inventory/[slug]/    # Server component – vehicle detail
    contact/             # Contact page
  components/
    layout/              # Header (client, mobile nav), Footer
    inventory/           # VehicleCard, VehicleFilters (client), VehicleGallery (client)
    leads/               # LeadForm (client, react-hook-form + zod)
  lib/
    prisma.ts            # Singleton Prisma client (global cache for dev HMR)
    seo.ts               # JSON-LD builders, title/description helpers
    validations/         # Zod schemas: lead.ts, vehicle.ts
  types/index.ts         # Domain types (Vehicle, Lead, VehicleFilters)
prisma/
  schema.prisma          # Source of truth for DB schema
  seed.ts                # Sample vehicles — run: npm run db:seed
```

## Critical Conventions
- **Prisma `Decimal` → `number` conversion** must happen at the page/route boundary before passing to components (e.g., `price: Number(vehicle.price)`). Domain types use `number`, Prisma returns `Decimal`.
- Server components fetch directly via `prisma.*`. Client components fetch via `/api/*` routes.
- All client components that use hooks (filters, gallery, forms, header) require `'use client'` at the top.
- Tailwind utility classes `btn-primary`, `btn-secondary`, `card`, `input`, `label` are defined in `src/app/globals.css` — use them instead of repeating inline classes.
- SEO metadata is generated with helpers in `src/lib/seo.ts`; JSON-LD scripts are injected inline in page components.

## Developer Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed sample vehicles
npm run db:studio        # Open Prisma Studio
npx tsc --noEmit         # Type check
```

## Environment Setup
Copy `.env.example` → `.env.local` and fill in `DATABASE_URL` and dealer info before running.

## Deployment
Build triggers via `cloudbuild.yaml` → pushes to Artifact Registry → deploys to Cloud Run.  
Requires `DATABASE_URL` and dealer env vars set as Cloud Run secrets/env vars.
The Dockerfile uses Next.js standalone output — do not remove `output: 'standalone'` from `next.config.ts`.

## Key Files to Know
- `prisma/schema.prisma` — DB schema, enums (`Condition`, `VehicleStatus`, `LeadType`)
- `src/lib/seo.ts` — all SEO/JSON-LD helpers
- `src/app/globals.css` — shared component class definitions (`btn-primary`, `card`, `input`, etc.)
- `cloudbuild.yaml` — GCP deployment pipeline

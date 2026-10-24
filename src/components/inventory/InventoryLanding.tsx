import Link from 'next/link'
import type { Vehicle } from '@/types'
import { buildBreadcrumbJsonLd, buildInventoryJsonLd, LOCATION, serializeJsonLd } from '@/lib/seo'
import { FINANCE_DISCLAIMER } from '@/lib/finance'
import VehicleCard from './VehicleCard'

interface Crumb {
  name: string
  url: string
}

interface RelatedGroup {
  heading: string
  links: Array<{ href: string; label: string; count?: number }>
}

interface Props {
  h1: string
  intro: string
  vehicles: Vehicle[]
  breadcrumbs: Crumb[]
  related: RelatedGroup[]
}

// Shared layout for make / model / body-style SEO landing pages
export default function InventoryLanding({ h1, intro, vehicles, breadcrumbs, related }: Props) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs)
  const itemListJsonLd = buildInventoryJsonLd(vehicles, { name: h1 })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }} />

      <div className="min-h-screen">
        <header className="hero-band">
          <div className="mx-auto max-w-site px-4 pb-8 pt-5 sm:pb-9">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                {breadcrumbs.map((crumb, i) => (
                  <li key={crumb.url} className="flex items-center gap-1.5">
                    {i === breadcrumbs.length - 1 ? (
                      <span className="font-semibold text-ink" aria-current="page">{crumb.name}</span>
                    ) : (
                      <>
                        <Link href={crumb.url} className="transition-colors hover:text-brand-600">{crumb.name}</Link>
                        <span aria-hidden="true">/</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="eyebrow mt-4">{LOCATION.city}, {LOCATION.stateCode}</p>
            <h1 className="mt-3 font-display text-[40px] font-extrabold leading-none text-brand-600 sm:text-[52px]">{h1}</h1>
            <p className="mt-3 max-w-3xl text-slate-500">{intro}</p>
          </div>
        </header>

        <div className="mx-auto max-w-site px-4 py-8">
          <div className="vehicle-grid">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 2} />
            ))}
          </div>
          <p className="mt-5 text-xs text-slate-500">* {FINANCE_DISCLAIMER}</p>

          {related
            .filter((group) => group.links.length > 0)
            .map((group) => (
              <section key={group.heading} className="mt-10 border-t border-line pt-8">
                <h2 className="font-display text-2xl font-extrabold text-brand-600">{group.heading}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="filter-chip inline-block">
                        {link.label}
                        {link.count !== undefined && <span className="text-slate-400"> ({link.count})</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </>
  )
}

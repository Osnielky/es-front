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

      <div className="theme-glass min-h-screen">
        <nav className="border-b border-ivory/15 px-4 py-3" aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-site items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-ivory/75">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.url} className="flex items-center gap-1.5">
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-ivory" aria-current="page">{crumb.name}</span>
                ) : (
                  <>
                    <Link href={crumb.url} className="hover:text-ivory transition-colors">{crumb.name}</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="border-b border-ivory/15">
          <div className="mx-auto max-w-site px-4 py-8 sm:py-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F0B27A]">
              {LOCATION.city}, {LOCATION.stateCode}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-ivory sm:text-5xl">{h1}</h1>
            <p className="mt-3 max-w-3xl text-ivory/75">{intro}</p>
          </div>
        </header>

        <div className="mx-auto max-w-site px-4 py-8">
          <div className="vehicle-grid">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 2} />
            ))}
          </div>
          <p className="mt-6 text-xs text-ivory/75">* {FINANCE_DISCLAIMER}</p>

          {related
            .filter((group) => group.links.length > 0)
            .map((group) => (
              <section key={group.heading} className="mt-10 border-t border-ivory/15 pt-8">
                <h2 className="text-lg font-bold text-ivory">{group.heading}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block rounded-full border border-ivory/15 bg-ivory/[0.06] px-4 py-2 text-sm font-medium text-ivory/85 transition-colors hover:border-ivory/35 hover:bg-ivory/10 hover:text-ivory"
                      >
                        {link.label}
                        {link.count !== undefined && <span className="text-ivory/55"> ({link.count})</span>}
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

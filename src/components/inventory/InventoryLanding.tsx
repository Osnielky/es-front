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

      <div className="theme-sand min-h-screen">
        <nav className="border-b bg-ivory px-4 py-3" aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-screen-2xl items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-gray-500">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.url} className="flex items-center gap-1.5">
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900" aria-current="page">{crumb.name}</span>
                ) : (
                  <>
                    <Link href={crumb.url} className="hover:text-navy-800 transition-colors">{crumb.name}</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="border-b border-sand-200 bg-ivory">
          <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:py-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy">
              {LOCATION.city}, {LOCATION.stateCode}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{h1}</h1>
            <p className="mt-3 max-w-3xl text-gray-600">{intro}</p>
          </div>
        </header>

        <div className="mx-auto max-w-screen-2xl px-4 py-8">
          <div className="vehicle-grid">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 2} />
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-500">* {FINANCE_DISCLAIMER}</p>

          {related
            .filter((group) => group.links.length > 0)
            .map((group) => (
              <section key={group.heading} className="mt-10 border-t border-sand-200 pt-8">
                <h2 className="text-lg font-bold text-gray-900">{group.heading}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block rounded-full border border-sand-200 bg-ivory px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-200 hover:text-navy-800"
                      >
                        {link.label}
                        {link.count !== undefined && <span className="text-gray-400"> ({link.count})</span>}
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

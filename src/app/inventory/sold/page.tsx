import type { Metadata } from 'next'
import Link from 'next/link'
import { getSoldVehicles, getVehicles } from '@/lib/data'
import { buildBreadcrumbJsonLd, buildInventoryJsonLd, buildPageMetadata, LOCATION, serializeJsonLd } from '@/lib/seo'
import VehicleCard from '@/components/inventory/VehicleCard'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: `Recently Sold Cars in ${LOCATION.city}, ${LOCATION.stateCode}`,
  description: `See the used cars ${DEALER_NAME} has sold recently in ${LOCATION.city}, Florida, and what they sold for. Proof of what we carry, and a shortcut to asking for something similar.`,
  path: '/inventory/sold',
  keywords: ['recently sold cars Naples FL', 'used car prices Naples', 'E&S Car Sales sold vehicles', 'what used cars sell for in Naples'],
})

export default async function SoldInventoryPage() {
  const [sold, available] = await Promise.all([
    getSoldVehicles({ limit: 60 }).catch(() => []),
    getVehicles({ limit: 3 }).catch(() => ({ vehicles: [], total: 0 })),
  ])

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
    { name: 'Recently sold', url: '/inventory/sold' },
  ])
  const listJsonLd = buildInventoryJsonLd(sold, { name: `Recently sold vehicles at ${DEALER_NAME}` })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(listJsonLd) }} />

      <div className="min-h-screen">
        <header className="hero-band">
          <div className="mx-auto max-w-site px-4 pb-8 pt-5 sm:pb-9">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-slate-500">
                <li><Link href="/" className="hover:text-brand-600">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href="/inventory" className="hover:text-brand-600">Inventory</Link></li>
                <li aria-hidden="true">/</li>
                <li className="font-semibold text-ink" aria-current="page">Recently sold</li>
              </ol>
            </nav>
            <p className="eyebrow mt-4">Recently sold</p>
            <h1 className="mt-3 font-display text-[40px] font-extrabold leading-none text-brand-600 sm:text-[52px]">
              Cars we&apos;ve sold <span className="highlight">in {LOCATION.city}</span>
            </h1>
            <p className="mt-3 max-w-3xl text-slate-500">
              {sold.length > 0
                ? `${sold.length} recent ${sold.length === 1 ? 'sale' : 'sales'} from our lot on ${LOCATION.streetAddress}. Every car here went to a new owner; use the prices as a guide to what we carry and what it sells for, and ask us when you want something similar.`
                : 'Vehicles we sell will appear here, with the price they sold for.'}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-site px-4 py-8">
          {sold.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
              <p className="font-display text-2xl font-bold text-brand-600">Nothing sold yet</p>
              <p className="max-w-[40ch] text-sm text-slate-500">Everything on the lot is still available. Take a look.</p>
              <Link href="/inventory" className="btn-primary btn-sm">Browse inventory</Link>
            </div>
          ) : (
            <div className="vehicle-grid">
              {sold.map((v, i) => <VehicleCard key={v.id} vehicle={v} priority={i < 2} />)}
            </div>
          )}

          {available.vehicles.length > 0 && (
            <section aria-labelledby="avail-heading" className="mt-12 border-t border-line pt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Available now</p>
                  <h2 id="avail-heading" className="section-title mt-2">Still on the lot <span className="highlight">today</span></h2>
                </div>
                <Link href="/inventory" className="btn-secondary btn-sm">See all {available.total} vehicles</Link>
              </div>
              <div className="vehicle-grid">
                {available.vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} headingLevel="h3" />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

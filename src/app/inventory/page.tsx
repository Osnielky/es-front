import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { getInventoryFacets, getVehicles, VEHICLE_SORTS, type VehicleSort } from '@/lib/data'
import { buildBreadcrumbJsonLd, buildInventoryJsonLd, LOCATION } from '@/lib/seo'
import VehicleCard from '@/components/inventory/VehicleCard'
import VehicleFilters from '@/components/inventory/VehicleFilters'
import SortSelect from '@/components/inventory/SortSelect'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Force dynamic rendering - requires database connection
export const dynamic = 'force-dynamic'

type SearchParams = {
  make?: string
  model?: string
  bodyStyle?: string
  yearMin?: string
  yearMax?: string
  priceMin?: string
  priceMax?: string
  mileageMax?: string
  condition?: string
  sort?: string
  page?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const condition = params.condition

  let title = `Used Cars for Sale in ${LOCATION.city}, ${LOCATION.stateCode}`
  let description = `Browse every vehicle on the lot at ${DEALER_NAME} in ${LOCATION.city}, Florida. Inspected, priced honestly, financing for every credit. Serving ${LOCATION.nearbyAreas.slice(0, 3).join(', ')}, and all of Southwest Florida.`

  if (condition === 'NEW') {
    title = 'New Cars for Sale in Naples, FL'
    description = `Browse our selection of brand new cars for sale in Naples, Florida at ${DEALER_NAME}.`
  } else if (condition === 'CERTIFIED') {
    title = 'Certified Pre-Owned Cars in Naples, FL'
    description = `Certified pre-owned vehicles for sale in Naples, Florida at ${DEALER_NAME}.`
  } else if (params.bodyStyle) {
    title = `Used ${params.bodyStyle}s for Sale in Naples, FL`
  } else if (params.make) {
    title = `Used ${params.make} for Sale in Naples, FL`
  }

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/inventory${condition ? `?condition=${condition}` : ''}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/inventory`,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

const SORT_VALUES = VEHICLE_SORTS.map((s) => s.value)

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const limit = 12
  const sort: VehicleSort = SORT_VALUES.includes(params.sort as VehicleSort) ? (params.sort as VehicleSort) : 'newest'

  let vehicles: Awaited<ReturnType<typeof getVehicles>>['vehicles'] = []
  let total = 0
  let makes: string[] = []
  let bodyStyles: string[] = []
  try {
    const [result, facets] = await Promise.all([
      getVehicles({
        make: params.make,
        model: params.model,
        bodyStyle: params.bodyStyle,
        condition: params.condition,
        yearMin: params.yearMin ? Number(params.yearMin) : undefined,
        yearMax: params.yearMax ? Number(params.yearMax) : undefined,
        priceMin: params.priceMin ? Number(params.priceMin) : undefined,
        priceMax: params.priceMax ? Number(params.priceMax) : undefined,
        mileageMax: params.mileageMax ? Number(params.mileageMax) : undefined,
        sort,
        page,
        limit,
      }),
      getInventoryFacets(),
    ])
    vehicles = result.vehicles
    total = result.total
    makes = facets.makes
    bodyStyles = facets.bodyStyles
  } catch (error) {
    console.error('Inventory: failed to fetch vehicles', error)
  }

  const totalPages = Math.ceil(total / limit)

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
  ])
  const inventoryJsonLd = buildInventoryJsonLd(vehicles)

  const heading = params.bodyStyle
    ? `Used ${params.bodyStyle}s in ${LOCATION.city}`
    : params.make
    ? `Used ${params.make} in ${LOCATION.city}`
    : params.condition === 'NEW'
    ? `New cars in ${LOCATION.city}`
    : params.condition === 'CERTIFIED'
    ? `Certified pre-owned in ${LOCATION.city}`
    : `Used cars for sale in ${LOCATION.city}`

  // Pagination keeps every active filter
  const pageHref = (p: number) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== 'page') q.set(k, v)
    })
    if (p > 1) q.set('page', String(p))
    const qs = q.toString()
    return qs ? `/inventory?${qs}` : '/inventory'
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(inventoryJsonLd) }} />

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4 pt-7">
          <div>
            <h1 className="font-display text-[32px] font-bold leading-none sm:text-[40px]">{heading}</h1>
            <p className="mt-1.5 text-slate-500">
              {total} {total === 1 ? 'vehicle' : 'vehicles'} on the lot. Prices exclude tax, tag and title.
            </p>
          </div>
          <SortSelect value={sort} options={VEHICLE_SORTS} />
        </div>

        <div className="grid gap-6 pb-12 lg:grid-cols-[250px_minmax(0,1fr)]">
          <VehicleFilters searchParams={params} makes={makes} bodyStyles={bodyStyles} />

          <div>
            {vehicles.length === 0 ? (
              <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
                <Search className="h-9 w-9 text-slate-400" />
                <h2 className="mt-3 font-display text-2xl font-bold">No vehicles match those filters</h2>
                <p className="mt-1 max-w-[40ch] text-sm text-slate-500">Try a wider price or mileage range, or message us. We get new cars every week.</p>
                <Link href="/inventory" className="btn-secondary btn-sm mt-5">Show every vehicle</Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((vehicle, i) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 3} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-8 flex justify-center gap-1.5" aria-label="Pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`grid h-10 min-w-[40px] place-items-center rounded border font-semibold ${
                      p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-ink hover:border-ink'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

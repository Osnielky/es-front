import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, LayoutGrid, List, MessageSquareMore } from 'lucide-react'
import { getVehicles, getInventoryFacets, VEHICLE_SORTS, isVehicleSort } from '@/lib/data'
import { buildBreadcrumbJsonLd, buildInventoryJsonLd, LOCATION, DEFAULT_OG_IMAGE, makePath, bodyStylePath, serializeJsonLd } from '@/lib/seo'
import { FINANCE_DISCLAIMER } from '@/lib/finance'
import VehicleCard from '@/components/inventory/VehicleCard'
import VehicleFilters from '@/components/inventory/VehicleFilters'
import { CompareModeToggle, CompareTray, SavedCarsMenu, SortSelect } from '@/components/inventory/ShortlistControls'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Force dynamic rendering - requires database connection
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12
// Filters that only narrow results (price/year/model ranges, search) produce near-duplicate pages: noindex them.
// sort/view never appear in the canonical, so they can't create indexable duplicates either.
const NARROWING_FILTERS = ['model', 'yearMin', 'yearMax', 'priceMin', 'priceMax', 'mileageMax', 'q'] as const
const PRICE_SLIDER_FLOOR = 50000

function inventoryHref(params: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (value && !(key === 'page' && value === '1')) query.set(key, value)
  }
  const qs = query.toString()
  return `/inventory${qs ? `?${qs}` : ''}`
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const condition = params.condition
  
  let title = 'Cars for Sale in Naples, FL'
  let description = `Browse our full inventory of new and used cars for sale in Naples, Florida. Find your perfect vehicle at ${DEALER_NAME}. Serving ${LOCATION.nearbyAreas.slice(0, 3).join(', ')}, and all of Southwest Florida.`
  
  if (condition === 'NEW') {
    title = 'New Cars for Sale in Naples, FL'
    description = `Browse our selection of brand new cars for sale in Naples, Florida. Latest models with full warranty at ${DEALER_NAME}. Competitive pricing and easy financing available.`
  } else if (condition === 'USED') {
    title = 'Used Cars for Sale in Naples, FL'
    description = `Quality used cars for sale in Naples, Florida. Inspected, affordable, and ready to drive. ${DEALER_NAME} offers the best selection of pre-owned vehicles in Collier County.`
  } else if (condition === 'CERTIFIED') {
    title = 'Certified Pre-Owned Cars in Naples, FL'
    description = `Certified pre-owned vehicles for sale in Naples, Florida. Extended warranty, low mileage, and peace of mind at ${DEALER_NAME}. Premium quality CPO cars.`
  }
  
  const keywords = [
    'cars for sale Naples FL',
    'buy car Naples Florida',
    condition ? `${condition.toLowerCase()} cars Naples` : 'vehicles Naples FL',
    params.make ? `${params.make} dealer Naples` : 'car dealership Naples',
    'auto dealer Naples FL',
    'Southwest Florida cars',
    ...LOCATION.nearbyAreas.map(area => `cars for sale ${area}`),
  ]
  
  const page = Number(params.page ?? 1)
  if (page > 1) title = `${title} – Page ${page}`
  // Make / body-style filters consolidate onto their landing pages; otherwise canonical = condition + page
  const canonical = params.make && !params.condition
    ? `${SITE_URL}${makePath(params.make)}`
    : params.bodyStyle && !params.condition
      ? `${SITE_URL}${bodyStylePath(params.bodyStyle)}`
      : `${SITE_URL}${inventoryHref({ condition, page: params.page })}`
  const isNarrowed = NARROWING_FILTERS.some((key) => params[key])

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: { canonical },
    robots: isNarrowed ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

interface Props {
  searchParams: Promise<{
    make?: string
    model?: string
    yearMin?: string
    yearMax?: string
    priceMin?: string
    priceMax?: string
    condition?: string
    bodyStyle?: string
    mileageMax?: string
    q?: string
    sort?: string
    view?: string
    page?: string
  }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1) || 1)
  const limit = PAGE_SIZE
  const sort = isVehicleSort(params.sort) ? params.sort : 'newest'
  const layout = params.view === 'list' ? 'list' : 'grid'
  const q = params.q?.trim().slice(0, 80) || undefined

  let vehicles: Awaited<ReturnType<typeof getVehicles>>['vehicles'] = []
  let total = 0
  try {
    const result = await getVehicles({
      make: params.make,
      model: params.model,
      condition: params.condition,
      bodyStyle: params.bodyStyle,
      yearMin: params.yearMin ? Number(params.yearMin) : undefined,
      yearMax: params.yearMax ? Number(params.yearMax) : undefined,
      priceMin: params.priceMin ? Number(params.priceMin) : undefined,
      priceMax: params.priceMax ? Number(params.priceMax) : undefined,
      mileageMax: params.mileageMax ? Number(params.mileageMax) : undefined,
      q,
      sort,
      page,
      limit,
    })
    vehicles = result.vehicles
    total = result.total
  } catch (error) {
    console.error('Inventory: failed to fetch vehicles', error)
  }

  const totalPages = Math.ceil(total / limit)
  const facets = await getInventoryFacets().catch(() => ({ makes: [], bodyStyles: [], yearMin: null, yearMax: null, priceMax: 0 }))
  // Slider tops out at the most expensive car (rounded up to $5k), never below $50k
  const priceCeiling = Math.max(PRICE_SLIDER_FLOOR, Math.ceil(facets.priceMax / 5000) * 5000)

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
  ])
  const inventoryJsonLd = buildInventoryJsonLd(vehicles, { offset: (page - 1) * limit })

  const conditionWord = params.condition === 'NEW' ? 'new ' : params.condition === 'USED' ? 'used ' : params.condition === 'CERTIFIED' ? 'certified pre-owned ' : ''
  // Filters carried through a keyword search (the search box resets paging but keeps other filters)
  const carried = Object.entries(params).filter(([k, v]) => v && !['q', 'page'].includes(k))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(inventoryJsonLd) }} />

      <div className="theme-sand min-h-screen">
        {/* Hero band */}
        <section className="relative overflow-hidden border-b border-sand-200">
          <HeroArt />
          <div className="relative mx-auto max-w-screen-2xl px-4 pb-8 pt-6 sm:pb-10">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-navy">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li className="font-semibold text-navy" aria-current="page">Inventory</li>
              </ol>
            </nav>

            <div className="mt-3 flex flex-col gap-4 lg:max-w-3xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Find your next {conditionWord}car.</h1>
                  <p className="mt-2 text-lg text-gray-700">
                    Browse our available vehicles in {LOCATION.city}, {LOCATION.stateCode} and find your perfect fit.
                  </p>
                </div>
                <SavedCarsMenu />
              </div>

              <form action="/inventory" method="get" role="search" className="flex overflow-hidden rounded-xl border border-sand-200 bg-ivory shadow-sm focus-within:ring-2 focus-within:ring-navy-100">
                {carried.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
                <label htmlFor="inventory-search" className="sr-only">Search by make, model, or keyword</label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy" aria-hidden="true" />
                  <input
                    id="inventory-search"
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder="Search by make, model, or keyword"
                    className="h-full w-full bg-transparent py-3.5 pl-12 pr-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="bg-navy px-6 text-sm font-semibold text-white hover:bg-navy-800 sm:px-9">
                  Search
                </button>
              </form>
            </div>
          </div>
        </section>

        <div id="results" className="mx-auto max-w-screen-2xl scroll-mt-28 px-4 py-8">
          <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
            <aside aria-label="Filter vehicles" className="lg:sticky lg:top-28 lg:self-start">
              <VehicleFilters
                searchParams={params}
                makes={facets.makes}
                bodyStyles={facets.bodyStyles}
                yearMin={facets.yearMin}
                yearMax={facets.yearMax}
                priceCeiling={priceCeiling}
              />
            </aside>

            <div>
              {/* Toolbar */}
              <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <h2 className="text-2xl font-bold text-navy" aria-live="polite">
                  {total} {total === 1 ? 'vehicle' : 'vehicles'} available
                  {q && <span className="font-medium text-gray-600"> for &ldquo;{q}&rdquo;</span>}
                </h2>
                <CompareModeToggle />
                <div className="ml-auto flex items-center gap-2">
                  <SortSelect value={sort} options={Object.entries(VEHICLE_SORTS).map(([value, { label }]) => ({ value, label }))} />
                  <div className="flex rounded-xl border border-sand-200 bg-ivory p-1" role="group" aria-label="Layout">
                    {([['grid', LayoutGrid, 'Grid view'], ['list', List, 'List view']] as const).map(([mode, Icon, label]) => (
                      <Link
                        key={mode}
                        href={inventoryHref(params, { view: mode === 'grid' ? undefined : mode })}
                        scroll={false}
                        aria-label={label}
                        aria-current={layout === mode ? 'true' : undefined}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${layout === mode ? 'bg-navy text-white' : 'text-navy hover:bg-sand'}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {vehicles.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sand">
                    <Search className="h-8 w-8 text-navy" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-800">No vehicles found</h3>
                  <p className="mt-1 text-sm text-gray-600">Try a different search or adjust your filters.</p>
                  <Link href="/inventory" className="btn-secondary mt-5">Clear search &amp; filters</Link>
                </div>
              ) : (
                <div className={layout === 'list' ? 'space-y-6' : 'vehicle-grid'}>
                  {vehicles.map((vehicle, i) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} layout={layout} priority={i < 2} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav aria-label="Inventory pages" className="mt-10 flex flex-wrap justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={inventoryHref(params, { page: String(p) })}
                      aria-current={p === page ? 'page' : undefined}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        p === page ? 'bg-navy text-white' : 'border border-sand-200 bg-ivory text-gray-700 hover:border-navy-200 hover:text-navy'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </nav>
              )}

              {vehicles.length > 0 && <p className="mt-5 text-center text-xs text-gray-600">* {FINANCE_DISCLAIMER}</p>}

              {/* Help banner */}
              <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-sand-200 bg-sand-200/60 p-5 sm:flex-row sm:items-center">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-ivory">
                  <MessageSquareMore className="h-6 w-6 text-navy" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-navy">Need help choosing?</h2>
                  <p className="text-sm text-gray-700">Our team is here to help you find the right fit.</p>
                </div>
                <Link href="/contact" className="rounded-xl border-2 border-navy bg-ivory px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
                  Talk to our team
                </Link>
              </div>

              {/* Crawlable links into make / body-style landing pages */}
              {(facets.makes.length > 0 || facets.bodyStyles.length > 0) && (
                <section aria-labelledby="shop-by-heading" className="mt-10 border-t border-sand-200 pt-8">
                  <h2 id="shop-by-heading" className="text-lg font-bold text-navy">Shop by make</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {facets.makes.map((make) => (
                      <li key={make.slug}>
                        <Link href={makePath(make.name)} className="inline-block rounded-full border border-sand-200 bg-ivory px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-200 hover:text-navy">
                          {make.name} <span className="text-gray-400">({make.count})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {facets.bodyStyles.length > 0 && (
                    <>
                      <h2 className="mt-6 text-lg font-bold text-navy">Shop by body style</h2>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {facets.bodyStyles.map((style) => (
                          <li key={style.slug}>
                            <Link href={bodyStylePath(style.name)} className="inline-block rounded-full border border-sand-200 bg-ivory px-4 py-2 text-sm font-medium text-gray-700 hover:border-navy-200 hover:text-navy">
                              {style.name} <span className="text-gray-400">({style.count})</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <CompareTray />
    </>
  )
}

// Decorative coastal road + palms for the hero band (pure SVG, no image request)
function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block">
      <svg viewBox="0 0 600 300" preserveAspectRatio="xMaxYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="hero-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#F3EBDD" />
            <stop offset="0.35" stopColor="#F3EBDD" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M120 300 C 260 250, 330 190, 600 170 L 600 215 C 380 225, 300 270, 230 300 Z" fill="#E8DCC5" />
        <path d="M175 300 C 300 255, 360 205, 600 190" fill="none" stroke="#FFFDF8" strokeWidth="3" strokeDasharray="14 12" />
        <path d="M60 300 C 230 230, 320 150, 600 130" fill="none" stroke="#D9C7A6" strokeWidth="2" opacity="0.6" />
        {[{ x: 470, h: 150, s: 1 }, { x: 540, h: 185, s: 1.15 }].map(({ x, h, s }) => (
          <g key={x} fill="#D9C7A6" opacity="0.8">
            <path d={`M${x} 300 C ${x - 4} ${300 - h * 0.5}, ${x + 6} ${300 - h * 0.8}, ${x + 2} ${300 - h}`} stroke="#D9C7A6" strokeWidth={6 * s} fill="none" />
            {[-70, -30, 10, 50, 95, 140].map((angle) => (
              <ellipse key={angle} cx={x + 2} cy={300 - h} rx={38 * s} ry={7 * s} transform={`rotate(${angle} ${x + 2} ${300 - h}) translate(${30 * s} 0)`} />
            ))}
          </g>
        ))}
        <rect width="600" height="300" fill="url(#hero-fade)" />
      </svg>
      <p className="absolute right-[38%] top-[58%] hidden -translate-y-1/2 text-left text-xs font-semibold uppercase leading-5 tracking-[0.3em] text-navy xl:block">
        Great cars
        <br />
        Brighter journeys
        <span className="mt-3 block h-px w-8 bg-navy" />
      </p>
    </div>
  )
}

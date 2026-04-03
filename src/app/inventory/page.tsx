import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { getVehicles } from '@/lib/data'
import { buildBreadcrumbJsonLd, buildInventoryJsonLd, LOCATION } from '@/lib/seo'
import VehicleCard from '@/components/inventory/VehicleCard'
import VehicleFilters from '@/components/inventory/VehicleFilters'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Force dynamic rendering - requires database connection
export const dynamic = 'force-dynamic'

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
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `${SITE_URL}/inventory${condition ? `?condition=${condition}` : ''}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/inventory`,
      type: 'website',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: title }],
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
    page?: string
  }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = 12

  const { vehicles, total } = await getVehicles({
    make: params.make,
    model: params.model,
    condition: params.condition,
    yearMin: params.yearMin ? Number(params.yearMin) : undefined,
    yearMax: params.yearMax ? Number(params.yearMax) : undefined,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    page,
    limit,
  })

  const totalPages = Math.ceil(total / limit)
  
  // Build structured data
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
  ])
  const inventoryJsonLd = buildInventoryJsonLd(vehicles)
  
  // SEO-friendly condition text
  const conditionText = params.condition === 'NEW' ? 'New' : params.condition === 'USED' ? 'Used' : params.condition === 'CERTIFIED' ? 'Certified Pre-Owned' : 'All'

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(inventoryJsonLd) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                  Our Inventory
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {conditionText === 'All' ? 'Browse All Vehicles' : `${conditionText} Vehicles`}
                </h1>
                <p className="mt-2 text-gray-600 max-w-xl">
                  Explore our selection of quality vehicles. Each car is thoroughly inspected and competitively priced.
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                  <p className="text-gray-500">Available</p>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-600">100%</p>
                  <p className="text-gray-500">Inspected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 py-8">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
            {/* Filters sidebar */}
            <aside>
              <VehicleFilters searchParams={params} />
            </aside>

            {/* Results */}
            <div>
              {vehicles.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-gray-800">No vehicles found</h2>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/inventory?page=${p}`}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        p === page
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-700'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

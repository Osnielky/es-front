import type { Metadata } from 'next'
import { Car } from 'lucide-react'
import { getVehicles } from '@/lib/data'
import VehicleCard from '@/components/inventory/VehicleCard'
import VehicleFilters from '@/components/inventory/VehicleFilters'

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Browse our full inventory of new and used vehicles. Filter by make, model, year, price and more.',
}

interface Props {
  searchParams: {
    make?: string
    model?: string
    yearMin?: string
    yearMax?: string
    priceMin?: string
    priceMax?: string
    condition?: string
    page?: string
  }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-4 py-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Vehicle Inventory
              </h1>
              <p className="text-sm text-gray-500">
                {total} vehicle{total !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* Filters sidebar */}
          <aside>
            <VehicleFilters searchParams={searchParams} />
          </aside>

          {/* Results */}
          <div>
            {vehicles.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <Car className="h-8 w-8 text-gray-400" />
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
  )
}

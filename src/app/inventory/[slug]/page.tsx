import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft, Gauge, Fuel, Calendar, Settings2, Car,
  Palette, Armchair, Hash, Activity, CheckCircle2,
} from 'lucide-react'
import { getVehicleBySlug } from '@/lib/data'
import { buildVehicleTitle, buildVehicleDescription, buildVehicleJsonLd } from '@/lib/seo'
import LeadForm from '@/components/leads/LeadForm'
import VehicleGallery from '@/components/inventory/VehicleGallery'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicleBySlug(params.slug)
  if (!vehicle) return { title: 'Vehicle Not Found' }

  return {
    title: buildVehicleTitle(vehicle.year, vehicle.make, vehicle.model, vehicle.trim),
    description: buildVehicleDescription(
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.price,
      vehicle.mileage
    ),
    openGraph: {
      images: vehicle.images[0] ? [{ url: vehicle.images[0] }] : [],
    },
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const vehicle = await getVehicleBySlug(params.slug)
  if (!vehicle || vehicle.status === 'SOLD') notFound()

  const jsonLd = buildVehicleJsonLd(vehicle)
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  const conditionClass =
    vehicle.condition === 'NEW'
      ? 'badge-new'
      : vehicle.condition === 'CERTIFIED'
      ? 'badge-certified'
      : 'badge-used'

  const specs = [
    { icon: Gauge, label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType },
    { icon: Calendar, label: 'Year', value: String(vehicle.year) },
    { icon: Settings2, label: 'Transmission', value: vehicle.transmission },
    { icon: Activity, label: 'Engine', value: vehicle.engine },
    { icon: Palette, label: 'Exterior', value: vehicle.exteriorColor },
    { icon: Armchair, label: 'Interior', value: vehicle.interiorColor },
    { icon: Hash, label: 'VIN', value: vehicle.vin },
  ].filter((s) => s.value)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="border-b bg-white px-4 py-3">
          <div className="mx-auto flex max-w-6xl items-center gap-1.5 text-sm text-gray-500">
            <Link href="/inventory" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Inventory
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900 truncate max-w-[220px]">{title}</span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left column */}
            <div className="space-y-6">
              {/* Gallery */}
              <div className="card overflow-hidden">
                {vehicle.images.length > 0 ? (
                  <div className="space-y-3">
                    {/* Main image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={vehicle.images[0]}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    
                    {/* Thumbnail gallery */}
                    {vehicle.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {vehicle.images.map((url, idx) => (
                          <button
                            key={idx}
                            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 ring-2 ring-transparent hover:ring-brand-300 transition-all"
                          >
                            <Image
                              src={url}
                              alt={`${title} ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title + price */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2">
                    <span className={conditionClass}>{vehicle.condition}</span>
                    {vehicle.bodyStyle && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {vehicle.bodyStyle}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                    {title}
                    {vehicle.trim && (
                      <span className="ml-2 text-xl font-medium text-gray-400">{vehicle.trim}</span>
                    )}
                  </h1>
                </div>
                <div className="rounded-2xl bg-brand-600 px-5 py-2 text-right">
                  <span className="block text-xs font-medium uppercase tracking-wider text-brand-200">Price</span>
                  <span className="text-2xl font-extrabold text-white">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Specs grid */}
              <div>
                <h2 className="section-title mb-3 text-base">Specifications</h2>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="card flex items-center gap-3 p-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50">
                        <Icon className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
                        <dd className="mt-0.5 truncate text-sm font-bold text-gray-900">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div>
                  <h2 className="section-title mb-2 text-base">Description</h2>
                  <p className="text-sm leading-relaxed text-gray-600">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features.length > 0 && (
                <div>
                  <h2 className="section-title mb-3 text-base">Features &amp; Options</h2>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {vehicle.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky sidebar — lead form */}
            <aside className="mt-8 lg:mt-0">
              <div className="sticky top-4">
                <LeadForm vehicleId={vehicle.id} vehicleName={title} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

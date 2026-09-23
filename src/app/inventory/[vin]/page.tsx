import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import {
  Gauge, Fuel, Calendar, Settings2, Palette, Armchair, Hash, Activity, CheckCircle2,
  Car, Phone, MessageSquare, BadgeDollarSign, Repeat, ChevronRight,
} from 'lucide-react'
import { getVehicleBySlug, getVehicleByVin, getSimilarVehicles } from '@/lib/data'
import {
  buildVehicleTitle, buildVehicleDescription, buildVehicleJsonLd, buildBreadcrumbJsonLd, buildVehicleKeywords,
  DEFAULT_OG_IMAGE, absoluteImageUrl, vehiclePath, vehicleUrl, stockNumber, makePath, modelPath, serializeJsonLd,
} from '@/lib/seo'
import { TEL_HREF } from '@/lib/contact'
import { estimateMonthlyPayment, FINANCE_DISCLAIMER } from '@/lib/finance'
import type { Vehicle } from '@/types'
import VehicleDetailGallery from '@/components/inventory/VehicleDetailGallery'
import VehicleCard from '@/components/inventory/VehicleCard'
import WhatsAppButton from '@/components/inventory/WhatsAppButton'
import LeadForm from '@/components/leads/LeadForm'

// ISR: VDPs render on first request, then serve from cache. Admin edits call revalidateTag('vehicles').
export const revalidate = 300
export async function generateStaticParams() {
  return []
}

interface Props {
  params: Promise<{ vin: string }>
}

async function getVehicle(slugOrVin: string) {
  return (await getVehicleByVin(slugOrVin)) ?? (await getVehicleBySlug(slugOrVin))
}

function vehicleName(vehicle: Pick<Vehicle, 'year' | 'make' | 'model' | 'trim'>) {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vin } = await params
  const vehicle = await getVehicle(decodeURIComponent(vin))
  if (!vehicle) return { title: 'Vehicle Not Found', robots: { index: false } }

  const title = buildVehicleTitle(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)
  const description = buildVehicleDescription(vehicle.year, vehicle.make, vehicle.model, vehicle.price, vehicle.mileage)
  const url = vehicleUrl(vehicle)
  const image = (vehicle.images[0] && absoluteImageUrl(vehicle.images[0])) || DEFAULT_OG_IMAGE
  const availability = vehicle.status === 'SOLD' ? 'out of stock' : vehicle.status === 'PENDING' ? 'pending' : 'in stock'

  return {
    // Absolute: the vehicle title already ends with the dealer name
    title: { absolute: title },
    description,
    keywords: buildVehicleKeywords(vehicle.year, vehicle.make, vehicle.model, vehicle.condition),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales',
      locale: 'en_US',
      images: [{ url: image, alt: `${vehicleName(vehicle)} for sale in Naples, FL` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    other: {
      'product:price:amount': String(vehicle.price),
      'product:price:currency': 'USD',
      'product:availability': availability,
      'product:condition': vehicle.condition === 'NEW' ? 'new' : 'used',
    },
  }
}

export default async function VehicleDetailPage({ params }: Props) {
  const { vin } = await params
  const requested = decodeURIComponent(vin)
  const vehicle = await getVehicle(requested)
  if (!vehicle) notFound()

  // One URL per vehicle: slug or lowercase-VIN URLs 308 to the canonical VIN URL
  const canonicalPath = vehiclePath(vehicle)
  if (requested !== canonicalPath.split('/').pop()) permanentRedirect(canonicalPath)

  const similar = await getSimilarVehicles(vehicle, 3).catch(() => [])

  const name = vehicleName(vehicle)
  const shortName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const stock = stockNumber(vehicle)
  const isSold = vehicle.status === 'SOLD'
  const estMonthly = estimateMonthlyPayment(vehicle.price)

  const jsonLd = buildVehicleJsonLd(vehicle)
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
    { name: vehicle.make, url: makePath(vehicle.make) },
    { name: vehicle.model, url: modelPath(vehicle.make, vehicle.model) },
    { name: shortName, url: canonicalPath },
  ]
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs)

  const conditionClass =
    vehicle.condition === 'NEW' ? 'badge-new' : vehicle.condition === 'CERTIFIED' ? 'badge-certified' : 'badge-used'

  const specs = [
    { icon: Gauge, label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null },
    { icon: Calendar, label: 'Year', value: String(vehicle.year) },
    { icon: Car, label: 'Body Style', value: vehicle.bodyStyle },
    { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType },
    { icon: Settings2, label: 'Transmission', value: vehicle.transmission },
    { icon: Activity, label: 'Engine', value: vehicle.engine },
    { icon: Palette, label: 'Exterior', value: vehicle.exteriorColor },
    { icon: Armchair, label: 'Interior', value: vehicle.interiorColor },
    { icon: Hash, label: 'Stock #', value: stock },
    { icon: Hash, label: 'VIN', value: vehicle.vin },
  ].filter((s) => s.value)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <div className="theme-sand min-h-screen">
        <nav className="border-b bg-ivory px-4 py-3" aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto whitespace-nowrap text-sm text-gray-500">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <li key={crumb.url} className="flex items-center gap-1.5">
                  {isLast ? (
                    <span className="font-medium text-gray-900" aria-current="page">{crumb.name}</span>
                  ) : (
                    <>
                      <Link href={crumb.url} className="hover:text-navy-800 transition-colors">{crumb.name}</Link>
                      <span aria-hidden="true">/</span>
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="mx-auto max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr] lg:gap-x-8">
          {/* Mobile order: images → price → title → specs → lead CTA → financing → description */}
          <div className="space-y-6 lg:col-start-1 lg:row-start-1">
            {isSold && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center" role="status">
                <p className="text-lg font-bold text-red-700">This vehicle has been sold</p>
                <p className="mt-1 text-sm text-red-600">
                  See <a href="#similar" className="font-medium underline hover:text-red-800">similar vehicles</a> or browse our{' '}
                  <Link href="/inventory" className="font-medium underline hover:text-red-800">current inventory</Link>.
                </p>
              </div>
            )}
            {vehicle.status === 'PENDING' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center" role="status">
                <p className="text-lg font-bold text-amber-700">Sale pending</p>
                <p className="mt-1 text-sm text-amber-600">
                  This vehicle is under contract. <a href="#inquire" className="font-medium underline hover:text-amber-800">Contact us</a> to be next in line.
                </p>
              </div>
            )}

            <VehicleDetailGallery
              images={vehicle.images}
              alt={`${name} for sale in Naples, FL`}
              vehicleInfo={{
                year: vehicle.year,
                make: vehicle.make,
                model: vehicle.model,
                price: vehicle.price,
                vin: vehicle.vin || 'N/A',
              }}
              isSold={isSold}
            />

            <header className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {isSold && <span className="badge bg-red-600 uppercase tracking-wider text-white">Sold</span>}
                  {vehicle.status === 'PENDING' && <span className="badge bg-amber-500 uppercase tracking-wider text-white">Pending</span>}
                  <span className={conditionClass}>{vehicle.condition === 'CERTIFIED' ? 'Certified Pre-Owned' : vehicle.condition}</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  {shortName}
                  {vehicle.trim && <span className="ml-2 text-xl font-medium text-gray-500">{vehicle.trim}</span>}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {vehicle.mileage.toLocaleString()} miles · Stock #{stock} · Naples, FL
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-3xl font-extrabold text-gray-900">${vehicle.price.toLocaleString()}</p>
                {!isSold && estMonthly > 0 && (
                  <p className="mt-0.5 text-sm font-medium text-navy">
                    Est. ${estMonthly.toLocaleString()}/mo<sup className="text-gray-400">*</sup>
                  </p>
                )}
              </div>
            </header>

            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="mb-3 text-lg font-bold text-gray-900">Specifications</h2>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  // dt/dd must be direct children of the dl's div, so the icon lives inside the dt
                  <div key={label} className="card relative flex min-h-[3.75rem] flex-col justify-center py-3 pl-[3.75rem] pr-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <span className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-navy-50" aria-hidden="true">
                        <Icon className="h-4 w-4 text-navy" />
                      </span>
                      {label}
                    </dt>
                    <dd className="mt-0.5 break-words text-sm font-bold text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Lead capture + financing: after specs on mobile, sticky sidebar on desktop */}
          <aside className="mt-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <div className="space-y-4 lg:sticky lg:top-28">
              {!isSold && (
                <div id="inquire" className="scroll-mt-28">
                  <LeadForm
                    vehicleId={vehicle.id}
                    vehicleName={shortName}
                    defaultMessage={`Hi, is the ${name} (Stock #${stock}) still available? I'd like to schedule a test drive.`}
                  />
                </div>
              )}

              <div className="card p-5">
                <h2 className="text-base font-bold text-gray-900">Make it yours</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/financing" className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3 font-semibold text-navy hover:bg-navy-100 transition-colors">
                      <span className="flex items-center gap-2"><BadgeDollarSign className="h-4 w-4" aria-hidden="true" /> Get pre-approved</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/trade-in" className="flex items-center justify-between rounded-xl bg-sand px-4 py-3 font-semibold text-gray-700 hover:bg-sand-200 transition-colors">
                      <span className="flex items-center gap-2"><Repeat className="h-4 w-4" aria-hidden="true" /> Value your trade-in</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                  <li>
                    <a href={TEL_HREF} className="flex items-center justify-between rounded-xl bg-sand px-4 py-3 font-semibold text-gray-700 hover:bg-sand-200 transition-colors">
                      <span className="flex items-center gap-2"><Phone className="h-4 w-4" aria-hidden="true" /> Call the dealership</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                </ul>
                {!isSold && estMonthly > 0 && <p className="mt-3 text-xs leading-relaxed text-gray-500">* {FINANCE_DISCLAIMER}</p>}
              </div>
            </div>
          </aside>

          <div className="mt-6 space-y-6 lg:col-start-1 lg:row-start-2">
            {vehicle.description && (
              <section aria-labelledby="description-heading">
                <h2 id="description-heading" className="mb-2 text-lg font-bold text-gray-900">
                  About this {shortName}
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{vehicle.description}</p>
              </section>
            )}

            {vehicle.features.length > 0 && (
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="mb-3 text-lg font-bold text-gray-900">Features &amp; Options</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {vehicle.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-navy" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-sm text-gray-600">
              Shop more{' '}
              <Link href={modelPath(vehicle.make, vehicle.model)} className="font-medium text-navy underline">
                {vehicle.make} {vehicle.model}
              </Link>{' '}
              and{' '}
              <Link href={makePath(vehicle.make)} className="font-medium text-navy underline">
                {vehicle.make}
              </Link>{' '}
              vehicles for sale in Naples, FL.
            </p>
          </div>
        </div>

        {similar.length > 0 && (
          <section id="similar" aria-labelledby="similar-heading" className="scroll-mt-24 border-t border-sand-200 bg-ivory px-4 py-10">
            <div className="mx-auto max-w-6xl">
              <h2 id="similar-heading" className="text-2xl font-bold tracking-tight text-gray-900">Similar vehicles</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} headingLevel="h3" />
                ))}
              </div>
              <p className="mt-6 text-xs text-gray-500">* {FINANCE_DISCLAIMER}</p>
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile CTA bar */}
      {!isSold && (
        <div className="sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-ivory/95 px-3 py-2 backdrop-blur-md lg:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
            <a href={TEL_HREF} className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-navy py-3 text-sm font-semibold text-navy">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call
            </a>
            <WhatsAppButton
              vehicleId={vehicle.id}
              year={vehicle.year}
              make={vehicle.make}
              model={vehicle.model}
              trim={vehicle.trim}
              stockNumber={stock}
              label="WhatsApp"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-700 py-3 text-sm font-semibold text-white"
            />
            <a href="#inquire" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy py-3 text-sm font-semibold text-white">
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Inquire
            </a>
          </div>
        </div>
      )}
    </>
  )
}

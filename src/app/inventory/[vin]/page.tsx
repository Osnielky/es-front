import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, Clock, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react'
import { getVehicleBySlug, getVehicleByVin, getSimilarVehicles } from '@/lib/data'
import {
  buildVehicleTitle, buildVehicleDescription, buildVehicleJsonLd, buildBreadcrumbJsonLd, buildVehicleKeywords,
  DEFAULT_OG_IMAGE, absoluteImageUrl, vehiclePath, vehicleUrl, stockNumber, makePath, modelPath, serializeJsonLd,
  DEALER_ADDRESS, BUSINESS_HOURS, LOCATION,
} from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'
import { estimateMonthlyPayment, FINANCE_DISCLAIMER } from '@/lib/finance'
import { vehicleName } from '@/lib/vehicle-display'
import type { Vehicle } from '@/types'
import VehicleCard from '@/components/inventory/VehicleCard'
import { VdpProvider, InquiryButton, type VdpVehicle } from '@/components/vdp/VdpContext'
import VdpGallery from '@/components/vdp/VdpGallery'
import ContactPanel from '@/components/vdp/ContactPanel'
import MobileActionBar from '@/components/vdp/MobileActionBar'
import SaveShare from '@/components/vdp/SaveShare'
import SectionNav from '@/components/vdp/SectionNav'
import VehicleSpecs, { NOT_LISTED } from '@/components/vdp/VehicleSpecs'
import VinCopy from '@/components/vdp/VinCopy'
import Expandable from '@/components/vdp/Expandable'
import BackLink from '@/components/vdp/BackLink'

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

const CONDITION_LABEL: Record<Vehicle['condition'], string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified pre-owned',
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'details', label: 'Vehicle details' },
  { id: 'visit', label: 'Visit us' },
]

// Anchor targets land below the fixed header + sticky section nav
const SECTION_CLASS = 'scroll-mt-[calc(var(--header-h)+4.5rem)]'

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
  const estimate = vehicle.price > 0 ? estimateMonthlyPayment(vehicle.price) : 0
  const estMonthly = !isSold && estimate > 0 ? estimate : null

  const jsonLd = buildVehicleJsonLd(vehicle)
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
    { name: vehicle.make, url: makePath(vehicle.make) },
    { name: vehicle.model, url: modelPath(vehicle.make, vehicle.model) },
    { name: shortName, url: canonicalPath },
  ]
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs)

  const vdpVehicle: VdpVehicle = {
    id: vehicle.id,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    name,
    stock,
    vin: vehicle.vin || null,
    path: canonicalPath,
    url: vehicleUrl(vehicle),
    price: vehicle.price,
    estMonthly,
    image: vehicle.images[0],
    status: vehicle.status,
  }

  const details: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Year', value: vehicle.year },
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Trim', value: vehicle.trim },
    { label: 'Condition', value: CONDITION_LABEL[vehicle.condition] },
    { label: 'Mileage', value: `${vehicle.mileage.toLocaleString('en-US')} miles` },
    { label: 'Body style', value: vehicle.bodyStyle },
    { label: 'Engine', value: vehicle.engine },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Fuel type', value: vehicle.fuelType },
    { label: 'Exterior color', value: vehicle.exteriorColor },
    { label: 'Interior color', value: vehicle.interiorColor },
    ...(vehicle.cleanTitle ? [{ label: 'Title', value: 'Clean title (verified from title history)' }] : []),
    { label: 'Stock number', value: stock },
    { label: 'VIN', value: vehicle.vin ? <VinCopy vin={vehicle.vin} /> : null },
  ]

  const encodedAddress = encodeURIComponent(DEALER_ADDRESS)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <VdpProvider vehicle={vdpVehicle}>
        <div className="theme-glass vdp min-h-screen">
          <div className="mx-auto max-w-site px-4 pb-12 pt-3 sm:px-6 sm:pt-6 lg:px-4">
            {/* Title block: breadcrumb (back link on phones), name + title status, key facts, save/share */}
            <nav aria-label="Breadcrumb" className="hidden md:block">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ivory/75">
                {breadcrumbs.map((crumb, i) => {
                  const isLast = i === breadcrumbs.length - 1
                  return (
                    <li key={crumb.url} className="flex items-center gap-1.5">
                      {isLast ? (
                        <span className="font-medium text-ivory" aria-current="page">{crumb.name}</span>
                      ) : (
                        <>
                          <Link href={crumb.url} className="rounded transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">{crumb.name}</Link>
                          <ChevronRight className="h-3.5 w-3.5 text-ivory/45" aria-hidden="true" />
                        </>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>

            {/* Phones: [back link · save/share] above the title. From md: breadcrumb above, save/share beside the title. */}
            <header className="flex flex-wrap items-center gap-x-4 gap-y-2 md:mt-4 md:flex-nowrap md:items-end">
              <div className="md:hidden">
                <BackLink />
              </div>
              <div className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h1 className="min-w-0 break-words text-[1.75rem] font-bold leading-[1.15] tracking-tight text-ivory sm:text-[2rem] desk:text-[2.5rem]">
                    {name}
                  </h1>
                  {vehicle.cleanTitle && (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Clean title
                    </span>
                  )}
                  {isSold && <span className="rounded-full border border-red-300/30 bg-red-400/20 px-3 py-1 text-sm font-semibold text-red-100">Sold</span>}
                  {vehicle.status === 'PENDING' && <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-100">Sale pending</span>}
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9375rem] text-ivory/75">
                  <span>{vehicle.mileage.toLocaleString('en-US')} miles</span>
                  <span className="h-1 w-1 rounded-full bg-[#F0B27A]/70" aria-hidden="true" />
                  <span>Stock #{stock}</span>
                  <span className="h-1 w-1 rounded-full bg-[#F0B27A]/70" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-[#F0B27A]" aria-hidden="true" />
                    {LOCATION.city}, {LOCATION.stateCode}
                  </span>
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <SaveShare />
              </div>
            </header>

            {isSold && (
              <div className="mt-5 rounded-panel border border-red-300/30 bg-red-400/15 px-5 py-4 backdrop-blur-md" role="status">
                <p className="font-semibold text-red-100">This vehicle has been sold.</p>
                <p className="mt-1 text-sm text-red-100/90">
                  {similar.length > 0 && (
                    <>
                      See <a href="#similar" className="font-semibold underline">similar vehicles</a> or browse
                    </>
                  )}
                  {similar.length > 0 ? ' our ' : 'Browse our '}
                  <Link href="/inventory" className="font-semibold underline">current inventory</Link>.
                </p>
              </div>
            )}
            {vehicle.status === 'PENDING' && (
              <div className="mt-5 rounded-panel border border-amber-300/30 bg-amber-400/15 px-5 py-4 backdrop-blur-md" role="status">
                <p className="font-semibold text-amber-100">Sale pending</p>
                <p className="mt-1 text-sm text-amber-100/90">
                  This vehicle is under contract. Check availability to be first in line if the sale falls through.
                </p>
              </div>
            )}

            {/* Phones/tablets: gallery → contact panel → sections. From 1200px: gallery + sections left, sticky panel right. */}
            <div className="mt-5 grid gap-6 desk:mt-6 desk:grid-cols-[minmax(0,1fr)_minmax(22rem,27rem)] desk:grid-rows-[auto_1fr] desk:gap-x-8">
              <div className="min-w-0 desk:col-start-1 desk:row-start-1">
                <VdpGallery images={vehicle.images} name={name} />
              </div>

              <aside aria-label="Price and contact" className="desk:col-start-2 desk:row-span-2 desk:row-start-1">
                <div className="desk:sticky desk:top-[calc(var(--header-h)+1.5rem)] desk:max-h-[calc(100dvh-var(--header-h)-3rem)] desk:overflow-y-auto desk:overscroll-contain desk:rounded-panel">
                  <ContactPanel hasSimilar={similar.length > 0} />
                  {/* Fills the column under the panel on tall desktop screens; the full Visit us section stays below */}
                  <div className="vdp-panel mt-4 hidden p-5 desk:[@media(min-height:940px)]:block">
                    <p className="vdp-eyebrow">Visit us</p>
                    <address className="mt-2 flex items-start gap-2 text-[0.9375rem] not-italic leading-snug text-ivory">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F0B27A]" aria-hidden="true" />
                      <span>
                        {LOCATION.streetAddress}
                        <br />
                        {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}
                      </span>
                    </address>
                    <dl className="mt-3 space-y-1 text-sm">
                      {BUSINESS_HOURS.map((h) => (
                        <div key={h.label} className="flex justify-between gap-4">
                          <dt className="text-ivory/75">{h.label}</dt>
                          <dd className="font-semibold text-ivory">{h.display}</dd>
                        </div>
                      ))}
                    </dl>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-[#F0B27A] hover:text-[#f6c89c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Get directions
                    </a>
                  </div>
                </div>
              </aside>

              <div className="min-w-0 desk:col-start-1 desk:row-start-2">
                <SectionNav sections={SECTIONS} />

                <div className="mt-8 space-y-12">
                  <section id="overview" aria-labelledby="overview-heading" className={SECTION_CLASS}>
                    <p className="vdp-eyebrow">Overview</p>
                    <h2 id="overview-heading" className="vdp-heading mt-1">A closer look</h2>
                    <div className="mt-5">
                      <VehicleSpecs vehicle={vehicle} />
                    </div>
                    {vehicle.description && (
                      <div className="vdp-panel mt-5 p-5 sm:p-6">
                        <h3 className="text-lg font-semibold text-ivory">About this {shortName}</h3>
                        <div className="mt-2">
                          <Expandable collapsedHeight={168} moreLabel="Read more" lessLabel="Show less">
                            <p className="whitespace-pre-line text-base leading-relaxed text-ivory/90">{vehicle.description}</p>
                          </Expandable>
                        </div>
                      </div>
                    )}
                  </section>

                  <section id="features" aria-labelledby="features-heading" className={SECTION_CLASS}>
                    <p className="vdp-eyebrow">Features</p>
                    <h2 id="features-heading" className="vdp-heading mt-1">Features &amp; equipment</h2>
                    <div className="vdp-panel mt-5 p-5 sm:p-6">
                      {vehicle.features.length > 0 ? (
                        <Expandable collapsedHeight={220} moreLabel={`Show all ${vehicle.features.length} features`}>
                          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                            {vehicle.features.map((f) => (
                              <li key={f} className="flex items-start gap-2.5 text-base text-ivory/90">
                                <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#F0B27A]" aria-hidden="true" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </Expandable>
                      ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="max-w-prose text-base text-ivory/75">
                            The equipment list for this vehicle hasn’t been published yet. Ask us and we’ll send the full feature list.
                          </p>
                          {!isSold && (
                            <InquiryButton intent="availability" className="vdp-btn-outline flex-shrink-0">
                              Ask about features
                            </InquiryButton>
                          )}
                        </div>
                      )}
                    </div>
                  </section>

                  <section id="details" aria-labelledby="details-heading" className={SECTION_CLASS}>
                    <p className="vdp-eyebrow">Vehicle details</p>
                    <h2 id="details-heading" className="vdp-heading mt-1">The particulars</h2>
                    <dl className="vdp-panel mt-5 grid px-5 sm:grid-cols-2 sm:gap-x-10 sm:px-6">
                      {details.map(({ label, value }) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 border-b border-ivory/15 py-3.5 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                          <dt className="flex-shrink-0 text-[0.9375rem] text-ivory/75">{label}</dt>
                          <dd className="min-w-0 text-right text-[0.9375rem] font-semibold text-ivory">
                            {value ?? <span className="font-normal text-ivory/55">{NOT_LISTED}</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {estMonthly && (
                      <p id="finance-disclaimer" className="mt-4 text-sm leading-relaxed text-ivory/75">
                        * Est. ${estMonthly.toLocaleString('en-US')}/mo. {FINANCE_DISCLAIMER}
                      </p>
                    )}
                  </section>

                  <section id="visit" aria-labelledby="visit-heading" className={SECTION_CLASS}>
                    <p className="vdp-eyebrow">Visit us</p>
                    <h2 id="visit-heading" className="vdp-heading mt-1">See it in person</h2>
                    <div className="vdp-panel mt-5 grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-semibold text-ivory">
                          <MapPin className="h-5 w-5 text-[#F0B27A]" aria-hidden="true" />
                          {process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'}
                        </h3>
                        <address className="mt-2 text-base not-italic leading-relaxed text-ivory/90">
                          {LOCATION.streetAddress}
                          <br />
                          {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}
                        </address>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="vdp-btn-outline">
                            <Navigation className="h-4 w-4" aria-hidden="true" />
                            Get directions
                          </a>
                          <a href={TEL_HREF} className="vdp-btn-outline">
                            <Phone className="h-4 w-4" aria-hidden="true" />
                            {DEALER_PHONE}
                          </a>
                        </div>
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-semibold text-ivory">
                          <Clock className="h-5 w-5 text-[#F0B27A]" aria-hidden="true" />
                          Hours
                        </h3>
                        <dl className="mt-2 space-y-1.5 text-base">
                          {BUSINESS_HOURS.map((h) => (
                            <div key={h.label} className="flex justify-between gap-4 border-b border-ivory/15 pb-1.5 last:border-b-0">
                              <dt className="text-ivory/75">{h.label}</dt>
                              <dd className="font-semibold text-ivory">{h.display}</dd>
                            </div>
                          ))}
                        </dl>
                        {!isSold && (
                          <InquiryButton intent="test-drive" className="vdp-btn-primary mt-4 w-full">
                            Schedule a test drive
                          </InquiryButton>
                        )}
                      </div>
                    </div>
                    <p className="mt-5 text-sm text-ivory/75">
                      Shop more{' '}
                      <Link href={modelPath(vehicle.make, vehicle.model)} className="font-semibold text-[#F0B27A] underline underline-offset-2 hover:text-[#f6c89c]">
                        {vehicle.make} {vehicle.model}
                      </Link>{' '}
                      and{' '}
                      <Link href={makePath(vehicle.make)} className="font-semibold text-[#F0B27A] underline underline-offset-2 hover:text-[#f6c89c]">
                        {vehicle.make}
                      </Link>{' '}
                      vehicles for sale in {LOCATION.city}, {LOCATION.stateCode}.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {similar.length > 0 && (
            <section id="similar" aria-labelledby="similar-heading" className="scroll-mt-[var(--header-h)] border-t border-ivory/15 py-12">
              <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-4">
                <h2 id="similar-heading" className="vdp-heading">Similar vehicles</h2>
                <div className="vehicle-grid mt-6">
                  {similar.map((v) => (
                    <VehicleCard key={v.id} vehicle={v} headingLevel="h3" />
                  ))}
                </div>
                <p className="mt-6 text-xs text-ivory/70">* {FINANCE_DISCLAIMER}</p>
              </div>
            </section>
          )}
        </div>

        <MobileActionBar />
      </VdpProvider>
    </>
  )
}

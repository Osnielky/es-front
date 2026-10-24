import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, Phone, CalendarCheck } from 'lucide-react'
import { getVehicleBySlug, getVehicleByVin, getRelatedVehicles } from '@/lib/data'
import { buildVehicleTitle, buildVehicleDescription, buildVehicleJsonLd, buildBreadcrumbJsonLd, buildVehicleKeywords, LOCATION } from '@/lib/seo'
import VehicleDetailGallery from '@/components/inventory/VehicleDetailGallery'
import VehicleCard from '@/components/inventory/VehicleCard'
import WhatsAppButton from '@/components/inventory/WhatsAppButton'
import LeadForm from '@/components/leads/LeadForm'
import { estimateMonthlyPayment, formatUsd, PAYMENT_ASSUMPTIONS } from '@/lib/pricing'
import { DEALER, telHref } from '@/lib/contact'
import type { Vehicle } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Force dynamic rendering - requires database connection
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ vin: string }>
}

async function getVehicle(slugOrVin: string) {
  return (await getVehicleBySlug(slugOrVin)) ?? (await getVehicleByVin(slugOrVin))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vin } = await params
  const vehicle = await getVehicle(vin)
  if (!vehicle) return { title: 'Vehicle Not Found' }

  const title = buildVehicleTitle(vehicle.year, vehicle.make, vehicle.model, vehicle.trim)
  const description = buildVehicleDescription(vehicle.year, vehicle.make, vehicle.model, vehicle.price, vehicle.mileage)
  const keywords = buildVehicleKeywords(vehicle.year, vehicle.make, vehicle.model, vehicle.condition)
  const url = `${SITE_URL}/inventory/${vehicle.slug}`
  const image = vehicle.images[0] ?? `${SITE_URL}/og-image.jpg`

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: DEALER.name,
      locale: 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: `${vehicle.year} ${vehicle.make} ${vehicle.model} for sale in Naples, FL` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    other: {
      'product:price:amount': String(vehicle.price),
      'product:price:currency': 'USD',
      'product:availability': vehicle.status === 'SOLD' ? 'out of stock' : vehicle.status === 'PENDING' ? 'pending' : 'in stock',
      'product:condition': vehicle.condition === 'NEW' ? 'new' : 'used',
    },
  }
}

function specRows(v: Vehicle): { label: string; value: string }[] {
  return [
    { label: 'Mileage', value: `${v.mileage.toLocaleString('en-US')} mi` },
    { label: 'Exterior', value: v.exteriorColor ?? '' },
    { label: 'Engine', value: v.engine ?? '' },
    { label: 'Interior', value: v.interiorColor ?? '' },
    { label: 'Transmission', value: v.transmission ?? '' },
    { label: 'Body style', value: v.bodyStyle ?? '' },
    { label: 'Fuel', value: v.fuelType ?? '' },
    { label: 'Condition', value: v.condition === 'CERTIFIED' ? 'Certified pre-owned' : v.condition === 'NEW' ? 'New' : 'Used' },
    { label: 'Stock #', value: v.vin ? `A${v.vin.slice(-5).toUpperCase()}` : '' },
    { label: 'VIN', value: v.vin ?? '' },
  ].filter((r) => r.value)
}

export default async function VehicleDetailPage({ params }: Props) {
  const { vin } = await params
  const vehicle = await getVehicle(vin)
  if (!vehicle) notFound()

  let related: Vehicle[] = []
  try {
    related = await getRelatedVehicles(vehicle, 3)
  } catch (error) {
    console.error('Related vehicles failed:', error)
  }

  const jsonLd = buildVehicleJsonLd(vehicle)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Inventory', url: '/inventory' },
    { name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, url: `/inventory/${vehicle.slug}` },
  ])

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const fullName = vehicle.trim ? `${title} ${vehicle.trim}` : title
  const isSold = vehicle.status === 'SOLD'
  const isPending = vehicle.status === 'PENDING'
  const forSale = !isSold
  const monthly = estimateMonthlyPayment(vehicle.price)
  const stockNumber = vehicle.vin ? `A${vehicle.vin.slice(-5).toUpperCase()}` : ''
  const listed = new Date(vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const kind = vehicle.bodyStyle?.toLowerCase() === 'truck' ? 'truck' : 'car'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap gap-2 py-3.5 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/inventory" className="hover:text-ink">Inventory</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink" aria-current="page">{title}</span>
        </nav>

        {/* Status banners */}
        {isSold && (
          <div className="mb-4 rounded border border-accent-500/30 bg-red-50 px-4 py-3 text-sm text-accent-600">
            <b className="font-display text-lg">This vehicle has been sold.</b>{' '}
            <Link href="/inventory" className="font-semibold underline">See what&apos;s on the lot now</Link>, or message us and we&apos;ll find you something similar.
          </div>
        )}
        {isPending && (
          <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <b className="font-display text-lg">Sale pending.</b> Someone has a deposit on this {kind}. <Link href="/contact" className="font-semibold underline">Contact us</Link> to be next in line if it falls through.
          </div>
        )}

        <div className="grid items-start gap-7 pb-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          {/* ── Left: gallery, title, sheet, equipment, description ── */}
          <div className="min-w-0">
            <VehicleDetailGallery images={vehicle.images} alt={fullName} />

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {isSold && <span className="pill bg-accent-500 text-white">Sold</span>}
                {isPending && <span className="pill bg-amber-500 text-white">Pending</span>}
                <span className={vehicle.condition === 'NEW' ? 'badge-new' : vehicle.condition === 'CERTIFIED' ? 'badge-certified' : 'badge-used'}>
                  {vehicle.condition === 'CERTIFIED' ? 'Certified pre-owned' : vehicle.condition === 'NEW' ? 'New' : 'Used'}
                </span>
                {vehicle.bodyStyle && <span className="pill">{vehicle.bodyStyle}</span>}
                {stockNumber && <span className="pill">Stock #{stockNumber}</span>}
              </div>
              <h1 className="font-display text-[30px] font-extrabold leading-none sm:text-[40px]">
                {title}
                {vehicle.trim && <span className="ml-2 font-semibold text-slate-500">{vehicle.trim}</span>}
              </h1>
            </div>

            {/* Spec sheet, styled like the window sticker on the lot */}
            <section className="mt-6 overflow-hidden rounded-md border border-line" aria-labelledby="specs-heading">
              <div className="flex items-center justify-between gap-3 bg-brand-600 px-4 py-2.5 text-white">
                <h2 id="specs-heading" className="font-display text-xl font-bold tracking-wide">Vehicle details</h2>
                {vehicle.vin && <span className="text-xs tabular-nums text-brand-200">VIN {vehicle.vin}</span>}
              </div>
              <dl className="grid gap-x-8 bg-white px-4 py-2 sm:grid-cols-2">
                {specRows(vehicle).map((row) => (
                  <div key={row.label} className="flex items-baseline gap-2 border-b border-dotted border-line py-2 text-[15px] last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                    <dt className="flex-none text-slate-500">{row.label}</dt>
                    <span className="flex-1 -translate-y-1 border-b border-dotted border-line" aria-hidden="true" />
                    <dd className="min-w-0 break-words text-right font-semibold tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {vehicle.features.length > 0 && (
              <section className="mt-7" aria-labelledby="equip-heading">
                <h2 id="equip-heading" className="mb-3 font-display text-[26px] font-bold">Equipment</h2>
                <ul className="grid gap-x-5 gap-y-2 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
                  {vehicle.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 flex-none text-emerald-600" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {vehicle.description && (
              <section className="mt-7" aria-labelledby="about-heading">
                <h2 id="about-heading" className="mb-2 font-display text-[26px] font-bold">About this {kind}</h2>
                <p className="max-w-[68ch] whitespace-pre-line leading-relaxed text-ink">{vehicle.description}</p>
              </section>
            )}
          </div>

          {/* ── Right: deal panel ── */}
          <aside className="card overflow-hidden lg:sticky lg:top-20" aria-label="Price and contact">
            <div className="border-b border-line px-4 py-4">
              <p className="price text-[44px]">{formatUsd(vehicle.price)}</p>
              <p className="mt-1 text-xs text-slate-500">Plus tax, tag and title.</p>
              {monthly > 0 && forSale && (
                <div className="mt-3 flex items-baseline justify-between gap-3 text-sm text-slate-500">
                  <span>Est. payment<br /><span className="text-xs">{formatUsd(PAYMENT_ASSUMPTIONS.downPayment)} down, {PAYMENT_ASSUMPTIONS.termMonths} mo, {(PAYMENT_ASSUMPTIONS.apr * 100).toFixed(1)}% APR</span></span>
                  <b className="font-display text-2xl font-bold text-ink tabular-nums">{formatUsd(monthly)}/mo</b>
                </div>
              )}
            </div>

            {forSale ? (
              <>
                <div className="grid gap-2 p-4">
                  <WhatsAppButton
                    vehicleId={vehicle.id}
                    vin={vehicle.vin}
                    year={vehicle.year}
                    make={vehicle.make}
                    model={vehicle.model}
                    trim={vehicle.trim}
                    price={vehicle.price}
                    stockNumber={stockNumber}
                    label={`Ask about this ${kind}`}
                    className="btn-wa min-h-[50px] text-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {DEALER.phone && (
                      <a href={telHref()} className="btn-secondary"><Phone className="h-[18px] w-[18px]" />Call</a>
                    )}
                    <a href="#test-drive" className={`btn-navy ${DEALER.phone ? '' : 'col-span-2'}`}><CalendarCheck className="h-[18px] w-[18px]" />Test drive</a>
                  </div>
                </div>
                <ul className="grid gap-2 border-t border-line px-4 py-3 text-sm text-slate-500">
                  {['Inspected by our mechanic before listing', 'Financing for every credit situation', 'Trade-ins welcome, same-day offer'].map((t) => (
                    <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 flex-none text-emerald-600" strokeWidth={2.5} />{t}</li>
                  ))}
                </ul>
                <div className="border-t border-line bg-paper px-4 py-2.5 text-xs text-slate-500">
                  Listed <b className="font-semibold text-ink">{listed}</b>. {DEALER.hours[0].days} {DEALER.hours[0].time}.
                </div>
                <div id="test-drive" className="scroll-mt-24 border-t border-line p-4">
                  <h2 className="font-display text-2xl font-bold">Book a test drive</h2>
                  <p className="mb-3 mt-0.5 text-sm text-slate-500">Tell us when works and we&apos;ll have the {kind} ready.</p>
                  <LeadForm vehicleId={vehicle.id} vehicleName={fullName} leadType="VEHICLE" bare />
                </div>
              </>
            ) : (
              <div className="grid gap-2 p-4">
                <Link href="/inventory" className="btn-navy">Browse available vehicles</Link>
                <WhatsAppButton
                  vehicleId={vehicle.id}
                  vin={vehicle.vin}
                  year={vehicle.year}
                  make={vehicle.make}
                  model={vehicle.model}
                  trim={vehicle.trim}
                  label="Ask for something similar"
                  className="btn-wa"
                />
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="pb-12" aria-labelledby="more-heading">
            <h2 id="more-heading" className="mb-4 font-display text-[26px] font-bold">More from the lot</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </section>
        )}
      </div>

      {/* Phone-only sticky action bar */}
      {forSale && (
        <div className="sticky bottom-0 z-30 grid grid-cols-[auto_1fr_1fr] items-center gap-2 border-t border-line bg-white px-4 py-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden">
          <div className="leading-none">
            <p className="price text-2xl">{formatUsd(vehicle.price)}</p>
            {monthly > 0 && <p className="mt-1 text-[11px] text-slate-500">est. {formatUsd(monthly)}/mo</p>}
          </div>
          <WhatsAppButton
            vehicleId={vehicle.id}
            vin={vehicle.vin}
            year={vehicle.year}
            make={vehicle.make}
            model={vehicle.model}
            trim={vehicle.trim}
            price={vehicle.price}
            stockNumber={stockNumber}
            label="WhatsApp"
            className="btn-wa"
          />
          {DEALER.phone ? (
            <a href={telHref()} className="btn-secondary"><Phone className="h-[18px] w-[18px]" />Call</a>
          ) : (
            <a href="#test-drive" className="btn-navy">Test drive</a>
          )}
        </div>
      )}
    </>
  )
}

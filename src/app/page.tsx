// Home page: inventory first. Everything shown comes from inventory data or lib/seo constants.
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ShieldCheck, CreditCard, Repeat, MessageCircle, MapPin, Car, Clock, Phone } from 'lucide-react'
import { getVehicles, getInventoryFacets } from '@/lib/data'
import {
  BUSINESS_HOURS, DEALER_ADDRESS, LOCATION, makePath, vehiclePath,
  buildDealerJsonLd, buildWebsiteJsonLd, buildFAQJsonLd, DEFAULT_OG_IMAGE, serializeJsonLd,
} from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'
import { FINANCE_DISCLAIMER } from '@/lib/finance'
import { vehicleName } from '@/lib/vehicle-display'
import type { Vehicle } from '@/types'
import VehicleCard from '@/components/inventory/VehicleCard'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
  description: `${DEALER_NAME} is a family-owned used car lot in Naples, Florida. Inspected vehicles, honest pricing, financing for every credit, and WhatsApp replies. Serving Marco Island, Bonita Springs, Fort Myers, and Southwest Florida.`,
  keywords: [
    'car dealer Naples FL',
    'Naples car dealership',
    'used cars Naples Florida',
    'buy car Naples',
    'auto dealer Naples',
    'E&S Car Sales Naples',
    'Southwest Florida car dealer',
    'Collier County auto dealer',
    ...LOCATION.nearbyAreas.map((area) => `cars for sale ${area}`),
  ].join(', '),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
    description: 'Family-owned used car lot in Naples, Florida. Inspected vehicles and honest pricing.',
    url: SITE_URL,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${DEALER_NAME} - Naples Florida Car Dealer` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
    description: 'Family-owned used car lot in Naples, Florida. Inspected vehicles and honest pricing.',
  },
}

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'Inspected, with a clean title',
    desc: 'Each car gets a mechanical check and a title history pull before it goes on the lot.',
  },
  {
    icon: CreditCard,
    title: 'Financing for every credit',
    desc: 'Good, bad or first-time. We work with several lenders and tell you the real payment up front.',
    href: '/financing',
  },
  {
    icon: Repeat,
    title: 'We buy cars and take trade-ins',
    desc: 'Bring your car for a same-day offer. Trade value comes straight off the price.',
    href: '/trade-in',
  },
  {
    icon: MessageCircle,
    title: 'Text us on WhatsApp',
    desc: 'Ask about a car, send a photo of your trade, or book a test drive. We answer fast, in English or Spanish.',
  },
]

export default async function HomePage() {
  let vehicles: Vehicle[] = []
  let total = 0
  let facets: Awaited<ReturnType<typeof getInventoryFacets>> | null = null
  try {
    const [result, f] = await Promise.all([getVehicles({ limit: 6 }), getInventoryFacets()])
    vehicles = result.vehicles
    total = result.total
    facets = f
  } catch (error) {
    // Render without inventory sections if the database is unavailable
    console.error('Home: failed to load inventory', error)
  }

  const bodyStyles = facets?.bodyStyles ?? []
  const makes = facets?.makes ?? []
  const spotlight = vehicles.find((v) => v.images.length > 0) ?? null
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER_ADDRESS)}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildDealerJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFAQJsonLd()) }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-band overflow-hidden">
        <div className="mx-auto grid max-w-site items-center gap-7 px-4 py-9 lg:grid-cols-[5fr_6fr] lg:gap-10 lg:py-12">
          <div>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.02] sm:text-6xl lg:text-[64px]">
              Clean used cars in {LOCATION.city}, priced to drive home today.
            </h1>
            <p className="mt-4 max-w-[46ch] text-lg text-brand-200">
              A small family lot on {LOCATION.streetAddress}. Every car is inspected before it&apos;s listed, the price
              you see is the price, and you can text us on WhatsApp about any of them.
            </p>

            {/* Finder: a plain GET form to /inventory, so it works without JavaScript and lands on a shareable URL */}
            <form action="/inventory" method="get" role="search" className="mt-6 grid gap-2.5 rounded-md bg-white p-3 text-ink sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <label className="grid gap-1 text-xs font-semibold text-slate-500">
                Body style
                <select name="bodyStyle" className="input py-2" defaultValue="">
                  <option value="">Any</option>
                  {bodyStyles.map((b) => <option key={b.slug} value={b.name}>{b.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-500">
                Max price
                <select name="priceMax" className="input py-2" defaultValue="">
                  <option value="">Any</option>
                  {[20000, 30000, 40000, 50000].map((p) => <option key={p} value={p}>${p.toLocaleString('en-US')}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-500">
                Make
                <select name="make" className="input py-2" defaultValue="">
                  <option value="">Any</option>
                  {makes.map((m) => <option key={m.slug} value={m.name}>{m.name}</option>)}
                </select>
              </label>
              <button type="submit" className="btn-primary">See the cars</button>
            </form>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-200">
              {['Inspected before listing', 'Financing for every credit', 'Hablamos español'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>

          {spotlight ? (
            <Link href={vehiclePath(spotlight)} className="relative block aspect-[4/3] overflow-hidden rounded-md bg-brand-900" aria-label={`Just arrived: ${vehicleName(spotlight)}`}>
              <Image
                src={spotlight.images[0]}
                alt={`${vehicleName(spotlight)} for sale in Naples, FL`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <span className="absolute bottom-3.5 left-3.5 grid gap-0.5 rounded bg-white px-3.5 py-2.5 text-ink shadow-lg">
                <span className="text-xs text-slate-500">Just arrived</span>
                <span className="font-display text-xl font-bold leading-none">{spotlight.year} {spotlight.make} {spotlight.model}</span>
                {spotlight.price > 0 && <span className="price text-2xl">${spotlight.price.toLocaleString('en-US')}</span>}
              </span>
            </Link>
          ) : (
            <div className="hidden aspect-[4/3] flex-col items-center justify-center gap-4 rounded-md border border-white/15 bg-brand-700/60 text-brand-200 lg:flex">
              <Image src="/logo.png" alt="" width={220} height={220} className="h-52 w-52 object-contain drop-shadow-lg" priority />
              <p className="font-display text-2xl font-bold text-white">New arrivals every week</p>
              <p className="text-sm">Photos are posted the day a car hits the lot.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── On the lot ───────────────────────────────────────── */}
      <section aria-labelledby="lot-heading" className="mx-auto max-w-site px-4 py-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="lot-heading" className="section-title">On the lot right now</h2>
            <p className="section-sub">{total > 0 ? `${total} ${total === 1 ? 'vehicle' : 'vehicles'} available in ${LOCATION.city}.` : `Our ${LOCATION.city} lot, online.`}</p>
          </div>
          <Link href="/inventory" className="whitespace-nowrap border-b border-current font-semibold text-brand-600">See all {total > 0 ? total : ''}</Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Car className="h-10 w-10 text-slate-400" strokeWidth={1.25} aria-hidden="true" />
            <p className="font-display text-2xl font-bold">New inventory is on the way</p>
            <p className="max-w-[40ch] text-sm text-slate-500">Message us on WhatsApp and we&apos;ll tell you what&apos;s arriving this week.</p>
          </div>
        ) : (
          <>
            <div className="vehicle-grid">
              {vehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} priority={i < 3} />)}
            </div>
            <p className="mt-4 text-xs text-slate-500">* {FINANCE_DISCLAIMER}</p>
          </>
        )}

        {makes.length > 0 && (
          <nav aria-label="Shop by make" className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-500">Shop by make</span>
            {makes.slice(0, 10).map((m) => (
              <Link key={m.slug} href={makePath(m.name)} className="filter-chip">
                {m.name} <span className="text-slate-400">{m.count}</span>
              </Link>
            ))}
          </nav>
        )}
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-site px-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, desc, href }) => {
            const inner = (
              <>
                <Icon className="h-7 w-7 text-accent-500" strokeWidth={1.75} aria-hidden="true" />
                <p className="font-display text-[21px] font-bold leading-tight">{title}</p>
                <p className="max-w-[32ch] text-sm text-slate-500">{desc}</p>
              </>
            )
            const cls = 'grid content-start gap-1.5 border-b border-slate-100 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:pr-5 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0'
            return href ? (
              <Link key={title} href={href} className={`${cls} rounded hover:[&>p:first-of-type]:text-brand-600`}>{inner}</Link>
            ) : (
              <div key={title} className={cls}>{inner}</div>
            )
          })}
        </div>
      </section>

      {/* ── Visit ────────────────────────────────────────────── */}
      <section aria-labelledby="visit-heading" className="mx-auto grid max-w-site items-center gap-8 px-4 py-10 lg:grid-cols-2">
        <div>
          <h2 id="visit-heading" className="section-title">Come see the cars in person</h2>
          <p className="mt-2 max-w-[48ch] text-slate-500">
            Walk-ins welcome. We serve buyers across {LOCATION.county}, including {LOCATION.nearbyAreas.slice(0, -1).join(', ')} and{' '}
            {LOCATION.nearbyAreas.at(-1)}.
          </p>
          <dl className="mt-5 grid gap-3">
            <div className="grid grid-cols-[96px_1fr] gap-3 border-t border-line pt-2.5 text-[15px]">
              <dt className="flex items-center gap-1.5 text-slate-500"><MapPin className="h-4 w-4 text-accent-500" aria-hidden="true" />Address</dt>
              <dd>
                <address className="not-italic">
                  <b className="block font-semibold">{LOCATION.streetAddress}</b>
                  {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}
                </address>
              </dd>
            </div>
            <div className="grid grid-cols-[96px_1fr] gap-3 border-t border-line pt-2.5 text-[15px]">
              <dt className="flex items-center gap-1.5 text-slate-500"><Clock className="h-4 w-4 text-accent-500" aria-hidden="true" />Hours</dt>
              <dd>{BUSINESS_HOURS.map((h, i) => <span key={h.label} className={i === 0 ? 'block font-semibold tabular-nums' : 'block tabular-nums'}>{h.label}, {h.display}</span>)}</dd>
            </div>
            {DEALER_PHONE && (
              <div className="grid grid-cols-[96px_1fr] gap-3 border-t border-line pt-2.5 text-[15px]">
                <dt className="flex items-center gap-1.5 text-slate-500"><Phone className="h-4 w-4 text-accent-500" aria-hidden="true" />Phone</dt>
                <dd><a href={TEL_HREF} className="block font-semibold tabular-nums hover:text-brand-600">{DEALER_PHONE}</a>Call or text, WhatsApp too</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-navy"><MapPin className="h-[18px] w-[18px]" aria-hidden="true" />Get directions</a>
            <Link href="/contact" className="btn-secondary">Book a visit</Link>
          </div>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-[4/3] overflow-hidden rounded-md border border-line bg-white [background-image:linear-gradient(#E9ECF2_1px,transparent_1px),linear-gradient(90deg,#E9ECF2_1px,transparent_1px)] [background-size:40px_40px]"
          aria-label="Open our location in Google Maps"
        >
          <span className="absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2 bg-line" aria-hidden="true" />
          <span className="absolute inset-x-0 top-[62%] h-2 bg-line" aria-hidden="true" />
          <span className="absolute left-[54%] top-[8%] text-[11px] font-semibold uppercase tracking-wider text-slate-400 [writing-mode:vertical-rl]" aria-hidden="true">{LOCATION.streetAddress.replace(/^\d+\s*/, '')}</span>
          <span className="absolute left-[52%] top-[46%] grid -translate-x-1/2 -translate-y-full justify-items-center gap-1">
            <MapPin className="h-9 w-9 fill-accent-500 text-accent-500 drop-shadow" aria-hidden="true" />
            <span className="whitespace-nowrap rounded-sm bg-brand-600 px-2 py-1 text-xs font-semibold text-white">{DEALER_NAME}</span>
          </span>
          <span className="absolute bottom-3 right-3 rounded-sm bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-600">Open in Google Maps</span>
        </a>
      </section>
    </>
  )
}

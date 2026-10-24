// Home page: inventory first. Everything shown comes from inventory data or lib/seo constants.
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Check, ShieldCheck, CreditCard, Repeat, MessageCircle, MapPin, Car, Clock, Phone, CalendarCheck,
  Navigation, Expand, Handshake, Users, DoorOpen,
} from 'lucide-react'
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
import LazyMapEmbed from '@/components/layout/LazyMapEmbed'

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
  { icon: ShieldCheck, title: 'Inspected, with a clean title', desc: 'Each car gets a mechanical check and a title history pull before it goes on the lot.' },
  { icon: CreditCard, title: 'Financing for every credit', desc: 'Good, bad or first-time. We work with several lenders and tell you the real payment up front.', href: '/financing' },
  { icon: Repeat, title: 'We buy cars and take trade-ins', desc: 'Bring your car for a same-day offer. Trade value comes straight off the price.', href: '/trade-in' },
  { icon: MessageCircle, title: 'Text us on WhatsApp', desc: 'Ask about a car, send a photo of your trade, or book a test drive. We answer in English or Spanish.' },
]

// Approximate drive times to the lot; rounded, and labelled as such on the page
const DRIVE_TIMES = [
  { from: 'Downtown Naples', mins: 10 },
  { from: 'Marco Island', mins: 25 },
  { from: 'Fort Myers', mins: 45 },
]

const VISIT_POINTS = [
  { icon: DoorOpen, title: 'Walk-ins', desc: 'Always welcome' },
  { icon: Handshake, title: 'Test drives', desc: 'Available on site' },
  { icon: ShieldCheck, title: 'Inspected cars', desc: 'Quality you can trust' },
  { icon: Users, title: 'Friendly team', desc: 'Here to help' },
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
  const encodedAddress = encodeURIComponent(DEALER_ADDRESS)
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildDealerJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFAQJsonLd()) }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-site items-center gap-8 px-4 pb-10 pt-8 lg:grid-cols-[5fr_6fr] lg:gap-12 lg:pb-14 lg:pt-12">
          <div>
            <p className="eyebrow">Family-owned · {LOCATION.city}, {LOCATION.stateCode}</p>
            <h1 className="mt-4 font-display text-[42px] font-extrabold leading-[1.02] text-brand-600 sm:text-6xl lg:text-[64px]">
              Clean used cars in {LOCATION.city},{' '}
              <span className="highlight">priced to drive home today.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg text-slate-500">
              A small family lot on {LOCATION.streetAddress}. Every car is inspected before it&apos;s listed, the price
              you see is the price, and you can text us on WhatsApp about any of them.
            </p>

            {/* Finder: a plain GET form to /inventory, so it works without JavaScript and lands on a shareable URL */}
            <form action="/inventory" method="get" role="search" className="card mt-7 grid gap-2.5 p-3.5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
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

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {['Inspected before listing', 'Financing for every credit', 'Hablamos español'].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-accent-500" strokeWidth={2.5} aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>

          {spotlight ? (
            <Link href={vehiclePath(spotlight)} className="card-hover relative block aspect-[4/3] overflow-hidden" aria-label={`Just arrived: ${vehicleName(spotlight)}`}>
              <Image
                src={spotlight.images[0]}
                alt={`${vehicleName(spotlight)} for sale in Naples, FL`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <span className="absolute bottom-4 left-4 grid gap-0.5 rounded-xl border border-white/70 bg-white/85 px-4 py-3 text-ink shadow-panel backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">Just arrived</span>
                <span className="font-display text-xl font-bold leading-none">{spotlight.year} {spotlight.make} {spotlight.model}</span>
                {spotlight.price > 0 && <span className="price text-2xl">${spotlight.price.toLocaleString('en-US')}</span>}
              </span>
            </Link>
          ) : (
            <div className="card hidden aspect-[4/3] flex-col items-center justify-center gap-4 text-center lg:flex">
              <Image src="/logo.png" alt="" width={220} height={220} className="h-52 w-52 object-contain drop-shadow-lg" priority />
              <p className="font-display text-2xl font-bold text-brand-600">New arrivals every week</p>
              <p className="text-sm text-slate-500">Photos are posted the day a car hits the lot.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── On the lot ───────────────────────────────────────── */}
      <section aria-labelledby="lot-heading" className="mx-auto max-w-site px-4 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2 id="lot-heading" className="section-title mt-2">On the lot <span className="highlight">right now</span></h2>
            <p className="section-sub">{total > 0 ? `${total} ${total === 1 ? 'vehicle' : 'vehicles'} available in ${LOCATION.city}.` : `Our ${LOCATION.city} lot, online.`}</p>
          </div>
          <Link href="/inventory" className="btn-secondary btn-sm">See all {total > 0 ? total : ''} vehicles</Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Car className="h-10 w-10 text-accent-500" strokeWidth={1.25} aria-hidden="true" />
            <p className="font-display text-2xl font-bold text-brand-600">New inventory is on the way</p>
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

      {/* ── Why buy here ─────────────────────────────────────── */}
      <section className="mx-auto max-w-site px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, desc, href }) => {
            const inner = (
              <>
                <span className="icon-tile"><Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" /></span>
                <p className="mt-4 font-display text-xl font-bold leading-tight text-brand-600">{title}</p>
                <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
              </>
            )
            return href ? (
              <Link key={title} href={href} className="card-hover block p-5">{inner}</Link>
            ) : (
              <div key={title} className="card p-5">{inner}</div>
            )
          })}
        </div>
      </section>

      {/* ── Visit ────────────────────────────────────────────── */}
      <section aria-labelledby="visit-heading" className="mx-auto grid max-w-site items-center gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-16">
        <div>
          <p className="eyebrow">Visit our dealership</p>
          <h2 id="visit-heading" className="mt-4 font-display text-[40px] font-extrabold leading-[1.02] text-brand-600 sm:text-[52px]">
            Come see the cars <span className="highlight">in person</span>
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg text-slate-500">
            Walk-ins welcome. We serve buyers across {LOCATION.county}, including {LOCATION.nearbyAreas.slice(0, -1).join(', ')} and{' '}
            {LOCATION.nearbyAreas.at(-1)}.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="card flex gap-3 p-4">
              <span className="icon-tile"><MapPin className="h-6 w-6" aria-hidden="true" /></span>
              <div className="min-w-0">
                <dt className="text-sm text-slate-500">Address</dt>
                <dd>
                  <address className="not-italic">
                    <b className="block font-display text-[17px] font-bold text-ink">{LOCATION.streetAddress}</b>
                    <span className="text-sm text-slate-600">{LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}</span>
                  </address>
                </dd>
              </div>
            </div>
            <div className="card flex gap-3 p-4">
              <span className="icon-tile"><Clock className="h-6 w-6" aria-hidden="true" /></span>
              <div className="min-w-0">
                <dt className="text-sm text-slate-500">Hours</dt>
                <dd className="tabular-nums">
                  {BUSINESS_HOURS.map((h, i) => (
                    <span key={h.label} className={i === 0 ? 'block font-display text-[17px] font-bold text-ink' : 'block text-sm text-slate-600'}>
                      {h.label}: {h.display}
                    </span>
                  ))}
                </dd>
              </div>
            </div>
            <div className="card flex gap-3 p-4">
              <span className="icon-tile"><Phone className="h-6 w-6" aria-hidden="true" /></span>
              <div className="min-w-0">
                <dt className="text-sm text-slate-500">Phone</dt>
                <dd>
                  {DEALER_PHONE ? (
                    <a href={TEL_HREF} className="block font-display text-[17px] font-bold text-ink tabular-nums hover:text-brand-600">{DEALER_PHONE}</a>
                  ) : null}
                  <span className="text-sm text-slate-600">Call or text, WhatsApp too</span>
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[54px] px-6 text-lg">
              <Navigation className="h-5 w-5" aria-hidden="true" />Get directions
            </a>
            <Link href="/contact" className="btn-secondary min-h-[54px] px-6 text-lg">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />Book a visit
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 xl:grid-cols-4 xl:divide-x xl:divide-line">
            {VISIT_POINTS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-center gap-3 xl:pl-4 xl:first:pl-0">
                <Icon className="h-8 w-8 flex-shrink-0 text-accent-500" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="font-display text-[15px] font-bold leading-tight text-ink">{title}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card relative overflow-hidden p-2.5">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="group relative block overflow-hidden rounded-xl bg-slate-100" aria-label="Open our location in Google Maps">
            <div className="[&>div]:aspect-[4/3] [&_iframe]:opacity-100 [&_iframe]:grayscale-0">
              <LazyMapEmbed embedUrl={`https://www.google.com/maps?q=${encodedAddress}&z=12&output=embed`} title={`Map to ${DEALER_NAME}`} address={DEALER_ADDRESS} />
            </div>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-panel backdrop-blur transition-colors group-hover:bg-white">
              <Expand className="h-4 w-4" aria-hidden="true" />View larger map
            </span>
            <span className="pointer-events-none absolute left-3 top-3 hidden items-start gap-2 rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-panel backdrop-blur sm:flex">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 fill-brand-600 text-brand-600" aria-hidden="true" />
              <span>
                <span className="block font-display text-sm font-bold text-ink">{DEALER_NAME}</span>
                <span className="block text-xs text-slate-600">{LOCATION.streetAddress}, {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}</span>
              </span>
            </span>
          </a>
          <ul className="mt-2.5 grid grid-cols-3 divide-x divide-line rounded-xl bg-white/80 px-2 py-3" aria-label="Approximate drive times">
            {DRIVE_TIMES.map(({ from, mins }) => (
              <li key={from} className="flex items-center gap-2.5 px-3">
                <Car className="h-6 w-6 flex-shrink-0 text-brand-600" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-display text-base font-bold leading-tight text-ink tabular-nums">~{mins} min</p>
                  <p className="truncate text-xs text-slate-500">from {from}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

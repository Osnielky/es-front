// Home page: frosted glass panels over the Gulf-dusk backdrop (body::before in globals.css), with the lot
// video behind the hero on desktop. Everything shown comes from inventory data or lib/seo constants.
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarClock, Gauge, MapPin, Navigation, Phone, Search, Repeat, BadgeDollarSign, Clock } from 'lucide-react'
import { getVehicles, getInventoryFacets } from '@/lib/data'
import {
  BUSINESS_HOURS, DEALER_ADDRESS, LOCATION, bodyStylePath, makePath, vehiclePath,
  buildDealerJsonLd, buildWebsiteJsonLd, buildFAQJsonLd, DEFAULT_OG_IMAGE, serializeJsonLd,
} from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'
import { vehicleName } from '@/lib/vehicle-display'
import type { Vehicle } from '@/types'
import HeroVideoRotator from '@/components/HeroVideoRotator'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
  description: `${DEALER_NAME} is your trusted car dealership in Naples, Florida. Browse our current inventory of quality used vehicles. Competitive pricing, easy financing, and quality service. Serving Marco Island, Bonita Springs, Fort Myers, and Southwest Florida.`,
  keywords: [
    'car dealer Naples FL',
    'Naples car dealership',
    'used cars Naples Florida',
    'new cars Naples FL',
    'buy car Naples',
    'auto dealer Naples',
    'E&S Car Sales Naples',
    'Southwest Florida car dealer',
    'Collier County auto dealer',
    ...LOCATION.nearbyAreas.map(area => `cars for sale ${area}`),
  ].join(', '),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Quality used cars with transparent pricing. Visit us today!`,
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${DEALER_NAME} - Naples Florida Car Dealer`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DEALER_NAME} | Used Car Dealer in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Quality used cars with transparent pricing.`,
  },
}

const STEPS = [
  {
    icon: Search,
    title: 'Find the car',
    body: 'Search by make, body style or price. Save the ones you like and compare up to three side by side.',
  },
  {
    icon: CalendarClock,
    title: 'Check it out in person',
    body: 'Ask if it’s still available or pick a time for a test drive. We confirm the appointment with you.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Finance, trade in, drive home',
    body: 'Apply for financing and value your trade-in online before you visit, so the paperwork goes faster.',
  },
]

function priceLabel(price: number) {
  return price > 0 ? `$${price.toLocaleString('en-US')}` : 'Call for price'
}

export default async function HomePage() {
  let featured: Vehicle[] = []
  let total = 0
  let facets: Awaited<ReturnType<typeof getInventoryFacets>> | null = null
  try {
    const [result, f] = await Promise.all([getVehicles({ limit: 4 }), getInventoryFacets()])
    featured = result.vehicles
    total = result.total
    facets = f
  } catch (error) {
    // Render without inventory sections if the database is unavailable
    console.error('Home: failed to load inventory', error)
  }

  const bodyStyles = facets?.bodyStyles.slice(0, 6) ?? []
  const makes = facets?.makes.slice(0, 10) ?? []
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER_ADDRESS)}`

  return (
    <div className="theme-glass">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildDealerJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebsiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFAQJsonLd()) }} />

      {/* ── Hero: lot video (desktop) under a frosted search console ── */}
      {/* From lg the hero takes the video's 16:9 shape (capped at the window height) so wide screens
          see the whole scene instead of a zoomed-in strip; content is centered vertically in it */}
      <section className="relative isolate flex flex-col justify-center overflow-hidden px-4 pb-16 pt-[calc(var(--header-h)+2.5rem)] sm:pb-24 lg:min-h-[min(56.25vw,100svh)] lg:pb-20 lg:pt-[calc(var(--header-h)+2rem)]">
        {/* Videos rotate on their own; their dot controls would sit under the fade, so they're hidden here */}
        <div className="absolute inset-0 -z-20 opacity-70 [mask-image:linear-gradient(to_bottom,black_70%,transparent)] [&_button]:hidden" aria-hidden="true">
          <HeroVideoRotator />
        </div>
        {/* Darkens the video for text contrast; the mask above fades it into the dusk backdrop, so there's no seam */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#0c1e33]/70 via-[#0c1e33]/35 to-transparent" aria-hidden="true" />

        <div className="mx-auto grid w-full max-w-site grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-16">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[0.9375rem] text-[#fffdf8]/80">
              <MapPin className="h-4 w-4 text-[#F0B27A]" aria-hidden="true" />
              {LOCATION.streetAddress}, {LOCATION.city}
            </p>
            <h1 className="mt-5 font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.01em] sm:text-6xl lg:text-[5.25rem]">
              Well-kept used cars, priced up front.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#fffdf8]/80">
              {total > 0 ? `${total} vehicles on our Naples lot right now.` : 'Our Naples lot, online.'} See every photo, check
              availability, and book a test drive without a phone call.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/inventory"
                className="inline-flex min-h-12 items-center rounded-xl bg-[#fffdf8] px-6 text-[0.9375rem] font-semibold text-navy transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
              >
                Browse inventory
              </Link>
              <a
                href={TEL_HREF}
                className="glass inline-flex min-h-12 items-center gap-2 rounded-xl px-6 text-[0.9375rem] font-semibold transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {DEALER_PHONE}
              </a>
            </div>
          </div>

          {/* Plain GET form to /inventory: works without JavaScript */}
          <div className="glass glass-strong rounded-3xl p-5 sm:p-7">
            <h2 className="font-serif text-[1.75rem] font-semibold leading-tight">Find your car</h2>
            <form action="/inventory" method="get" role="search" className="mt-4 flex gap-2">
              <label htmlFor="glass-search" className="sr-only">Search inventory</label>
              <input
                id="glass-search"
                name="q"
                type="search"
                placeholder="Make, model or type"
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-base text-[#fffdf8] placeholder:text-[#fffdf8]/55 focus:border-[#F0B27A] focus:outline-none focus:ring-2 focus:ring-[#F0B27A]/40"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#fffdf8] px-5 text-[0.9375rem] font-semibold text-navy transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
            </form>

            {bodyStyles.length > 0 && (
              <nav aria-label="Shop by body style" className="mt-5">
                <p className="text-sm text-[#fffdf8]/70">Or shop by body style</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {bodyStyles.map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={bodyStylePath(b.name)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 text-sm font-medium transition-colors duration-150 hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
                      >
                        {b.name}
                        <span className="text-[#fffdf8]/60">{b.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-white/15 pt-5">
              <p className="text-sm text-[#fffdf8]/70">In stock today</p>
              <p className="text-3xl font-semibold tabular-nums">{total > 0 ? total : '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newest arrivals ── */}
      {featured.length > 0 && (
        <section aria-labelledby="arrivals-heading" className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-site">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="arrivals-heading" className="font-serif text-4xl font-semibold sm:text-5xl">Newest arrivals</h2>
              <Link href="/inventory" className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-[#F0B27A] hover:text-[#f6c89c]">
                See all {total} vehicles
              </Link>
            </div>
            {/* auto-fill (not the inventory auto-fit grid): a few arrivals keep card size instead of stretching */}
            <ul className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
              {featured.map((v) => (
                <li key={v.id}>
                  <Link
                    href={vehiclePath(v)}
                    className="glass group block overflow-hidden rounded-3xl transition-[border-color,background-color] duration-200 hover:border-white/35 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
                  >
                    <div className="relative aspect-[4/3] bg-white/5">
                      {v.images[0] && (
                        <Image
                          src={v.images[0]}
                          alt={`${vehicleName(v)} for sale in Naples, FL`}
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          loading="lazy"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold leading-snug">{vehicleName(v)}</h3>
                      <div className="mt-3 flex items-baseline justify-between gap-3">
                        <p className="text-2xl font-semibold tabular-nums">{priceLabel(v.price)}</p>
                        <p className="flex items-center gap-1.5 text-sm text-[#fffdf8]/70">
                          <Gauge className="h-4 w-4" aria-hidden="true" />
                          {v.mileage.toLocaleString('en-US')} mi
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {makes.length > 0 && (
              <nav aria-label="Shop by make" className="mt-10">
                <h3 className="text-[0.9375rem] font-semibold text-[#fffdf8]/80">Shop by make</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {makes.map((m) => (
                    <li key={m.slug}>
                      <Link
                        href={makePath(m.name)}
                        className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
                      >
                        {m.name}
                        <span className="text-[#fffdf8]/60">{m.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </section>
      )}

      {/* ── How buying works (a real sequence, so the steps are numbered) ── */}
      <section aria-labelledby="steps-heading" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-site">
          <h2 id="steps-heading" className="max-w-2xl font-serif text-4xl font-semibold sm:text-5xl">
            How buying from us works
          </h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="glass rounded-3xl p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0B27A]/50 font-serif text-xl font-semibold text-[#F0B27A]">
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5 text-[#fffdf8]/70" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-[#fffdf8]/75">{body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Link
              href="/financing"
              className="glass group flex items-start gap-4 rounded-3xl p-6 transition-colors duration-200 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] sm:p-7"
            >
              <BadgeDollarSign className="mt-1 h-6 w-6 flex-shrink-0 text-[#F0B27A]" aria-hidden="true" />
              <span>
                <span className="block text-xl font-semibold">Get pre-approved</span>
                <span className="mt-1 block text-[#fffdf8]/75">Apply online and know your budget before you pick a car.</span>
              </span>
            </Link>
            <Link
              href="/trade-in"
              className="glass group flex items-start gap-4 rounded-3xl p-6 transition-colors duration-200 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] sm:p-7"
            >
              <Repeat className="mt-1 h-6 w-6 flex-shrink-0 text-[#F0B27A]" aria-hidden="true" />
              <span>
                <span className="block text-xl font-semibold">Value your trade-in</span>
                <span className="mt-1 block text-[#fffdf8]/75">Tell us about your current car and we’ll send you an offer.</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Visit ── */}
      <section aria-labelledby="visit-heading" className="px-4 pb-20 pt-4 sm:pb-24">
        <div className="glass mx-auto grid max-w-site gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 id="visit-heading" className="font-serif text-4xl font-semibold sm:text-5xl">Come see it in person</h2>
            <address className="mt-5 text-lg not-italic leading-relaxed text-[#fffdf8]/85">
              {LOCATION.streetAddress}
              <br />
              {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}
            </address>
            <p className="mt-4 max-w-xl leading-relaxed text-[#fffdf8]/75">
              We serve buyers across {LOCATION.county}, including {LOCATION.nearbyAreas.slice(0, -1).join(', ')} and{' '}
              {LOCATION.nearbyAreas.at(-1)}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#fffdf8] px-6 text-[0.9375rem] font-semibold text-navy transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get directions
              </a>
              <a
                href={TEL_HREF}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-6 text-[0.9375rem] font-semibold transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {DEALER_PHONE}
              </a>
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-[#F0B27A]" aria-hidden="true" />
              Hours
            </h3>
            <dl className="mt-3 divide-y divide-white/15 text-lg">
              {BUSINESS_HOURS.map((h) => (
                <div key={h.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-[#fffdf8]/75">{h.label}</dt>
                  <dd className="font-semibold tabular-nums">{h.display}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  )
}

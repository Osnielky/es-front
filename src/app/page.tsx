import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Zap, HeartHandshake, ChevronRight, Star, Car, Gauge, ArrowRight, MapPin } from 'lucide-react'
import { buildDealerJsonLd, buildWebsiteJsonLd, buildLocalBusinessJsonLd, buildFAQJsonLd, LOCATION } from '@/lib/seo'
import { getVehicles } from '@/lib/data'
import type { Vehicle } from '@/types'
import VehicleCard from '@/components/inventory/VehicleCard'
import HeroVideoRotator from '@/components/HeroVideoRotator'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Force dynamic rendering - requires database connection
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${DEALER_NAME} | #1 Car Dealer in Naples, FL`,
  description: `${DEALER_NAME} is your trusted car dealership in Naples, Florida. Browse 500+ new and used vehicles. Competitive pricing, easy financing, and quality service. Serving Marco Island, Bonita Springs, Fort Myers, and Southwest Florida.`,
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
    title: `${DEALER_NAME} | #1 Car Dealer in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Browse 500+ quality vehicles with transparent pricing. Visit us today!`,
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${DEALER_NAME} - Naples Florida Car Dealer`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DEALER_NAME} | #1 Car Dealer in Naples, FL`,
    description: `Your trusted car dealership in Naples, Florida. Browse 500+ quality vehicles with transparent pricing.`,
  },
}

export default async function HomePage() {
  const dealerJsonLd = buildDealerJsonLd()
  const websiteJsonLd = buildWebsiteJsonLd()
  const localBusinessJsonLd = buildLocalBusinessJsonLd()
  const faqJsonLd = buildFAQJsonLd()
  
  // Gracefully handle database connection errors
  let featured: Vehicle[] = []
  try {
    const result = await getVehicles({ limit: 3 })
    featured = result.vehicles
  } catch (error) {
    console.error('Failed to fetch featured vehicles:', error)
    // Continue with empty featured list if database is unavailable
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />


      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 pt-36 pb-20 text-white sm:pt-48 sm:pb-32">
        {/* Rotating video backgrounds */}
        <HeroVideoRotator />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-200 backdrop-blur-sm mb-6">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            #1 Rated Dealer in the Area
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Drive Your{' '}
            <span className="bg-gradient-to-r from-accent-400 to-amber-300 bg-clip-text text-transparent">
              Dream Car
            </span>{' '}
            Today
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-200 sm:text-xl">
            Hundreds of quality vehicles. Transparent pricing. Zero pressure. Your perfect ride is one click away.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/inventory" className="btn-primary px-8 py-3.5 text-base shadow-glow">
              Browse Inventory
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost-white px-8 py-3.5 text-base">
              Talk to a Specialist
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {[
              { value: '500+', label: 'Vehicles in Stock' },
              { value: '4.9★', label: 'Customer Rating' },
              { value: '15yr', label: 'Serving the Community' },
            ].map((s) => (
              <div key={s.label} className="px-4 py-5 sm:px-8">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-brand-300 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ──────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="section-title">Why Choose Us?</h2>
            <p className="section-sub">We make buying a car simple, transparent, and enjoyable.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                color: 'bg-blue-50 text-blue-600',
                title: 'Certified & Inspected',
                desc: 'Every vehicle passes a 150-point inspection before it hits our lot.',
              },
              {
                icon: Zap,
                color: 'bg-amber-50 text-amber-600',
                title: 'Fast & Easy Financing',
                desc: 'Get pre-approved in minutes. Flexible terms for every credit situation.',
              },
              {
                icon: HeartHandshake,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Trade-In Welcome',
                desc: 'Get a competitive offer for your current vehicle, applied instantly to your deal.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card p-7 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Inventory ───────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="section-title">Featured Vehicles</h2>
              <p className="section-sub">Hand-picked from our latest arrivals.</p>
            </div>
            <Link href="/inventory" className="btn-secondary shrink-0">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Three simple steps to your next vehicle.</p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step: '01', icon: Car, title: 'Browse & Pick', desc: 'Filter by make, model, price, and more to find your perfect match.' },
              { step: '02', icon: Gauge, title: 'Test Drive', desc: 'Schedule a test drive at your convenience — we work around your schedule.' },
              { step: '03', icon: HeartHandshake, title: 'Drive Home', desc: 'Finalise paperwork, apply financing, and drive off same day.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative card p-7 text-center">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white shadow-md">
                  Step {step}
                </span>
                <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Bar ─────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            {[
              { href: '/financing', icon: Zap, color: 'text-amber-600 bg-amber-50', title: 'Easy Financing', desc: 'All credit welcome. Get pre-approved in minutes.' },
              { href: '/trade-in', icon: ArrowRight, color: 'text-emerald-600 bg-emerald-50', title: 'Trade-In', desc: 'Get top dollar for your current vehicle.' },
              { href: '/about', icon: Star, color: 'text-brand-600 bg-brand-50', title: 'About Us', desc: 'Naples\' trusted dealer for over 15 years.' },
            ].map(({ href, icon: Icon, color, title, desc }) => (
              <Link key={title} href={href} className="group card p-6 flex flex-col items-center hover:-translate-y-1 transition-all duration-200">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serving Naples FL ─────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">Local Dealership</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Proudly Serving Naples & Southwest Florida
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                We are a <strong>Naples, Florida</strong> dealership focused on one thing: helping our neighbors find a reliable vehicle at a fair price. No high-pressure tactics, no hidden fees. Just honest deals and real customer care.
              </p>
              <p className="mt-3 text-gray-500 leading-relaxed">
                From our lot on Airport-Pulling Road, we serve buyers across <strong>Collier County</strong> — including Marco Island, Bonita Springs, Fort Myers, Estero, Golden Gate, and Immokalee. Whether you are commuting on I-75, heading to the beach, or need a dependable truck for work, we have the right vehicle for your Florida lifestyle.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Naples', ...LOCATION.nearbyAreas].map(area => (
                  <span key={area} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                    {area}, FL
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { href: '/inventory?condition=USED', label: 'Used Cars in Naples, FL', sub: 'Inspected, affordable, ready to drive' },
                { href: '/inventory?condition=NEW', label: 'New Cars in Naples, FL', sub: 'Latest models with full manufacturer warranty' },
                { href: '/inventory?condition=CERTIFIED', label: 'Certified Pre-Owned in Naples', sub: 'Extended warranty and low mileage' },
                { href: '/financing', label: 'Auto Financing Naples FL', sub: 'All credit welcome — fast approval' },
                { href: '/trade-in', label: 'Trade In Your Car — Naples', sub: 'Competitive offers, instant credit' },
              ].map(({ href, label, sub }) => (
                <Link key={href} href={href} className="group flex items-center justify-between card px-5 py-4 hover:border-brand-300 transition-all">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-brand-700 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-brand-600 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="mx-4 mb-16 overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-center text-white sm:mx-8 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-card-shine" />
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to Find Your Next Ride?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-200">
          Our specialists are standing by to help you get the best deal. No pressure, no gimmicks.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/inventory" className="btn-primary px-8 py-3.5 shadow-glow">
            Browse Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-ghost-white px-8 py-3.5">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}

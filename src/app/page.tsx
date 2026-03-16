import Link from 'next/link'
import { Shield, Zap, HeartHandshake, ChevronRight, Star, Car, Gauge, ArrowRight } from 'lucide-react'
import { buildDealerJsonLd } from '@/lib/seo'
import { getVehicles } from '@/lib/data'
import VehicleCard from '@/components/inventory/VehicleCard'

export default async function HomePage() {
  const dealerJsonLd = buildDealerJsonLd()
  const { vehicles: featured } = await getVehicles({ limit: 3 })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-20 text-white sm:py-32">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-accent-500/15 blur-3xl" />

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
        <div className="mx-auto max-w-7xl">
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

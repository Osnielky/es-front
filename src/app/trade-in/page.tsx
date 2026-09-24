import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeDollarSign, CheckCircle2, Clock, Phone, ShieldCheck, TrendingUp } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'
import { buildBreadcrumbJsonLd, buildTradeInJsonLd, LOCATION, DEFAULT_OG_IMAGE, DEALER_ADDRESS, serializeJsonLd } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Trade In Your Car in Naples, FL | Get an Offer',
  description: `Get a competitive trade-in offer for your vehicle at ${DEALER_NAME} in Naples, FL. Get an appraisal and put the value toward your next car. Serving Collier County and Southwest Florida.`,
  keywords: [
    'trade in car Naples FL',
    'car trade in Naples Florida',
    'sell my car Naples FL',
    'vehicle appraisal Naples',
    'trade in value Naples FL',
    'trade in car Collier County',
    'sell used car Naples Florida',
    'car trade in Southwest Florida',
    `${DEALER_NAME} trade in`,
    ...LOCATION.nearbyAreas.map(area => `trade in car ${area}`),
  ].join(', '),
  alternates: { canonical: `${SITE_URL}/trade-in` },
  openGraph: {
    title: 'Trade In Your Car in Naples, FL | Get an Offer | E&S Car Sales',
    description: `Get a trade-in appraisal at ${DEALER_NAME} in Naples, FL and put the value toward your next car.`,
    url: `${SITE_URL}/trade-in`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Trade In Your Car Naples FL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade In Your Car Naples FL | Get an Offer',
    description: `Trade-in appraisals at ${DEALER_NAME} in Naples, FL.`,
  },
}

const benefits = [
  { icon: BadgeDollarSign, title: 'A Clear Offer', desc: 'We look at your vehicle’s condition, mileage and the current market, and explain how we arrived at the number.' },
  { icon: Clock, title: 'Easy Appraisal', desc: 'Tell us about your car online first, or bring it by during business hours.' },
  { icon: TrendingUp, title: 'Instant Credit', desc: 'Your trade-in value is applied directly to your purchase, reducing your price and monthly payment.' },
  { icon: ShieldCheck, title: 'No Obligation', desc: 'Get your offer with zero pressure. You are never required to buy a replacement vehicle from us.' },
]

const steps = [
  { step: '01', title: 'Tell Us About Your Car', desc: 'Year, make, model, mileage, and condition. Use the form below or bring it in person.' },
  { step: '02', title: 'We Inspect & Appraise', desc: 'Our team evaluates your vehicle using live market data to give you the strongest offer.' },
  { step: '03', title: 'Receive Your Offer', desc: 'We give you our offer. No pressure; take the time you need to decide.' },
  { step: '04', title: 'Apply It to Your Next Car', desc: 'Use the trade-in credit toward any vehicle in our inventory and drive home in something new.' },
]

const accepts = [
  'Cars, trucks, SUVs, and vans',
  'All makes and models',
  'High-mileage vehicles',
  'Vehicles with minor damage',
  'Cars with existing loans (we pay off the balance)',
  'Vehicles not purchased from us',
]

export default function TradeInPage() {
  const tradeInJsonLd = buildTradeInJsonLd()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Trade-In', url: '/trade-in' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(tradeInJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <div className="theme-glass">
        {/* Hero */}
        <div className="border-b border-ivory/10 bg-[#0c1e33]/30 px-4 py-14 text-center text-ivory">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#F0B27A] mb-2">Trade-In</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Trade In Your Car in Naples, FL
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ivory/75 text-lg">
            Get an appraisal and apply the value toward your next vehicle.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#appraise" className="btn-primary px-8 py-3.5">Get My Trade-In Value</a>
            <a href={TEL_HREF} className="btn-ghost-white px-8 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
              <Phone className="h-4 w-4" /> Call {DEALER_PHONE}
            </a>
          </div>
        </div>

        {/* Benefits */}
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="section-title">Why Trade In With Us?</h2>
              <p className="section-sub">We make trading in your vehicle simple, fast, and rewarding.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ivory/10 text-[#F0B27A]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-ivory">{title}</h3>
                  <p className="mt-2 text-sm text-ivory/75 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="section-title">How the Trade-In Process Works</h2>
              <p className="section-sub">Four easy steps from appraisal to driving something new.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {steps.map(({ step, title, desc }) => (
                <div key={step} className="card flex gap-5 p-6">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ivory text-sm font-black text-navy">
                    {step}
                  </span>
                  <div>
                    <h3 className="font-bold text-ivory">{title}</h3>
                    <p className="mt-1 text-sm text-ivory/75 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Accept + Form */}
        <section id="appraise" className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {/* What we accept */}
              <div>
                <h2 className="text-2xl font-bold text-ivory mb-2">We Accept Almost Any Vehicle</h2>
                <p className="text-ivory/75 mb-6">
                  You don&apos;t need a perfect car to get a great offer. We buy vehicles of all shapes, ages, and conditions in the Naples, FL area.
                </p>
                <ul className="space-y-3 mb-8">
                  {accepts.map(item => (
                    <li key={item} className="flex items-center gap-3 text-ivory/90">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="card p-5">
                  <p className="text-sm font-bold text-ivory mb-1">Have a loan on your current car?</p>
                  <p className="text-sm text-ivory/75">
                    No problem. We handle the payoff directly with your lender. If you owe more than the car is worth, we can roll the difference into your new financing.
                  </p>
                </div>
                <div className="mt-6">
                  <Link href="/inventory" className="btn-secondary">
                    Browse Inventory <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Form */}
              <div>
                <h2 className="text-2xl font-bold text-ivory mb-2">Get Your Trade-In Estimate</h2>
                <p className="text-ivory/75 mb-6">Tell us about your vehicle and we&apos;ll get back to you with an offer fast.</p>
                <LeadForm leadType="TRADE_IN" vehicleName="trade-in" />
              </div>
            </div>
          </div>
        </section>

        {/* Local SEO footer text */}
        <section className="px-4 py-12 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-ivory/75 text-sm leading-relaxed">
              {DEALER_NAME} accepts trade-ins from customers throughout{' '}
              <strong>Naples, FL</strong> and the surrounding areas including{' '}
              {LOCATION.nearbyAreas.join(', ')}, and all of <strong>Collier County</strong>.{' '}
              Visit our dealership at {DEALER_ADDRESS} or submit your vehicle details online.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/financing" className="btn-secondary text-sm">Explore Financing</Link>
              <Link href="/inventory" className="btn-secondary text-sm">Browse Inventory</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

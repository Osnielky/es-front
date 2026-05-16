import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HeartHandshake, MapPin, Phone, Shield, Star, Users } from 'lucide-react'
import { buildBreadcrumbJsonLd, buildLocalBusinessJsonLd, LOCATION } from '@/lib/seo'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '(239) 555-0123'
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? '1029 Airport-Pulling Rd, Naples, FL 34104'

export const metadata: Metadata = {
  title: 'About Us | E&S Car Sales — Naples, FL Car Dealership',
  description: `Learn about ${DEALER_NAME}, Naples Florida's trusted used car dealership. Family-owned, community-focused, and committed to honest pricing and quality vehicles. Serving Collier County and Southwest Florida for over 15 years.`,
  keywords: [
    'about E&S Car Sales',
    'Naples FL car dealership',
    'used car dealer Naples Florida',
    'family owned car dealer Naples',
    'honest car dealer Naples FL',
    'Collier County auto dealer',
    'Southwest Florida car dealer',
    'E&S Car Sales Naples',
    'car dealership Naples history',
  ].join(', '),
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About E&S Car Sales | Naples, FL Car Dealership',
    description: `Family-owned car dealership in Naples, FL. Honest pricing, quality vehicles, and real customer care. Serving Southwest Florida.`,
    url: `${SITE_URL}/about`,
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'About E&S Car Sales Naples FL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About E&S Car Sales | Naples FL Car Dealership',
    description: 'Family-owned car dealership serving Naples and Southwest Florida with honest pricing and quality vehicles.',
  },
}

const values = [
  { icon: Shield, title: 'Honest Pricing', desc: 'No hidden fees, no bait-and-switch. The price you see is the price you pay. We believe transparency builds long-term trust.' },
  { icon: Star, title: 'Quality Vehicles', desc: 'Every car on our lot passes a rigorous 150-point inspection. We stand behind every vehicle we sell — period.' },
  { icon: Users, title: 'Community First', desc: 'We are a Naples business serving Naples families. We live and work here, which means our reputation in this community matters more than any single sale.' },
  { icon: HeartHandshake, title: 'Real Customer Care', desc: 'Our job does not end when you drive off the lot. We are here for questions, follow-ups, and your next vehicle too.' },
]

const stats = [
  { value: '15+', label: 'Years Serving Naples' },
  { value: '4.9★', label: 'Average Customer Rating' },
  { value: '500+', label: 'Vehicles Sold Annually' },
  { value: '100%', label: 'Inspected Before Sale' },
]

export default function AboutPage() {
  const localBusinessJsonLd = buildLocalBusinessJsonLd()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <div className="bg-hero-gradient px-4 py-14 text-white text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300 mb-2">About Us</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Naples&apos; Trusted Car Dealership
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-200 text-lg">
          Family-owned and community-driven. We have been helping Southwest Florida families find quality vehicles at honest prices for over 15 years.
        </p>
      </div>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 px-4 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-brand-600">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="section-title">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {DEALER_NAME} was founded with a simple belief: buying a used car should be an honest, comfortable experience — not a stressful one. We started small, built our reputation one customer at a time, and grew by doing the right thing.
                </p>
                <p>
                  Located in the heart of <strong>Naples, Florida</strong>, we serve families across <strong>Collier County</strong> and all of Southwest Florida — from Marco Island to Fort Myers, Bonita Springs to Immokalee. Many of our customers come back for their second or third vehicle, and we consider that the highest compliment.
                </p>
                <p>
                  We keep our inventory fresh with a wide selection of inspected, pre-owned vehicles at every price point. Whether you are a first-time buyer, upgrading your family SUV, or looking for a work truck, we have something for you.
                </p>
              </div>
            </div>
            <div className="card p-8 bg-brand-50 border-brand-100">
              <h3 className="text-lg font-bold text-brand-800 mb-4">Visit Our Dealership</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{DEALER_ADDRESS}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <a href={`tel:${DEALER_PHONE.replace(/[^0-9]/g, '')}`} className="text-sm text-brand-600 hover:underline">{DEALER_PHONE}</a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Star className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Hours</p>
                    <p className="text-sm text-gray-600">Mon – Sat: 9am – 7pm</p>
                    <p className="text-sm text-gray-600">Sun: 11am – 5pm</p>
                  </div>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER_ADDRESS)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 btn-primary w-full justify-center"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-sub">Our values are not on a poster. They show up in every conversation, every deal, every car we sell.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="section-title">Proudly Serving Southwest Florida</h2>
          <p className="section-sub">
            We serve car buyers across the entire Naples metro area and beyond.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Naples', ...LOCATION.nearbyAreas].map(area => (
              <Link
                key={area}
                href={`/inventory`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-700 transition-colors"
              >
                {area}, FL
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500 max-w-2xl mx-auto">
            No matter where you are in <strong>Collier County</strong> or <strong>Lee County</strong>, {DEALER_NAME} is your local used car dealer. We have helped thousands of Southwest Florida families find reliable transportation at a price that makes sense.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-16 overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-center text-white sm:mx-8">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ready to Find Your Next Vehicle?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-200">Browse our current inventory or get in touch — we are happy to help you find exactly what you need.</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/inventory" className="btn-primary px-8 py-3.5 shadow-glow">
            Browse Inventory <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-ghost-white px-8 py-3.5">Contact Us</Link>
        </div>
      </section>
    </>
  )
}

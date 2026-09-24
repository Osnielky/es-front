import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HeartHandshake, MapPin, Phone, Shield, Star, Users } from 'lucide-react'
import { buildBreadcrumbJsonLd, buildLocalBusinessJsonLd, LOCATION, DEFAULT_OG_IMAGE, DEALER_ADDRESS, serializeJsonLd, BUSINESS_HOURS } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'About Us | E&S Car Sales — Naples, FL Car Dealership',
  description: `Learn about ${DEALER_NAME}, a used car dealership in Naples, Florida committed to honest pricing and quality vehicles. Serving Collier County and Southwest Florida.`,
  keywords: [
    'about E&S Car Sales',
    'Naples FL car dealership',
    'used car dealer Naples Florida',
    'honest car dealer Naples FL',
    'Collier County auto dealer',
    'Southwest Florida car dealer',
    'E&S Car Sales Naples',
    'car dealership Naples history',
  ].join(', '),
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About E&S Car Sales | Naples, FL Car Dealership',
    description: `Used car dealership in Naples, FL. Honest pricing, quality vehicles, and real customer care. Serving Southwest Florida.`,
    url: `${SITE_URL}/about`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'About E&S Car Sales Naples FL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About E&S Car Sales | Naples FL Car Dealership',
    description: 'Used car dealership serving Naples and Southwest Florida with honest pricing and quality vehicles.',
  },
}

const values = [
  { icon: Shield, title: 'Honest Pricing', desc: 'Every listing shows its price up front, and we walk you through taxes and fees before you sign. Transparency builds long-term trust.' },
  { icon: Star, title: 'Quality Vehicles', desc: 'Every listing shows real photos and the details we have on record, and we’ll answer any question about a car’s history and condition.' },
  { icon: Users, title: 'Community First', desc: 'We are a Naples business serving Naples families. We live and work here, which means our reputation in this community matters more than any single sale.' },
  { icon: HeartHandshake, title: 'Real Customer Care', desc: 'Our job does not end when you drive off the lot. We are here for questions, follow-ups, and your next vehicle too.' },
]

export default function AboutPage() {
  const localBusinessJsonLd = buildLocalBusinessJsonLd()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <div className="theme-glass">
        {/* Hero */}
        <div className="border-b border-ivory/10 bg-[#0c1e33]/30 px-4 py-14 text-center text-ivory">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#F0B27A] mb-2">About Us</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Naples&apos; Trusted Car Dealership
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ivory/75 text-lg">
            A Naples dealership helping Southwest Florida drivers find quality used vehicles at honest prices.
          </p>
        </div>


        {/* Our Story */}
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="section-title">Our Story</h2>
                <div className="space-y-4 text-ivory/75 leading-relaxed">
                  <p>
                    {DEALER_NAME} was founded with a simple belief: buying a used car should be an honest, comfortable experience — not a stressful one. We started small, built our reputation one customer at a time, and grew by doing the right thing.
                  </p>
                  <p>
                    Located in the heart of <strong>Naples, Florida</strong>, we serve families across <strong>Collier County</strong> and all of Southwest Florida — from Marco Island to Fort Myers, Bonita Springs to Immokalee. Many of our customers come back for their second or third vehicle, and we consider that the highest compliment.
                  </p>
                  <p>
                    We keep our inventory fresh with a wide selection of pre-owned vehicles at every price point. Whether you are a first-time buyer, upgrading your family SUV, or looking for a work truck, we have something for you.
                  </p>
                </div>
              </div>
              <div className="card p-8">
                <h3 className="font-serif text-2xl font-semibold text-ivory mb-4">Visit Our Dealership</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-[#F0B27A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ivory">Address</p>
                      <p className="text-sm text-ivory/75">{DEALER_ADDRESS}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 text-[#F0B27A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ivory">Phone</p>
                      <a href={TEL_HREF} className="rounded text-sm text-[#F0B27A] hover:text-[#f6c89c] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">{DEALER_PHONE}</a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Star className="h-5 w-5 text-[#F0B27A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ivory">Hours</p>
                      {BUSINESS_HOURS.map((h) => (
                        <p key={h.label} className="text-sm text-ivory/75">{h.label}: {h.display}</p>
                      ))}
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
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="section-title">What We Stand For</h2>
              <p className="section-sub">Our values are not on a poster. They show up in every conversation, every deal, every car we sell.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ivory/10 text-[#F0B27A]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-ivory">{title}</h3>
                  <p className="mt-2 text-sm text-ivory/75 leading-relaxed">{desc}</p>
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
                  className="rounded-full border border-ivory/15 bg-ivory/10 px-4 py-2 text-sm font-medium text-ivory/90 hover:border-ivory/30 hover:bg-ivory/[0.16] hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
                >
                  {area}, FL
                </Link>
              ))}
            </div>
            <p className="mt-8 text-sm text-ivory/75 max-w-2xl mx-auto">
              No matter where you are in <strong>Collier County</strong> or <strong>Lee County</strong>, {DEALER_NAME} is your local used car dealer. We’re here to help Southwest Florida drivers find reliable transportation at a price that makes sense.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-4 mb-16 overflow-hidden glass rounded-3xl px-6 py-14 text-center text-ivory sm:mx-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Ready to Find Your Next Vehicle?</h2>
          <p className="mx-auto mt-3 max-w-xl text-ivory/75">Browse our current inventory or get in touch — we are happy to help you find exactly what you need.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/inventory" className="btn-primary px-8 py-3.5">
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost-white px-8 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">Contact Us</Link>
          </div>
        </section>
      </div>
    </>
  )
}

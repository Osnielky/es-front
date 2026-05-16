import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, CreditCard, DollarSign, FileText, Phone, ShieldCheck, Users } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'
import { buildBreadcrumbJsonLd, buildFinancingJsonLd, buildFAQJsonLd, LOCATION } from '@/lib/seo'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '(239) 555-0123'

export const metadata: Metadata = {
  title: 'Car Financing in Naples, FL | All Credit Welcome',
  description: `Get approved for auto financing at ${DEALER_NAME} in Naples, FL. We work with all credit situations — good, bad, or no credit. Competitive rates, fast approval, flexible terms. Serving Collier County and Southwest Florida.`,
  keywords: [
    'car financing Naples FL',
    'auto loan Naples Florida',
    'bad credit car loan Naples',
    'no credit car financing Naples',
    'used car financing Naples FL',
    'auto financing Collier County',
    'car loan Southwest Florida',
    'buy here pay here Naples',
    'pre-approved auto loan Naples',
    `${DEALER_NAME} financing`,
    ...LOCATION.nearbyAreas.map(area => `car financing ${area}`),
  ].join(', '),
  alternates: { canonical: `${SITE_URL}/financing` },
  openGraph: {
    title: 'Car Financing in Naples, FL | All Credit Welcome | E&S Car Sales',
    description: `Fast, easy auto financing for all credit situations in Naples, FL. Get pre-approved in minutes at ${DEALER_NAME}.`,
    url: `${SITE_URL}/financing`,
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Car Financing Naples FL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Financing Naples FL | All Credit Welcome',
    description: `Fast, easy auto financing for all credit situations at ${DEALER_NAME} in Naples, FL.`,
  },
}

const steps = [
  { icon: FileText, title: 'Submit Your Info', desc: 'Fill out our short form. Takes less than 2 minutes — no commitment required.' },
  { icon: Phone, title: 'We Call You', desc: 'A financing specialist contacts you quickly to discuss your options and terms.' },
  { icon: CheckCircle2, title: 'Get Approved', desc: 'Receive your approval. We work with multiple lenders to find the best rate for you.' },
  { icon: CreditCard, title: 'Drive Home', desc: 'Sign the paperwork, pick your vehicle, and drive home — same day in most cases.' },
]

const benefits = [
  { icon: Users, title: 'All Credit Situations', desc: 'Good credit, bad credit, first-time buyers, or no credit history — we have options for everyone.' },
  { icon: Clock, title: 'Fast Pre-Approval', desc: 'Get a decision in minutes, not days. We respect your time and keep the process moving.' },
  { icon: DollarSign, title: 'Competitive Rates', desc: 'We shop multiple lenders simultaneously to find you the lowest rate available.' },
  { icon: ShieldCheck, title: 'Flexible Terms', desc: 'Choose terms that fit your budget — from 24 to 72 months with manageable monthly payments.' },
]

const faqs = [
  { q: 'Do you finance with bad credit?', a: 'Yes. We work with buyers across all credit scores and have lender partners who specialize in second-chance financing. Your credit situation will not disqualify you from owning a vehicle.' },
  { q: 'How much do I need for a down payment?', a: 'Down payment requirements vary by vehicle and credit profile. In many cases we can work with $0 down. Contact us to discuss your specific situation.' },
  { q: 'Will applying hurt my credit score?', a: 'Our initial pre-qualification uses a soft inquiry, which does not affect your credit score. A hard inquiry only happens when you formally apply for a loan.' },
  { q: 'Can I trade in my current car?', a: 'Absolutely. Your trade-in value is applied directly to reduce your loan amount, which lowers your monthly payment and total interest paid.' },
  { q: 'Do you offer financing for first-time buyers?', a: 'Yes. We have programs specifically designed for first-time car buyers with no credit history. We will guide you through every step of the process.' },
]

export default function FinancingPage() {
  const financingJsonLd = buildFinancingJsonLd()
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Financing', url: '/financing' },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(financingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <div className="bg-hero-gradient px-4 py-14 text-white text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300 mb-2">Auto Financing</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Car Financing in Naples, FL
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-200 text-lg">
          All credit situations welcome. Get pre-approved in minutes and drive home today.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#apply" className="btn-primary px-8 py-3.5 shadow-glow">Apply Now — It&apos;s Free</a>
          <a href={`tel:${DEALER_PHONE.replace(/[^0-9]/g, '')}`} className="btn-ghost-white px-8 py-3.5">
            <Phone className="h-4 w-4" /> Call {DEALER_PHONE}
          </a>
        </div>
      </div>

      {/* Benefits */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Finance With Us?</h2>
            <p className="section-sub">We make getting a car loan simple, fast, and stress-free in Naples, Florida.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="section-title">How Our Financing Works</h2>
            <p className="section-sub">Four simple steps from application to driving your new car.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative card p-6 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">
                  Step {i + 1}
                </span>
                <div className="mx-auto mt-3 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section id="apply" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for Financing</h2>
              <p className="text-gray-500 mb-6">No commitment. Soft credit check. Results in minutes.</p>
              <LeadForm leadType="FINANCING" vehicleName="financing" />
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="card p-5">
                    <h3 className="font-bold text-gray-900 text-sm">{q}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service area mention for local SEO */}
      <section className="bg-gray-50 px-4 py-12 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-500 text-sm leading-relaxed">
            {DEALER_NAME} provides auto financing to customers throughout{' '}
            <strong>Naples, FL</strong> and the surrounding communities including{' '}
            {LOCATION.nearbyAreas.join(', ')}, and all of{' '}
            <strong>Southwest Florida</strong>. Visit our dealership or apply online today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/inventory?condition=USED" className="btn-secondary text-sm">Browse Used Cars</Link>
            <Link href="/inventory?condition=NEW" className="btn-secondary text-sm">Browse New Cars</Link>
            <Link href="/trade-in" className="btn-secondary text-sm">Trade In Your Car</Link>
          </div>
        </div>
      </section>
    </>
  )
}

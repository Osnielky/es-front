import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, CreditCard, DollarSign, FileText, Phone, ShieldCheck, Users } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'
import { buildBreadcrumbJsonLd, buildFinancingJsonLd, buildFAQJsonLd, LOCATION, DEFAULT_OG_IMAGE, serializeJsonLd } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Car Financing in Naples, FL | Apply Online',
  description: `Get approved for auto financing at ${DEALER_NAME} in Naples, FL. We work with lender partners to find options for your credit and budget. Serving Collier County and Southwest Florida.`,
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
    title: 'Car Financing in Naples, FL | Apply Online | E&S Car Sales',
    description: `Apply online for auto financing at ${DEALER_NAME} in Naples, FL.`,
    url: `${SITE_URL}/financing`,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Car Financing Naples FL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Financing Naples FL | Apply Online',
    description: `Apply online for auto financing at ${DEALER_NAME} in Naples, FL.`,
  },
}

const steps = [
  { icon: FileText, title: 'Submit Your Info', desc: 'Fill out our short form. There’s no commitment.' },
  { icon: Phone, title: 'We Call You', desc: 'A financing specialist contacts you to go over your options and terms.' },
  { icon: CheckCircle2, title: 'Get Approved', desc: 'We submit your application to our lender partners and share the terms they offer.' },
  { icon: CreditCard, title: 'Drive Home', desc: 'Pick your vehicle, sign the paperwork, and drive home.' },
]

const benefits = [
  { icon: Users, title: 'Options for Your Situation', desc: 'First-time buyer, rebuilding credit, or established credit: tell us where you are and we’ll look at what’s available.' },
  { icon: Clock, title: 'Simple Application', desc: 'Apply online before you visit, and a specialist follows up with you directly.' },
  { icon: DollarSign, title: 'Lender Partners', desc: 'We send your application to our lender partners so you can compare the terms they offer.' },
  { icon: ShieldCheck, title: 'Terms That Fit', desc: 'Choose a term and down payment that fit your budget, subject to lender approval.' },
]

const faqs = [
  { q: 'Do you finance with bad credit?', a: 'We work with lender partners who consider a range of credit histories, including customers who are rebuilding credit. Approval and terms are set by the lender.' },
  { q: 'How much do I need for a down payment?', a: 'It depends on the vehicle, the lender and your credit profile. Contact us and we’ll go over what’s required for the car you’re interested in.' },
  { q: 'Will applying hurt my credit score?', a: 'A lender may check your credit when it reviews a formal application. Ask us first and we’ll explain what to expect before anything is submitted.' },
  { q: 'Can I trade in my current car?', a: 'Yes. Your trade-in value can be applied toward your purchase, which reduces the amount you need to finance.' },
  { q: 'Do you offer financing for first-time buyers?', a: 'Yes. We walk first-time buyers through every step and look for lender options that fit a limited credit history.' },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(financingJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />

      <div className="theme-glass">
        {/* Hero */}
        <div className="border-b border-ivory/10 bg-[#0c1e33]/30 px-4 py-14 text-center text-ivory">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#F0B27A] mb-2">Auto Financing</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            Car Financing in Naples, FL
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ivory/75 text-lg">
            Apply online, and we’ll go over the options our lender partners offer for your credit and budget.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#apply" className="btn-primary px-8 py-3.5">Apply Now — It&apos;s Free</a>
            <a href={TEL_HREF} className="btn-ghost-white px-8 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
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
              <h2 className="section-title">How Our Financing Works</h2>
              <p className="section-sub">Four simple steps from application to driving your new car.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="relative card p-6 text-center">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ivory px-3 py-0.5 text-xs font-bold text-navy">
                    Step {i + 1}
                  </span>
                  <div className="mx-auto mt-3 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ivory/10 text-[#F0B27A]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-ivory">{title}</h3>
                  <p className="mt-2 text-sm text-ivory/75 leading-relaxed">{desc}</p>
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
                <h2 className="text-2xl font-bold text-ivory mb-2">Apply for Financing</h2>
                <p className="text-ivory/75 mb-6">No commitment. A specialist will follow up to go over your options.</p>
                <LeadForm leadType="FINANCING" vehicleName="financing" />
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-2xl font-bold text-ivory mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map(({ q, a }) => (
                    <div key={q} className="card p-5">
                      <h3 className="font-bold text-ivory text-sm">{q}</h3>
                      <p className="mt-2 text-sm text-ivory/75 leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service area mention for local SEO */}
        <section className="px-4 py-12 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-ivory/75 text-sm leading-relaxed">
              {DEALER_NAME} provides auto financing to customers throughout{' '}
              <strong>Naples, FL</strong> and the surrounding communities including{' '}
              {LOCATION.nearbyAreas.join(', ')}, and all of{' '}
              <strong>Southwest Florida</strong>. Visit our dealership or apply online today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/inventory" className="btn-secondary text-sm">Browse Inventory</Link>
              <Link href="/trade-in" className="btn-secondary text-sm">Trade In Your Car</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

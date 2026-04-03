import type { Metadata } from 'next'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'
import { buildLocalBusinessJsonLd, buildFAQJsonLd, buildBreadcrumbJsonLd, LOCATION } from '@/lib/seo'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? '(239) 555-0123'
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? '1234 Tamiami Trail N, Naples, FL 34102'

export const metadata: Metadata = {
  title: 'Contact Us | Car Dealership in Naples, FL',
  description: `Contact ${DEALER_NAME} in Naples, Florida. Visit our dealership, call us at ${DEALER_PHONE}, or send a message. We're here to help you find your perfect vehicle. Serving ${LOCATION.nearbyAreas.slice(0, 3).join(', ')} and Southwest Florida.`,
  keywords: [
    'contact car dealer Naples',
    'Naples FL car dealership phone',
    'auto dealer Naples Florida address',
    'car financing Naples FL',
    'test drive Naples',
    `${DEALER_NAME} contact`,
    'Southwest Florida auto dealer',
  ].join(', '),
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: `Contact Us | ${DEALER_NAME} - Naples, FL`,
    description: `Get in touch with ${DEALER_NAME} in Naples, Florida. We're here to help you find your perfect vehicle.`,
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: `Contact ${DEALER_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact Us | ${DEALER_NAME}`,
    description: `Get in touch with ${DEALER_NAME} in Naples, Florida. We're here to help you find your perfect vehicle.`,
  },
}

export default function ContactPage() {
  const localBusinessJsonLd = buildLocalBusinessJsonLd()
  const faqJsonLd = buildFAQJsonLd()
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-hero-gradient px-4 py-14 text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact {DEALER_NAME}</h1>
          <p className="mt-3 text-brand-200">Your trusted car dealership in Naples, Florida. We&apos;re here to help.</p>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <LeadForm />

          {/* Info cards */}
          <div className="space-y-4">
            {[
              {
                icon: MapPin,
                color: 'bg-brand-50 text-brand-600',
                title: 'Visit Us',
                content: DEALER_ADDRESS,
              },
              {
                icon: Phone,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Call Us',
                content: DEALER_PHONE,
                href: `tel:${DEALER_PHONE.replace(/[^0-9]/g, '')}`,
              },
              {
                icon: Mail,
                color: 'bg-violet-50 text-violet-600',
                title: 'Email Us',
                content: process.env.NEXT_PUBLIC_DEALER_EMAIL ?? 'info@eandscars.com',
                href: `mailto:${process.env.NEXT_PUBLIC_DEALER_EMAIL ?? 'info@eandscars.com'}`,
              },
              {
                icon: Clock,
                color: 'bg-amber-50 text-amber-600',
                title: 'Hours',
                content: 'Mon–Sat: 9am – 7pm\nSun: 11am – 5pm',
              },
            ].map(({ icon: Icon, color, title, content, href }) => (
              <div key={title} className="card flex items-start gap-4 p-5">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  {href ? (
                    <a href={href} className="mt-0.5 text-sm text-brand-600 hover:underline whitespace-pre-line">
                      {content}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-500 whitespace-pre-line">{content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

import type { Metadata } from 'next'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'
import { buildLocalBusinessJsonLd, buildFAQJsonLd, buildBreadcrumbJsonLd, LOCATION, DEFAULT_OG_IMAGE, DEALER_ADDRESS, serializeJsonLd, BUSINESS_HOURS } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

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
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `Contact ${DEALER_NAME}` }],
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="theme-glass min-h-screen">
        {/* Page header */}
        <div className="border-b border-ivory/10 bg-[#0c1e33]/30 px-4 py-14 text-center text-ivory">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Contact {DEALER_NAME}</h1>
          <p className="mt-3 text-ivory/75">Your trusted car dealership in Naples, Florida. We&apos;re here to help.</p>
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
                title: 'Visit Us',
                content: DEALER_ADDRESS,
              },
              {
                icon: Phone,
                title: 'Call Us',
                content: DEALER_PHONE,
                href: TEL_HREF,
              },
              {
                icon: Mail,
                title: 'Email Us',
                content: process.env.NEXT_PUBLIC_DEALER_EMAIL ?? 'info@eandscars.com',
                href: `mailto:${process.env.NEXT_PUBLIC_DEALER_EMAIL ?? 'info@eandscars.com'}`,
              },
              {
                icon: Clock,
                title: 'Hours',
                content: BUSINESS_HOURS.map((h) => `${h.label}: ${h.display}`).join('\n'),
              },
            ].map(({ icon: Icon, title, content, href }) => (
              <div key={title} className="card flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-ivory/10 text-[#F0B27A]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ivory">{title}</p>
                  {href ? (
                    <a href={href} className="mt-0.5 rounded text-sm text-[#F0B27A] hover:text-[#f6c89c] hover:underline whitespace-pre-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
                      {content}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-ivory/75 whitespace-pre-line">{content}</p>
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

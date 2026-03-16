import type { Metadata } from 'next'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import LeadForm from '@/components/leads/LeadForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team. We are here to help you find the right vehicle and answer any questions.',
}

const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? ''

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-hero-gradient px-4 py-14 text-white text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-brand-200">We&apos;re here to help. Reach out anytime.</p>
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
                content: DEALER_ADDRESS || '123 Main St, Miami, FL 33101',
              },
              {
                icon: Phone,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Call Us',
                content: DEALER_PHONE || '(555) 000-0000',
                href: `tel:${DEALER_PHONE}`,
              },
              {
                icon: Mail,
                color: 'bg-violet-50 text-violet-600',
                title: 'Email Us',
                content: 'info@escarssales.com',
                href: 'mailto:info@escarssales.com',
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
  )
}

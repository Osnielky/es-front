import Link from 'next/link'
import { Phone, MapPin, Mail, Clock, ExternalLink, ChevronRight } from 'lucide-react'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? ''

export default function Footer() {
  const encodedAddress = encodeURIComponent(DEALER_ADDRESS || 'Naples, FL')
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
  const whatsappNumber = DEALER_PHONE.replace(/\D/g, '')

  return (
    <footer className="bg-gray-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Contact Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                <span className="text-xl font-black text-white">E&S</span>
              </div>
              <span className="text-xl font-bold text-white">{DEALER_NAME}</span>
            </Link>
            
            <p className="mt-4 text-gray-400 leading-relaxed max-w-md">
              Your trusted dealership in Naples, FL. We offer quality pre-owned vehicles 
              with honest pricing and exceptional customer service.
            </p>

            {/* Contact Cards */}
            <div className="mt-8 space-y-3">
              {DEALER_PHONE && (
                <a
                  href={`tel:${DEALER_PHONE}`}
                  className="flex items-center gap-4 rounded-xl bg-gray-800/50 p-4 transition-colors hover:bg-gray-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Call or Text</p>
                    <p className="text-lg font-bold text-white">{DEALER_PHONE}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 rounded-xl bg-gray-800/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700">
                  <Clock className="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Business Hours</p>
                  <p className="font-semibold text-white">Mon – Sat: 9am – 7pm</p>
                  <p className="text-sm text-gray-400">Sunday: By Appointment</p>
                </div>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl bg-gray-800/50 p-4 transition-colors hover:bg-gray-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700">
                  <MapPin className="h-5 w-5 text-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Visit Us</p>
                  <p className="text-sm font-medium text-white">{DEALER_ADDRESS}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm text-gray-500">Follow us:</span>
              <a
                href="https://www.instagram.com/eands_car_sales_llc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@gomez_car_sales"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-black hover:text-white"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              {whatsappNumber && (
                <a
                  href={`https://wa.me/1${whatsappNumber}?text=Hi!%20I'm%20interested%20in%20your%20vehicles.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-all hover:bg-green-600 hover:text-white"
                  aria-label="WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {/* Inventory */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Inventory</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    { href: '/inventory', label: 'All Vehicles' },
                    { href: '/inventory?condition=NEW', label: 'New Cars' },
                    { href: '/inventory?condition=USED', label: 'Used Cars' },
                    { href: '/inventory?condition=CERTIFIED', label: 'Certified Pre-Owned' },
                  ].map(({ href, label }) => (
                    <li key={label}>
                      <Link 
                        href={href} 
                        className="group flex items-center text-gray-400 transition-colors hover:text-white"
                      >
                        <ChevronRight className="mr-1 h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    { href: '/contact', label: 'Contact Us' },
                    { href: '/contact', label: 'Financing Options' },
                    { href: '/contact', label: 'Trade-In' },
                    { href: '/contact', label: 'About Us' },
                  ].map(({ href, label }) => (
                    <li key={label}>
                      <Link 
                        href={href} 
                        className="group flex items-center text-gray-400 transition-colors hover:text-white"
                      >
                        <ChevronRight className="mr-1 h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Service Areas</h3>
                <ul className="mt-4 space-y-3">
                  {['Naples', 'Marco Island', 'Bonita Springs', 'Fort Myers', 'Estero', 'Golden Gate'].map((area) => (
                    <li key={area} className="text-gray-400">
                      {area}, FL
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Map Preview */}
            <div className="mt-10">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-xl bg-gray-800"
              >
                <div className="aspect-[3/1] w-full">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
                    className="h-full w-full grayscale opacity-60 transition-all group-hover:grayscale-0 group-hover:opacity-100"
                    style={{ border: 0, pointerEvents: 'none' }}
                    loading="lazy"
                    title="Location Map"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900">
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {DEALER_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-600">
            Website created by OSMIO LLC · <a href="mailto:info@osmioservices.com" className="hover:text-gray-400 transition-colors">info@osmioservices.com</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

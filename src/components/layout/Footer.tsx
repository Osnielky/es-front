import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { DEALER_ADDRESS, BUSINESS_HOURS, LOCATION, bodyStylePath } from '@/lib/seo'
import { DEALER_PHONE, TEL_HREF, whatsappHref } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

const shopLinks = [
  { href: '/inventory', label: 'All vehicles' },
  { href: bodyStylePath('SUV'), label: 'SUVs' },
  { href: bodyStylePath('Truck'), label: 'Trucks' },
  { href: bodyStylePath('Sedan'), label: 'Sedans' },
  { href: '/inventory?sort=price-asc', label: 'Lowest price first' },
]

const dealerLinks = [
  { href: '/financing', label: 'Financing' },
  { href: '/trade-in', label: 'Sell or trade your car' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER_ADDRESS)}`

  return (
    <footer className="bg-brand-800 text-brand-200">
      <div className="mx-auto max-w-site px-4 pb-7 pt-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded text-white">
              <Image src="/logo.png" alt="" width={44} height={44} sizes="44px" className="h-11 w-11 object-contain" />
              <span className="font-display text-[22px] font-extrabold tracking-wide">
                E<span className="text-accent-400">&amp;</span>S <span className="font-semibold">Car Sales</span>
              </span>
            </Link>
            <p className="mt-3 max-w-[38ch] text-sm leading-relaxed">
              Family-owned used car lot in {LOCATION.city}, {LOCATION.state}. Honest prices, inspected cars,
              and a text back when you message us.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="https://www.instagram.com/eands_car_sales_llc"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded border border-white/20 text-white hover:bg-white/10"
                aria-label="Instagram"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@gomez_car_sales"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded border border-white/20 text-white hover:bg-white/10"
                aria-label="TikTok"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.3V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.8V9.4a6.3 6.3 0 1 0 5.4 6.3v-7a8.2 8.2 0 0 0 4.8 1.5V6.8a4.9 4.9 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href={whatsappHref("Hi! I'm interested in your vehicles.")}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded border border-white/20 text-white hover:bg-white/10"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-3 font-display text-lg font-bold text-white">Shop</p>
            <ul className="space-y-2 text-sm">
              {shopLinks.map(({ href, label }) => (
                <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Dealership */}
          <div>
            <p className="mb-3 font-display text-lg font-bold text-white">Dealership</p>
            <ul className="space-y-2 text-sm">
              {dealerLinks.map(({ href, label }) => (
                <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Visit */}
          <div>
            <p className="mb-3 font-display text-lg font-bold text-white">Visit</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 flex-none text-accent-400" aria-hidden="true" />
                  <address className="not-italic">
                    {LOCATION.streetAddress}
                    <br />
                    {LOCATION.city}, {LOCATION.stateCode} {LOCATION.zipCode}
                  </address>
                </a>
              </li>
              {BUSINESS_HOURS.map((h) => (
                <li key={h.label}>{h.label}: {h.display}</li>
              ))}
              {DEALER_PHONE && (
                <li>
                  <a href={TEL_HREF} className="font-display text-lg font-bold text-white tabular-nums hover:text-brand-100">{DEALER_PHONE}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-brand-300">
          <span>© {new Date().getFullYear()} {DEALER_NAME}. Serving {LOCATION.city} and {LOCATION.serviceArea}.</span>
          <span className="flex gap-4">
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
            <Link href="/admin/login" className="hover:text-white">Staff</Link>
            <a href="mailto:info@osmioservices.com" className="hover:text-white">Site by OSMIO</a>
          </span>
        </div>
      </div>
    </footer>
  )
}

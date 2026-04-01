import Link from 'next/link'
import { Phone, MapPin, Mail, Instagram, Facebook, Twitter } from 'lucide-react'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''
const DEALER_ADDRESS = process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? ''

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.jpeg"
                alt={DEALER_NAME}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-brand-200">
              Your trusted local dealership. Quality vehicles, honest pricing, and an experience you'll love.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-brand-200 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Inventory</p>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: '/inventory', label: 'All Vehicles' },
                { href: '/inventory?condition=NEW', label: 'New Cars' },
                { href: '/inventory?condition=USED', label: 'Used Cars' },
                { href: '/inventory?condition=CERTIFIED', label: 'Certified Pre-Owned' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-brand-200 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Services</p>
            <ul className="mt-4 space-y-2.5">
              {['Financing', 'Trade-In', 'Vehicle Service', 'Contact Us'].map((label) => (
                <li key={label}>
                  <Link href="/contact" className="text-sm text-brand-200 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Contact</p>
            <ul className="mt-4 space-y-3">
              {DEALER_ADDRESS && (
                <li className="flex gap-2.5 text-sm text-brand-200">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                  <span>{DEALER_ADDRESS}</span>
                </li>
              )}
              {DEALER_PHONE && (
                <li>
                  <a href={`tel:${DEALER_PHONE}`} className="flex gap-2.5 text-sm text-brand-200 hover:text-white transition-colors">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                    {DEALER_PHONE}
                  </a>
                </li>
              )}
              <li>
                <Link href="/contact" className="flex gap-2.5 text-sm text-brand-200 hover:text-white transition-colors">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                  Send a message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-brand-400">
            &copy; {new Date().getFullYear()} {DEALER_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-brand-500">Built with ♥ for car lovers</p>
        </div>
      </div>
    </footer>
  )
}

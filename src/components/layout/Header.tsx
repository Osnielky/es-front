'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { DEALER_PHONE, TEL_HREF, whatsappHref } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

const navLinks = [
  { href: '/inventory', label: 'Inventory' },
  { href: '/financing', label: 'Financing' },
  { href: '/trade-in', label: 'Sell or trade' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' },
]

// Sticky, always opaque. Height is --header-h / --header-space in globals.css (sticky offsets read it).
export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer on navigation
  useEffect(() => setOpen(false), [pathname])

  // Section stays highlighted on child pages (e.g. Inventory on a vehicle detail page)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) || (href === '/inventory' && pathname.startsWith('/cars-for-sale'))
  const waHref = whatsappHref("Hi! I'm interested in one of your vehicles.")

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-[0_8px_30px_-20px_rgba(23,32,54,0.25)] backdrop-blur-xl">
      <div className="mx-auto flex h-[var(--header-h)] max-w-site items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 rounded" aria-label={`${DEALER_NAME} home`}>
          <Image src="/logo.png" alt="" width={48} height={48} sizes="48px" priority className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
          <span className="font-display text-xl font-extrabold leading-none tracking-wide sm:text-[22px]">
            E<span className="text-accent-500">&amp;</span>S{' '}
            <span className="font-semibold text-brand-600">Car Sales</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`border-b-2 px-3 py-2 text-[15px] font-semibold transition-colors ${
                isActive(href) ? 'border-accent-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-brand-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {DEALER_PHONE && (
            <a
              href={TEL_HREF}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line px-3 font-display text-lg font-bold text-brand-600 transition-colors hover:border-brand-600 sm:border-0 sm:px-2"
              aria-label={`Call ${DEALER_PHONE}`}
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden sm:inline">{DEALER_PHONE}</span>
            </a>
          )}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-wa btn-sm hidden sm:inline-flex">
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            WhatsApp
          </a>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-brand-600 transition-colors hover:border-brand-600 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/70 bg-white/90 px-4 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`flex items-center border-b border-slate-100 py-3 font-display text-xl font-bold ${
                  isActive(href) ? 'text-accent-600' : 'text-brand-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-wa">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              WhatsApp
            </a>
            {DEALER_PHONE && (
              <a href={TEL_HREF} className="btn-secondary">
                <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                Call
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { DEALER, telHref, whatsappUrl } from '@/lib/contact'

const navLinks = [
  { href: '/inventory', label: 'Inventory' },
  { href: '/financing', label: 'Financing' },
  { href: '/trade-in', label: 'Sell or trade' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer on navigation
  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const waHref = whatsappUrl("Hi! I'm interested in one of your vehicles.")

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex min-h-[60px] max-w-7xl items-center gap-4 px-4 sm:min-h-[66px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${DEALER.name} home`}>
          <Image src="/logo.png" alt="" width={48} height={48} className="h-10 w-10 object-contain sm:h-11 sm:w-11" priority />
          <span className="font-display text-xl font-extrabold leading-none tracking-wide sm:text-[22px]">
            E<span className="text-accent-500">&amp;</span>S{' '}
            <span className="font-semibold text-ink">Car Sales</span>
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
                isActive(href)
                  ? 'border-accent-500 text-ink'
                  : 'border-transparent text-slate-500 hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {DEALER.phone && (
            <a
              href={telHref()}
              className="inline-flex h-11 items-center gap-2 rounded border border-line px-3 font-display text-lg font-bold tracking-wide text-ink hover:border-ink sm:border-0 sm:px-2"
              aria-label={`Call ${DEALER.phone}`}
            >
              <Phone className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">{DEALER.phone}</span>
            </a>
          )}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-wa btn-sm hidden sm:inline-flex">
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            WhatsApp
          </a>
          <button
            className="flex h-11 w-11 items-center justify-center rounded border border-line text-ink hover:border-ink lg:hidden"
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
        <div className="border-t border-line bg-white px-4 pb-5 pt-2 lg:hidden">
          <nav aria-label="Mobile">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center border-b border-slate-100 py-3 font-display text-xl font-bold ${
                  isActive(href) ? 'text-accent-500' : 'text-ink'
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
            {DEALER.phone && (
              <a href={telHref()} className="btn-secondary">
                <Phone className="h-[18px] w-[18px]" />
                Call
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/financing', label: 'Financing' },
  { href: '/trade-in', label: 'Trade-In' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === '/'
  // Section stays highlighted on child pages (e.g. Inventory on a vehicle detail page)
  const isActive = (href: string) => (href === '/' ? isHome : pathname === href || pathname.startsWith(`${href}/`))
  // Clear glass at the top of the page; once scrolled (or with the menu open) the frosted layer fades in
  const solid = scrolled || open

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    // Also check on mount: a reload or back navigation can restore a scrolled position
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Compact header height from sm up (globals.css): sticky offsets and anchor scroll-margins follow it
  useEffect(() => {
    document.documentElement.toggleAttribute('data-header-compact', scrolled)
  }, [scrolled])

  return (
    <>
    <header
      // The frosted layer is a pseudo-element so its opacity can fade (backdrop-filter itself doesn't transition)
      className={`fixed top-0 z-50 w-full border-b text-ivory transition-[border-color,box-shadow] duration-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[#0c1e33]/65 before:backdrop-blur-xl before:transition-opacity before:duration-300 ${
        solid
          ? 'border-ivory/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] before:opacity-100'
          : 'border-transparent before:opacity-0'
      }`}
    >
      <div className={`mx-auto flex max-w-site items-center justify-between px-4 py-2.5 transition-[padding] duration-300 ${scrolled ? 'sm:py-2' : 'sm:py-3.5'}`}>
        {/* Logo: the artwork is made for light backgrounds, so it sits on a small ivory tile */}
        <Link href="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]">
          <Image
            src="/logo.png"
            alt={DEALER_NAME}
            width={81}
            height={80}
            sizes="81px"
            priority
            className={`h-14 w-auto rounded-xl bg-ivory/95 p-1 transition-[height] duration-300 ${scrolled ? 'sm:h-16' : 'sm:h-20'}`}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 sm:flex lg:gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] lg:px-4 ${
                isActive(href) ? 'bg-ivory/15 text-ivory' : 'text-ivory/75 hover:bg-ivory/10 hover:text-ivory'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {DEALER_PHONE && (
            <a
              href={TEL_HREF}
              aria-label={`Call ${DEALER_PHONE}`}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide text-ivory/90 transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {/* Number collapses to the icon on tablets so the nav fits on one line */}
              <span className="hidden lg:inline">{DEALER_PHONE}</span>
            </a>
          )}
          <Link
            href="/contact"
            className="whitespace-nowrap rounded-xl border border-ivory/40 bg-ivory/[0.06] px-4 py-2 text-sm font-semibold text-ivory transition-colors hover:bg-ivory hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] lg:px-5"
          >
            Get in touch
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="rounded-b-2xl border-t border-ivory/10 bg-[#0c1e33]/90 px-4 pb-5 pt-3 shadow-lg backdrop-blur-xl sm:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive(href) ? 'bg-ivory/15 text-ivory' : 'text-ivory/80 hover:bg-ivory/10'
              }`}
            >
              {label}
            </Link>
          ))}
          {DEALER_PHONE && (
            <a
              href={TEL_HREF}
              className="mt-1 flex min-h-11 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-ivory hover:bg-ivory/10"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {DEALER_PHONE}
            </a>
          )}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-ivory px-5 py-3 text-sm font-semibold text-navy hover:bg-white"
          >
            Get in touch
          </Link>
        </div>
      )}
    </header>
    {/* Spacer = full header height (--header-space in globals.css), fixed even when the header compacts on scroll
        so content never jumps. The home hero runs under the header instead. */}
    {!isHome && <div className="h-[var(--header-space)]" aria-hidden="true" />}
    </>
  )
}

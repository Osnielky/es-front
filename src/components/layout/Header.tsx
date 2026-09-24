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
  const transparent = isHome && !scrolled && !open

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        transparent
          ? ''
          : 'bg-ivory/95 backdrop-blur-md shadow-sm border-b border-sand-200'
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-2.5 sm:py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt={DEALER_NAME}
            width={81}
            height={80}
            sizes="81px"
            priority
            className="h-14 w-auto sm:h-20"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 sm:flex lg:gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors lg:px-4 ${
                transparent
                  ? isActive(href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  : isActive(href)
                    ? 'bg-sand text-navy'
                    : 'text-navy/80 hover:bg-sand hover:text-navy'
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
              className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-semibold tracking-wide transition-colors ${
                transparent ? 'text-white/90 hover:text-white' : 'text-navy hover:text-navy-800'
              }`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {/* Number collapses to the icon on tablets so the nav fits on one line */}
              <span className="hidden lg:inline">{DEALER_PHONE}</span>
            </a>
          )}
          <Link
            href="/contact"
            className={`whitespace-nowrap rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors lg:px-5 ${
              transparent ? 'border-white/80 text-white hover:bg-white hover:text-navy' : 'border-navy text-navy hover:bg-navy hover:text-white'
            }`}
          >
            Get in touch
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-lg sm:hidden transition-colors ${
            transparent ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-sand'
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-sand-200 bg-ivory px-4 pb-5 pt-3 sm:hidden rounded-b-2xl shadow-lg">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-sand text-navy'
                  : 'text-navy/80 hover:bg-sand'
              }`}
            >
              {label}
            </Link>
          ))}
          {DEALER_PHONE && (
            <a
              href={TEL_HREF}
              className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-navy hover:bg-sand"
            >
              <Phone className="h-4 w-4" />
              {DEALER_PHONE}
            </a>
          )}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-3 flex w-full items-center justify-center rounded-xl border-2 border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
          >
            Get in touch
          </Link>
        </div>
      )}
    </header>
    {/* Spacer = fixed header height (--header-h in globals.css: 56px logo + py-2.5 on phones, 80px + py-3.5 from sm)
        so content never starts underneath it */}
    {!isHome && <div className="h-[var(--header-h)]" aria-hidden="true" />}
    </>
  )
}

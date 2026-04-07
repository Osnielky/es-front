'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === '/'
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
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt={DEALER_NAME}
            className="h-20 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                transparent
                  ? pathname === href
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  : pathname === href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {DEALER_PHONE && (
            <a
              href={`tel:${DEALER_PHONE}`}
              className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors ${
                transparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-brand-700'
              }`}
            >
              <Phone className="h-4 w-4" />
              {DEALER_PHONE}
            </a>
          )}
          <Link
            href="/admin/login"
            className={`text-xs font-medium transition-colors ${
              transparent ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin
          </Link>
          <Link href="/contact" className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-widest">
            Get a Quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-lg sm:hidden transition-colors ${
            transparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 sm:hidden rounded-b-2xl shadow-lg">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          {DEALER_PHONE && (
            <a
              href={`tel:${DEALER_PHONE}`}
              className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Phone className="h-4 w-4 text-brand-600" />
              {DEALER_PHONE}
            </a>
          )}
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center rounded-xl px-4 py-3 text-xs font-medium text-gray-500 hover:bg-gray-50"
          >
            Admin Login
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="btn-primary mt-3 w-full justify-center"
          >
            Get a Quote
          </Link>
        </div>
      )}
    </header>
    {!isHome && <div className="h-[90px] sm:h-[108px]" />}
    </>
  )
}

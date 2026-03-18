'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Car, Menu, X, Phone } from 'lucide-react'

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'
const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''

const navLinks = [
  { href: '/inventory', label: 'Inventory' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-md group-hover:bg-brand-700 transition-colors">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">{DEALER_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === href
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
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              {DEALER_PHONE}
            </a>
          )}
          <Link href="/admin/login" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Admin
          </Link>
          <Link href="/contact" className="btn-primary py-2 px-4 text-sm">
            Get a Quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 sm:hidden transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-5 pt-3 sm:hidden">
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
  )
}

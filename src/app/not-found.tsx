import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

// Also shown when a vehicle is no longer listed, or a make/model landing page has nothing in stock
export default function NotFound() {
  return (
    <div className="theme-glass px-4 py-20 sm:py-28">
      <div className="glass mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">We couldn’t find that page</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ivory/75">
          If you were looking for a specific vehicle, it may have sold. Everything we have right now is in our inventory.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/inventory" className="btn-primary">
            Browse inventory
          </Link>
          <a href={TEL_HREF} className="btn-secondary">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {DEALER_PHONE}
          </a>
        </div>
      </div>
    </div>
  )
}

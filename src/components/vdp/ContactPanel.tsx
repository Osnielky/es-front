'use client'

import Link from 'next/link'
import { BadgeDollarSign, CalendarDays, ChevronRight, MessageSquareText, Phone, Repeat } from 'lucide-react'
import { DEALER_PHONE, TEL_HREF } from '@/lib/contact'
import WhatsAppButton from '@/components/inventory/WhatsAppButton'
import { useVdp } from './VdpContext'

export function formatPrice(price: number) {
  return price > 0 ? `$${price.toLocaleString('en-US')}` : null
}

// hasSimilar: whether the page renders a #similar section for sold vehicles to point at
export default function ContactPanel({ hasSimilar = false }: { hasSimilar?: boolean }) {
  const { vehicle, openInquiry } = useVdp()
  const price = formatPrice(vehicle.price)
  const sold = vehicle.status === 'SOLD'

  return (
    <div className="vdp-panel p-5 sm:p-6 md:grid md:grid-cols-2 md:gap-x-8 desk:block">
      <div>
        <p className="vdp-eyebrow">{sold ? 'Sold' : vehicle.status === 'PENDING' ? 'Sale pending' : 'Asking price'}</p>
        {price ? (
          <p className={`price mt-1 text-[2.5rem] desk:text-[2.75rem] ${sold ? 'text-slate-400 line-through decoration-1' : ''}`}>
            {price}
          </p>
        ) : (
          <p className="mt-1 font-display text-2xl font-bold text-ink">Call for price</p>
        )}
        {!sold && vehicle.estMonthly && (
          <p className="mt-2 text-[0.9375rem] text-slate-500">
            Est. <span className="font-semibold text-ink">${vehicle.estMonthly.toLocaleString('en-US')}/mo</span>
            <a href="#finance-disclaimer" className="ml-0.5 rounded text-slate-500 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper" aria-label="How the estimate is calculated">
              *
            </a>
          </p>
        )}

        <div className="my-5 h-px bg-slate-100 md:hidden desk:block" aria-hidden="true" />

        {sold ? (
          <div className="md:mt-5 desk:mt-0">
            <h2 className="vdp-heading">This one has found a home.</h2>
            <p className="mt-1.5 text-[0.9375rem] text-slate-500">Browse similar vehicles, or tell us what you’re looking for.</p>
          </div>
        ) : (
          <div className="md:mt-5 desk:mt-0">
            <h2 className="vdp-heading">Take a closer look.</h2>
            <p className="mt-1.5 text-[0.9375rem] text-slate-500">Ask a question or plan your visit.</p>
          </div>
        )}
      </div>

      <div className="mt-5 md:mt-0 desk:mt-5">
        {sold ? (
          <div className="grid gap-2.5">
            {hasSimilar && <a href="#similar" className="vdp-btn-primary">See similar vehicles</a>}
            <Link href="/inventory" className={hasSimilar ? 'vdp-btn-outline' : 'vdp-btn-primary'}>Browse all inventory</Link>
          </div>
        ) : (
          <div className="grid gap-2.5">
            <WhatsAppButton
              vehicleId={vehicle.id}
              year={vehicle.year}
              make={vehicle.make}
              model={vehicle.model}
              trim={vehicle.trim}
              stockNumber={vehicle.stock}
              url={vehicle.url}
              label="Ask on WhatsApp"
              className="btn-wa min-h-12 text-xl"
            />
            <button type="button" onClick={() => openInquiry('availability')} aria-haspopup="dialog" className="vdp-btn-primary">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              Check availability
            </button>
            <button type="button" onClick={() => openInquiry('test-drive')} aria-haspopup="dialog" className="vdp-btn-outline">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Schedule a test drive
            </button>
          </div>
        )}

        <div className="mt-2.5 grid gap-2.5">
          <a
            href={TEL_HREF}
            className="vdp-btn-outline"
            aria-label={`Call ${DEALER_PHONE}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 border-t border-line pt-2 text-sm">
          <li>
            <Link href="/financing" className="group inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-slate-500 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
              <BadgeDollarSign className="h-4 w-4 text-accent-500" aria-hidden="true" />
              Get pre-approved
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link href="/trade-in" className="group inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-slate-500 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
              <Repeat className="h-4 w-4 text-accent-500" aria-hidden="true" />
              Value your trade-in
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

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
          <p className={`mt-1 text-[2.25rem] font-bold leading-none tracking-tight desk:text-[2.625rem] ${sold ? 'text-ivory/60 line-through decoration-1' : 'text-ivory'}`}>
            {price}
          </p>
        ) : (
          <p className="mt-1 text-2xl font-bold text-ivory">Call for price</p>
        )}
        {!sold && vehicle.estMonthly && (
          <p className="mt-2 text-[0.9375rem] text-ivory/75">
            Est. <span className="font-semibold text-ivory">${vehicle.estMonthly.toLocaleString('en-US')}/mo</span>
            <a href="#finance-disclaimer" className="ml-0.5 rounded text-ivory/75 hover:text-[#F0B27A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]" aria-label="How the estimate is calculated">
              *
            </a>
          </p>
        )}

        <div className="my-5 h-px bg-ivory/15 md:hidden desk:block" aria-hidden="true" />

        {sold ? (
          <div className="md:mt-5 desk:mt-0">
            <h2 className="vdp-heading">This one has found a home.</h2>
            <p className="mt-1.5 text-[0.9375rem] text-ivory/75">Browse similar vehicles, or tell us what you’re looking for.</p>
          </div>
        ) : (
          <div className="md:mt-5 desk:mt-0">
            <h2 className="vdp-heading">Take a closer look.</h2>
            <p className="mt-1.5 text-[0.9375rem] text-ivory/75">Ask a question or plan your visit.</p>
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

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {!sold && (
            <WhatsAppButton
              vehicleId={vehicle.id}
              year={vehicle.year}
              make={vehicle.make}
              model={vehicle.model}
              trim={vehicle.trim}
              stockNumber={vehicle.stock}
              url={vehicle.url}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ivory/20 bg-ivory/[0.06] px-3 text-sm font-semibold text-[#7ee2a8] transition-colors duration-150 hover:border-[#7ee2a8]/40 hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
            />
          )}
          <a
            href={TEL_HREF}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ivory/20 bg-ivory/[0.06] px-3 text-sm font-semibold text-ivory transition-colors duration-150 hover:border-ivory/35 hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33] ${sold ? 'col-span-2' : ''}`}
            aria-label={`Call ${DEALER_PHONE}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 border-t border-ivory/15 pt-2 text-sm">
          <li>
            <Link href="/financing" className="group inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ivory/75 transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
              <BadgeDollarSign className="h-4 w-4 text-[#F0B27A]" aria-hidden="true" />
              Get pre-approved
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link href="/trade-in" className="group inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-ivory/75 transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]">
              <Repeat className="h-4 w-4 text-[#F0B27A]" aria-hidden="true" />
              Value your trade-in
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

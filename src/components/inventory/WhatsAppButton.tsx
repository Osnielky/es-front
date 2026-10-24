'use client'

import { whatsappHref } from '@/lib/contact'
import { track } from '@/lib/analytics'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

interface Props {
  vehicleId: string
  year: number
  make: string
  model: string
  trim?: string | null
  stockNumber: string
  // Absolute detail-page URL, appended so the dealer sees exactly which listing the visitor means
  url?: string
  // Empty string renders an icon-only button (the aria-label still names the action)
  label?: string
  className?: string
}

const DEFAULT_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-700 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-800'

export default function WhatsAppButton({ vehicleId, year, make, model, trim, stockNumber, url, label = 'WhatsApp', className = DEFAULT_CLASS }: Props) {
  const vehicleName = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`
  const message = `Hi! I'm interested in the ${vehicleName} (Stock #${stockNumber}). Is it still available?${url ? ` ${url}` : ''}`

  // Log the click as a WHATSAPP lead; keepalive lets the request finish while WhatsApp opens
  const handleClick = () => {
    track('whatsapp_click', { item_id: vehicleId, item_name: vehicleName })
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: 'WhatsApp Visitor',
        email: 'whatsapp@tracked.internal',
        type: 'WHATSAPP',
        message: `WhatsApp inquiry: ${vehicleName} (Stock #${stockNumber})${url ? `\n${url}` : ''}`,
        vehicleId,
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={whatsappHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      aria-label={`Message us on WhatsApp about the ${vehicleName}`}
    >
      <WhatsAppIcon className="h-[18px] w-[18px] flex-shrink-0" />
      {label}
    </a>
  )
}

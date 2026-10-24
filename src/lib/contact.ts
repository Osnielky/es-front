/**
 * Dealer contact details, read once from NEXT_PUBLIC_* env vars.
 * Safe to import from client components (all values are public).
 */
export const DEALER = {
  name: process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales',
  phone: process.env.NEXT_PUBLIC_DEALER_PHONE ?? '',
  address: process.env.NEXT_PUBLIC_DEALER_ADDRESS ?? 'Naples, FL',
  email: process.env.NEXT_PUBLIC_DEALER_EMAIL ?? '',
  hours: [
    { days: 'Mon – Sat', time: '9am – 7pm' },
    { days: 'Sunday', time: 'by appointment' },
  ],
}

const digits = (s: string) => s.replace(/\D/g, '')

/** Number for wa.me links: explicit WhatsApp number if set, else the dealer phone. */
export function whatsappNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEALER.phone
  const d = digits(raw)
  if (!d) return ''
  return d.length === 10 ? `1${d}` : d
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`
}

export function telHref(): string {
  return `tel:+${whatsappNumber()}`
}

export function directionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DEALER.address)}`
}

/** Split "1029 Airport-Pulling Rd unit c 49 Naples FL 34104" into two lines when possible. */
export function addressLines(): [string, string | null] {
  const m = DEALER.address.match(/^(.*?)[,\s]+(Naples.*)$/i)
  return m ? [m[1].trim(), m[2].trim()] : [DEALER.address, null]
}

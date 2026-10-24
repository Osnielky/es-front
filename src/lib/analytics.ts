// Conversion events for Google Analytics 4 and Meta Pixel. Both are optional: the scripts load only when
// NEXT_PUBLIC_GA_MEASUREMENT_ID / NEXT_PUBLIC_META_PIXEL_ID are set (see components/Analytics.tsx), and
// track() is a no-op otherwise, so components can call it unconditionally.

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''

type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

// Meta standard events we mirror for the main conversions (used by Facebook/Instagram ad optimisation)
const META_EVENT: Record<string, string> = {
  generate_lead: 'Lead',
  whatsapp_click: 'Contact',
  call_click: 'Contact',
  view_item: 'ViewContent',
}

export function track(event: string, params: Params = {}) {
  if (typeof window === 'undefined') return
  try {
    window.gtag?.('event', event, params)
    const meta = META_EVENT[event]
    if (meta) window.fbq?.('track', meta, params)
  } catch {
    // Analytics must never break the page
  }
}

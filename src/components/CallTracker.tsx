'use client'

// Counts taps on phone links. One document-level listener covers every `tel:` link on the site
// (header, footer, vehicle pages, contact cards) now and in the future, so nothing has to be wrapped.
// Each tap is stored as a CALL lead, the same way WhatsApp taps are stored, and shows on the dashboard.
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

const TRACKED_EMAIL = 'call@tracked.internal'
// Ignore a second tap on the same link within this window (double taps, long-press menus)
const DEDUPE_MS = 2000

export default function CallTracker() {
  useEffect(() => {
    let lastHref = ''
    let lastAt = 0

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const link = target?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null
      if (!link) return

      const now = Date.now()
      if (link.href === lastHref && now - lastAt < DEDUPE_MS) return
      lastHref = link.href
      lastAt = now

      // Where the tap happened: page path, the page's main heading, and the vehicle if the page has one
      const path = window.location.pathname
      const heading = document.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120)
      const vehicleId = link.closest<HTMLElement>('[data-vehicle-id]')?.dataset.vehicleId
        ?? document.querySelector<HTMLElement>('[data-vehicle-id]')?.dataset.vehicleId
      const label = link.getAttribute('aria-label') ?? link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60)

      const message = [
        `Phone link tapped on ${path}`,
        heading && `Page: ${heading}`,
        label && `Link: ${label}`,
        `Number: ${link.href.replace(/^tel:/, '')}`,
      ]
        .filter(Boolean)
        .join('\n')

      track('call_click', { page_path: path, item_id: vehicleId })

      // keepalive lets the request finish while the phone app opens
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          name: 'Phone call click',
          email: TRACKED_EMAIL,
          type: 'CALL',
          message,
          vehicleId,
        }),
      }).catch(() => {})
    }

    // Capture phase, so the tap is recorded even if a component stops propagation
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}

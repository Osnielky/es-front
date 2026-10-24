'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

// Fires a view_item event once per vehicle page view (GA4 / Meta ViewContent)
export default function TrackView({ id, name, price, status }: { id: string; name: string; price: number; status: string }) {
  useEffect(() => {
    track('view_item', { item_id: id, item_name: name, value: price, currency: 'USD', status })
  }, [id, name, price, status])
  return null
}

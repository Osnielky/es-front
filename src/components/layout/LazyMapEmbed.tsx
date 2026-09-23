'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface Props {
  embedUrl: string
  title: string
  address: string
}

// The Google Maps embed pulls ~1 MB of third-party JS/tiles. It's decorative here (clicks open Maps),
// so render a static facade and only swap in the iframe on desktop, once visible and the browser is idle.
export default function LazyMapEmbed({ embedUrl, title, address }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (!el || !window.matchMedia('(min-width: 768px)').matches || connection?.saveData) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const show = () => setLoad(true)
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(show, { timeout: 2000 })
        else window.setTimeout(show, 500)
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative aspect-[3/1] w-full">
      {load ? (
        <iframe
          src={embedUrl}
          className="h-full w-full grayscale opacity-60 transition-all group-hover:grayscale-0 group-hover:opacity-100"
          style={{ border: 0, pointerEvents: 'none' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center gap-2 bg-[radial-gradient(circle_at_center,#374151_0,#1f2937_70%)] px-4 text-center text-sm text-gray-300">
          <MapPin className="h-5 w-5 flex-shrink-0 text-brand-400" aria-hidden="true" />
          <span>{address}</span>
        </div>
      )}
    </div>
  )
}

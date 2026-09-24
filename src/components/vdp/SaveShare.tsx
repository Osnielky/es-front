'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Share2, Check } from 'lucide-react'
import { useSavedCars } from '@/lib/shortlist'
import { useVdp } from './VdpContext'

// Clipboard API with a legacy fallback (older iOS, non-secure dev origins)
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

export default function SaveShare() {
  const { vehicle } = useVdp()
  const { isSaved, toggle } = useSavedCars()
  const saved = isSaved(vehicle.id)
  const [note, setNote] = useState<string | null>(null)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flash = (text: string) => {
    setNote(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNote(null), 2200)
  }

  const share = async () => {
    const data = { title: vehicle.name, text: `${vehicle.name} at E&S Car Sales`, url: vehicle.url }
    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        return
      } catch (err) {
        // Dismissing the share sheet is not an error worth reporting
        if ((err as DOMException)?.name === 'AbortError') return
      }
    }
    flash((await copyText(vehicle.url)) ? 'Link copied' : 'Couldn’t copy the link')
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          toggle({ id: vehicle.id, title: vehicle.name, href: vehicle.path, image: vehicle.image, price: vehicle.price })
          flash(saved ? 'Removed from saved cars' : 'Saved to your cars')
        }}
        aria-pressed={saved}
        className="vdp-icon-btn"
      >
        <Heart
          className={`h-5 w-5 transition-[color,fill,transform] duration-200 ${saved ? 'scale-110 fill-navy text-navy' : ''}`}
          aria-hidden="true"
        />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
      <button type="button" onClick={share} className="vdp-icon-btn">
        <Share2 className="h-5 w-5" aria-hidden="true" />
        <span>Share</span>
      </button>
      <p
        role="status"
        className={`pointer-events-none absolute right-0 top-full z-10 mt-2 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-navy px-3 py-1.5 text-sm font-medium text-white shadow-md transition-opacity duration-200 ${
          note ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {note && <Check className="h-4 w-4" aria-hidden="true" />}
        {note}
      </p>
    </div>
  )
}

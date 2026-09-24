'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

// Collapses long content to `collapsedHeight` with a "Show more" toggle. Everything stays in the
// server-rendered HTML (search engines and Ctrl+F still see it); short content renders untouched.
const FADE_MASK = 'linear-gradient(to bottom, black calc(100% - 4rem), transparent)'

export default function Expandable({
  children,
  collapsedHeight = 176,
  moreLabel = 'Show more',
  lessLabel = 'Show less',
}: {
  children: ReactNode
  collapsedHeight?: number
  moreLabel?: string
  lessLabel?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const [overflows, setOverflows] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + 48)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [collapsedHeight])

  const collapsed = overflows && !open

  return (
    <div>
      <div
        ref={ref}
        id={id}
        className="relative overflow-hidden transition-[max-height] duration-200 ease-out"
        // Collapsed content fades out through a mask (no solid color behind the glass panels to fade into)
        style={{
          maxHeight: collapsed ? collapsedHeight : overflows ? ref.current?.scrollHeight : undefined,
          ...(collapsed && { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }),
        }}
      >
        {children}
      </div>
      {overflows && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-[#F0B27A] hover:text-[#f6c89c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
        >
          {open ? lessLabel : moreLabel}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

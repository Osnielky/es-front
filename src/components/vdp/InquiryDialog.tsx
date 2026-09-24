'use client'

// Native <dialog> (focus trap, Escape, top layer) styled as a centered dialog from md and a bottom
// sheet on phones. Both forms stay mounted, so switching or closing never discards what was typed.
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { InquiryIntent, VdpVehicle } from './VdpContext'
import InquiryForm from './InquiryForm'

interface Props {
  vehicle: VdpVehicle
  intent: InquiryIntent | null
  onClose: () => void
}

const TITLES: Record<InquiryIntent, { title: string; sub: string }> = {
  availability: { title: 'Check availability', sub: 'Ask a question and we’ll reply quickly.' },
  'test-drive': { title: 'Schedule a test drive', sub: 'Pick a preferred time and we’ll confirm with you.' },
}

export default function InquiryDialog({ vehicle, intent, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (intent && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      dialog.showModal()
      // Start on the panel (announced via aria-labelledby) rather than ringing the close button on touch devices
      dialog.querySelector<HTMLElement>('[data-initial-focus]')?.focus()
      document.documentElement.style.overflow = 'hidden'
    } else if (!intent && dialog.open) {
      dialog.close()
    }
  }, [intent])

  // Fires for Escape, the close button and backdrop clicks alike
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => {
      document.documentElement.style.overflow = ''
      onClose()
      returnFocus.current?.focus({ preventScroll: true })
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  useEffect(() => () => void (document.documentElement.style.overflow = ''), [])

  // Keep the sheet above the on-screen keyboard (iOS doesn't resize the layout viewport),
  // and keep the focused field visible inside the scrollable body
  useEffect(() => {
    const dialog = ref.current
    const vv = window.visualViewport
    if (!dialog || !vv || !intent) return
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      dialog.style.setProperty('--vv-inset', `${Math.round(inset)}px`)
    }
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (el.matches('input, textarea, select')) window.setTimeout(() => el.scrollIntoView({ block: 'nearest' }), 250)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    dialog.addEventListener('focusin', onFocus)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      dialog.removeEventListener('focusin', onFocus)
      dialog.style.removeProperty('--vv-inset')
    }
  }, [intent])

  const active = intent ?? 'availability'

  return (
    <dialog
      ref={ref}
      className="vdp-dialog"
      aria-labelledby="inquiry-title"
      aria-describedby="inquiry-sub"
      // Backdrop click: the dialog element itself is the target only outside the panel
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
    >
      <div data-initial-focus tabIndex={-1} className="flex max-h-[inherit] flex-col outline-none overflow-hidden rounded-t-panel border border-line bg-ivory text-ink shadow-2xl md:rounded-panel">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id="inquiry-title" className="text-xl font-semibold text-navy">{TITLES[active].title}</h2>
            <p id="inquiry-sub" className="mt-1 text-sm text-ink-muted">
              {TITLES[active].sub}
            </p>
            <p className="mt-2 truncate text-sm font-medium text-ink">
              {vehicle.name} <span className="font-normal text-ink-muted">· Stock #{vehicle.stock}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="-mr-2 -mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
          {(['availability', 'test-drive'] as const).map((i) => (
            <div key={i} hidden={i !== active}>
              <InquiryForm vehicle={vehicle} intent={i} onDone={() => ref.current?.close()} />
            </div>
          ))}
        </div>
      </div>
    </dialog>
  )
}

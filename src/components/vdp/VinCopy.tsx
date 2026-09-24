'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from './SaveShare'

export default function VinCopy({ vin }: { vin: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="break-all font-mono text-[0.9375rem] tracking-wide">{vin}</span>
      <button
        type="button"
        onClick={async () => {
          setState((await copyText(vin)) ? 'copied' : 'failed')
          window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => setState('idle'), 2000)
        }}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-ivory/20 bg-ivory/[0.06] px-2.5 text-xs font-semibold text-ivory transition-colors duration-150 hover:border-ivory/35 hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
        aria-label={state === 'copied' ? 'VIN copied' : 'Copy VIN'}
      >
        {state === 'copied' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'VIN copied to clipboard' : state === 'failed' ? 'Could not copy the VIN' : ''}
      </span>
    </span>
  )
}

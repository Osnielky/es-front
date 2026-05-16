'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Keyboard, Search, CheckCircle2, AlertCircle, Loader2, X, Car, ScanLine } from 'lucide-react'

export interface DecodedVehicle {
  vin: string
  year: number | null
  make: string
  model: string
  trim: string
  bodyStyle: string
  fuelType: string
  engine: string
  transmission: string
}

interface Props {
  onApply: (data: DecodedVehicle) => void
}

type Mode = 'idle' | 'scan' | 'type'
type Status = 'idle' | 'scanning' | 'decoding' | 'done' | 'error'

function cleanVin(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/I/g, '1')
    .replace(/O/g, '0')
    .replace(/Q/g, '0')
    .replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

function extractVinFromText(text: string): string | null {
  const upper = text.toUpperCase()
  const tokens = upper.split(/[^A-Z0-9]+/)
  for (const token of tokens) {
    const clean = cleanVin(token)
    if (clean.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(clean)) return clean
  }
  return null
}

const ALWAYS_MANUAL = ['Price', 'Mileage', 'Exterior Color', 'Interior Color', 'Description', 'Photos']

export default function VinScanner({ onApply }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [status, setStatus] = useState<Status>('idle')
  const [vin, setVin] = useState('')
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null)
  const [filled, setFilled] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const detectedRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* already stopped */ }
      scannerRef.current = null
    }
    detectedRef.current = false
  }, [])

  const reset = useCallback(async () => {
    await stopScanner()
    setMode('idle')
    setStatus('idle')
    setVin('')
    setDecoded(null)
    setFilled([])
    setMissing([])
    setErrorMsg(null)
  }, [stopScanner])

  useEffect(() => () => { stopScanner() }, [stopScanner])

  const decodeVin = useCallback(async (vinStr: string) => {
    const clean = cleanVin(vinStr)
    if (clean.length !== 17) {
      setErrorMsg('VIN must be exactly 17 characters.')
      setStatus('error')
      return
    }
    setVin(clean)
    setStatus('decoding')
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/admin/decode-vin?vin=${clean}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Decode failed')

      const filledFields: string[] = []
      const missingFromVin: string[] = []
      if (data.year) filledFields.push(`Year: ${data.year}`); else missingFromVin.push('Year')
      if (data.make) filledFields.push(`Make: ${data.make}`); else missingFromVin.push('Make')
      if (data.model) filledFields.push(`Model: ${data.model}`); else missingFromVin.push('Model')
      if (data.trim) filledFields.push(`Trim: ${data.trim}`); else missingFromVin.push('Trim')
      if (data.bodyStyle) filledFields.push(`Body Style: ${data.bodyStyle}`); else missingFromVin.push('Body Style')
      if (data.engine) filledFields.push(`Engine: ${data.engine}`); else missingFromVin.push('Engine')
      if (data.fuelType) filledFields.push(`Fuel Type: ${data.fuelType}`); else missingFromVin.push('Fuel Type')
      if (data.transmission) filledFields.push(`Transmission: ${data.transmission}`); else missingFromVin.push('Transmission')

      setFilled(filledFields)
      setMissing([...missingFromVin, ...ALWAYS_MANUAL])
      setDecoded(data)
      setStatus('done')
      onApply(data)
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Failed to decode VIN')
    }
  }, [onApply])

  // Start html5-qrcode scanner when mode becomes 'scan'
  useEffect(() => {
    if (mode !== 'scan') return

    let mounted = true
    detectedRef.current = false

    ;(async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
        if (!mounted) return

        const scanner = new Html5Qrcode('vin-qr-reader', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.PDF_417,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ],
          verbose: false,
        })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 100 } },
          async (decodedText) => {
            if (!mounted || detectedRef.current) return
            const found = extractVinFromText(decodedText)
            if (found) {
              detectedRef.current = true
              await scanner.stop().catch(() => {})
              scannerRef.current = null
              if (mounted) await decodeVin(found)
            }
          },
          () => { /* per-frame errors are normal — ignore */ }
        )

        if (mounted) setStatus('scanning')
      } catch {
        if (mounted) {
          setMode('idle')
          setStatus('idle')
          setErrorMsg('Camera access denied. Use "Type VIN" instead.')
        }
      }
    })()

    return () => {
      mounted = false
      stopScanner()
    }
  }, [mode, decodeVin, stopScanner])

  return (
    <div className="card overflow-hidden border-2 border-brand-200 bg-brand-50/30">
      <div className="flex items-center justify-between bg-brand-600 px-5 py-3">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-white" />
          <h3 className="font-bold text-white">Quick Add from VIN</h3>
        </div>
        {mode !== 'idle' && (
          <button type="button" onClick={reset} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Mode selector */}
        {mode === 'idle' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setErrorMsg(null); setMode('scan') }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-400 bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <ScanLine className="h-5 w-5" />
              Scan Barcode
            </button>
            <button
              type="button"
              onClick={() => { setErrorMsg(null); setMode('type') }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Keyboard className="h-5 w-5" />
              Type VIN
            </button>
          </div>
        )}

        {/* html5-qrcode scanner */}
        {mode === 'scan' && status !== 'done' && (
          <div className="space-y-3">
            {/* Scanner container — html5-qrcode injects the camera feed here */}
            <div
              id="vin-qr-reader"
              className={`rounded-xl overflow-hidden ${status === 'decoding' ? 'hidden' : ''}`}
            />
            {status === 'decoding' && (
              <div className="flex items-center justify-center gap-3 rounded-xl bg-blue-50 p-8 text-blue-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">VIN detected — looking up vehicle…</span>
              </div>
            )}
            {status === 'scanning' && (
              <p className="text-center text-xs text-gray-500">
                Point the camera at the barcode on the VIN sticker (door jamb or windshield)
              </p>
            )}
          </div>
        )}

        {/* Type mode */}
        {mode === 'type' && status !== 'done' && (
          <div className="space-y-3">
            <div>
              <label className="label">Enter VIN</label>
              <input
                type="text"
                className="input font-mono uppercase tracking-widest"
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="e.g. 4T1BZ1HK5NU090001"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-400">{vin.length}/17 characters</p>
            </div>
            <button
              type="button"
              onClick={() => decodeVin(vin)}
              disabled={vin.length !== 17 || status === 'decoding'}
              className="btn-primary disabled:opacity-50"
            >
              {status === 'decoding'
                ? <><Loader2 className="h-4 w-4 animate-spin" />Decoding…</>
                : <><Search className="h-4 w-4" />Decode VIN</>}
            </button>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result summary */}
        {status === 'done' && decoded && (
          <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Form filled — {filled.length} fields auto-completed
                </span>
              </div>
              <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Filled automatically</p>
                <ul className="space-y-1">
                  {filled.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Still needed</p>
                <ul className="space-y-1">
                  {missing.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-400 shrink-0" />{m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

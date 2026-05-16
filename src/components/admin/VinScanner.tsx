'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Keyboard, Search, CheckCircle2, AlertCircle, Loader2, X, Car, ScanLine } from 'lucide-react'
import Image from 'next/image'

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

type Mode = 'idle' | 'barcode' | 'camera' | 'type'
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
  const labelMatch = upper.match(/V[\s.]*I[\s.]*N[\s.:]+\s*([A-Z0-9]{17})/)
  if (labelMatch) return cleanVin(labelMatch[1])
  const tokens = upper.split(/[^A-Z0-9]+/)
  for (const token of tokens) {
    const clean = cleanVin(token)
    if (clean.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(clean)) return clean
  }
  for (const line of upper.split('\n')) {
    const lineTokens = line.split(/[^A-Z0-9]+/)
    for (const token of lineTokens) {
      const clean = cleanVin(token)
      if (clean.length >= 15 && clean.length <= 20) {
        const match = clean.match(/[A-HJ-NPR-Z0-9]{17}/)
        if (match) return match[0]
      }
    }
  }
  return null
}

const BARCODE_FORMATS = ['code_39', 'code_128', 'pdf417', 'qr_code', 'data_matrix']

const ALWAYS_MANUAL = ['Price', 'Mileage', 'Exterior Color', 'Interior Color', 'Description', 'Photos']

export default function VinScanner({ onApply }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [status, setStatus] = useState<Status>('idle')
  const [vin, setVin] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null)
  const [filled, setFilled] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [barcodeSupported, setBarcodeSupported] = useState<boolean | null>(null)
  const [scanHint, setScanHint] = useState('Point camera at the VIN barcode')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const detectedRef = useRef(false)

  useEffect(() => {
    setBarcodeSupported('BarcodeDetector' in window)
  }, [])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    detectedRef.current = false
  }, [])

  const reset = useCallback(() => {
    stopCamera()
    setMode('idle')
    setStatus('idle')
    setVin('')
    setImagePreview(null)
    setDecoded(null)
    setFilled([])
    setMissing([])
    setErrorMsg(null)
    setScanHint('Point camera at the VIN barcode')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [stopCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  const decodeVin = useCallback(async (vinStr: string) => {
    const clean = cleanVin(vinStr)
    if (clean.length !== 17) { setErrorMsg('VIN must be exactly 17 characters.'); return }
    setVin(clean)
    setStatus('decoding')
    setErrorMsg(null)
    setDecoded(null)
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

  // Live barcode scanning loop
  const startBarcodeScanner = useCallback(async () => {
    setErrorMsg(null)
    setMode('barcode')
    setStatus('scanning')
    detectedRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // @ts-expect-error BarcodeDetector not yet in all TS libs
      const detector = new BarcodeDetector({ formats: BARCODE_FORMATS })

      const scan = async () => {
        if (detectedRef.current || !videoRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          for (const bc of barcodes) {
            const found = extractVinFromText(bc.rawValue)
            if (found) {
              detectedRef.current = true
              stopCamera()
              setScanHint('VIN detected!')
              setStatus('decoding')
              await decodeVin(found)
              return
            }
          }
          setScanHint(barcodes.length > 0 ? 'Barcode found — looking for VIN…' : 'Point camera at the VIN barcode')
        } catch { /* continue scanning */ }
        rafRef.current = requestAnimationFrame(scan)
      }

      rafRef.current = requestAnimationFrame(scan)
    } catch (e) {
      setMode('idle')
      setStatus('idle')
      setErrorMsg('Camera access denied. Use "Scan Photo" or type the VIN instead.')
    }
  }, [decodeVin, stopCamera])

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    setDecoded(null)
    setStatus('scanning')

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      const found = extractVinFromText(text)
      if (found) {
        setVin(found)
        await decodeVin(found)
      } else {
        setStatus('idle')
        setVin('')
        setErrorMsg("Couldn't detect a VIN automatically. Edit the VIN below and tap Decode.")
      }
    } catch {
      setStatus('idle')
      setErrorMsg('OCR failed. Type the VIN manually below and tap Decode.')
    }
  }

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barcodeSupported && (
              <button
                type="button"
                onClick={startBarcodeScanner}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-400 bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <ScanLine className="h-5 w-5" />
                Scan Barcode
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode('camera')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-300 bg-white px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Camera className="h-5 w-5" />
              Scan Photo
            </button>
            <button
              type="button"
              onClick={() => setMode('type')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Keyboard className="h-5 w-5" />
              Type VIN
            </button>
          </div>
        )}

        {/* Live barcode scanner */}
        {mode === 'barcode' && status !== 'done' && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="relative w-64 h-24 border-2 border-brand-400 rounded-lg">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-400 animate-[scan_2s_ease-in-out_infinite]" />
                  <span className="absolute -top-6 left-0 right-0 text-center text-xs text-white font-medium drop-shadow">
                    {scanHint}
                  </span>
                </div>
              </div>
            </div>
            {status === 'decoding' && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                VIN detected — looking up vehicle data…
              </div>
            )}
          </div>
        )}

        {/* OCR photo mode */}
        {mode === 'camera' && status !== 'done' && (
          <div className="space-y-4">
            {!imagePreview ? (
              <label className="relative block cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
                <div className="rounded-xl border-2 border-dashed border-brand-300 bg-white px-6 py-10 text-center hover:border-brand-500 transition-colors">
                  <Camera className="h-10 w-10 text-brand-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Tap to photograph the VIN sticker</p>
                  <p className="text-xs text-gray-500 mt-1">Point at the VIN label on the door jamb or dashboard</p>
                </div>
              </label>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                <Image src={imagePreview} alt="VIN capture" fill className="object-contain" />
              </div>
            )}
            {status === 'scanning' && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />Reading VIN from image…
              </div>
            )}
            {status === 'decoding' && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />Looking up vehicle data…
              </div>
            )}
            {(status === 'idle' || status === 'error') && imagePreview && (
              <div className="space-y-3">
                <div>
                  <label className="label">VIN (edit if needed)</label>
                  <input
                    type="text"
                    className="input font-mono uppercase tracking-widest"
                    maxLength={17}
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="17-character VIN"
                  />
                </div>
                <button type="button" onClick={() => decodeVin(vin)} disabled={vin.length !== 17} className="btn-primary disabled:opacity-50">
                  <Search className="h-4 w-4" />Decode VIN
                </button>
              </div>
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

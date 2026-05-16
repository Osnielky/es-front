'use client'

import { useState, useRef } from 'react'
import { Camera, Keyboard, Search, CheckCircle2, AlertCircle, Loader2, X, Car } from 'lucide-react'
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

type Mode = 'idle' | 'camera' | 'type'
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
  const cleaned = cleanVin(text)
  const match = cleaned.match(/[A-HJ-NPR-Z0-9]{17}/)
  return match ? match[0] : null
}

export default function VinScanner({ onApply }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [status, setStatus] = useState<Status>('idle')
  const [vin, setVin] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setMode('idle')
    setStatus('idle')
    setVin('')
    setImagePreview(null)
    setDecoded(null)
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const decodeVin = async (vinStr: string) => {
    const clean = cleanVin(vinStr)
    if (clean.length !== 17) {
      setErrorMsg('VIN must be exactly 17 characters.')
      return
    }
    setVin(clean)
    setStatus('decoding')
    setErrorMsg(null)
    setDecoded(null)
    try {
      const res = await fetch(`/api/admin/decode-vin?vin=${clean}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Decode failed')
      setDecoded(data)
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Failed to decode VIN')
    }
  }

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
        setErrorMsg("Couldn't detect a VIN automatically. Check the VIN below and correct it if needed, then tap Decode.")
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
          <button onClick={reset} className="text-white/70 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Mode selector */}
        {mode === 'idle' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setMode('camera')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-300 bg-white px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Camera className="h-5 w-5" />
              Scan VIN with Camera
            </button>
            <button
              type="button"
              onClick={() => setMode('type')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Keyboard className="h-5 w-5" />
              Type VIN Manually
            </button>
          </div>
        )}

        {/* Camera mode */}
        {mode === 'camera' && (
          <div className="space-y-4">
            {!imagePreview && (
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
                  <p className="font-semibold text-gray-900">Tap to open camera</p>
                  <p className="text-xs text-gray-500 mt-1">Point at the VIN sticker on the dashboard or door jamb</p>
                </div>
              </label>
            )}

            {imagePreview && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                <Image src={imagePreview} alt="VIN capture" fill className="object-contain" />
              </div>
            )}

            {status === 'scanning' && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Reading VIN from image…
              </div>
            )}

            {/* After scan: show editable VIN + decode */}
            {(status === 'idle' || status === 'error' || status === 'done') && imagePreview && (
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
                <button
                  type="button"
                  onClick={() => decodeVin(vin)}
                  disabled={vin.length !== 17}
                  className="btn-primary disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  Decode VIN
                </button>
              </div>
            )}
          </div>
        )}

        {/* Type mode */}
        {mode === 'type' && (
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
              {status === 'decoding' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Decoding…</>
              ) : (
                <><Search className="h-4 w-4" /> Decode VIN</>
              )}
            </button>
          </div>
        )}

        {/* Decoding spinner (camera mode) */}
        {status === 'decoding' && mode === 'camera' && (
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 mt-4">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Looking up vehicle data…
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="mt-4 flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Decoded result */}
        {status === 'done' && decoded && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-100 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">Vehicle Found</span>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-lg font-bold text-gray-900">
                {decoded.year} {decoded.make} {decoded.model} {decoded.trim}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                {decoded.engine && <p><span className="font-medium">Engine:</span> {decoded.engine}</p>}
                {decoded.fuelType && <p><span className="font-medium">Fuel:</span> {decoded.fuelType}</p>}
                {decoded.transmission && <p><span className="font-medium">Trans:</span> {decoded.transmission}</p>}
                {decoded.bodyStyle && <p><span className="font-medium">Body:</span> {decoded.bodyStyle}</p>}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">{decoded.vin}</p>
              <p className="text-xs text-amber-600 mt-2">Colors, price and mileage must be entered manually — they are not stored in the VIN.</p>
            </div>
            <div className="border-t border-emerald-200 p-3">
              <button
                type="button"
                onClick={() => { onApply(decoded); reset() }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

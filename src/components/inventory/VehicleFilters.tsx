'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { SlidersHorizontal, RotateCw, ChevronDown, Info } from 'lucide-react'

interface Option {
  name: string
  count: number
}

interface Props {
  searchParams: Record<string, string | undefined>
  makes: Option[]
  bodyStyles: Option[]
  yearMin: number | null
  yearMax: number | null
  // Top of the price slider; the last notch means "and up" (no priceMax param)
  priceCeiling: number
}

const MILEAGE_OPTIONS = [25000, 50000, 75000, 100000, 150000]
const PRICE_STEP = 500
// Filters that belong to this panel; Reset clears these but keeps search text and sort
const FILTER_KEYS = ['make', 'bodyStyle', 'priceMin', 'priceMax', 'yearMin', 'yearMax', 'mileageMax', 'condition', 'model']

function Select({ id, label, hideLabel = false, value, onChange, children }: { id: string; label: string; hideLabel?: boolean; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'label'}>{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input appearance-none pr-10">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function VehicleFilters({ searchParams, makes, bodyStyles, yearMin, yearMax, priceCeiling }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const push = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...searchParams, ...updates })) {
      if (v && k !== 'page') params.set(k, v)
    }
    const qs = params.toString()
    startTransition(() => router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false }))
  }

  // Price slider keeps local state while dragging and commits to the URL once the shopper pauses
  const urlMin = Number(searchParams.priceMin) || 0
  const urlMax = Number(searchParams.priceMax) || priceCeiling
  const [price, setPrice] = useState<[number, number]>([urlMin, urlMax])
  useEffect(() => setPrice([urlMin, urlMax]), [urlMin, urlMax])
  const commitTimer = useRef<ReturnType<typeof setTimeout>>()
  const commitPrice = (next: [number, number]) => {
    clearTimeout(commitTimer.current)
    commitTimer.current = setTimeout(() => {
      push({
        priceMin: next[0] > 0 ? String(next[0]) : undefined,
        priceMax: next[1] < priceCeiling ? String(next[1]) : undefined,
      })
    }, 500)
  }
  const setPriceAt = (i: 0 | 1, raw: number, commit = true) => {
    const value = Math.max(0, Math.min(priceCeiling, Number.isFinite(raw) ? raw : 0))
    const next: [number, number] = i === 0 ? [Math.min(value, price[1]), price[1]] : [price[0], Math.max(value, price[0])]
    setPrice(next)
    if (commit) commitPrice(next)
  }
  // Typed prices apply on blur/Enter so half-typed values ("$3" of "$30,000") never hit the URL
  const [draft, setDraft] = useState<[string | null, string | null]>([null, null])
  const priceInputProps = (i: 0 | 1) => ({
    inputMode: 'numeric' as const,
    className: 'input',
    value: draft[i] ?? `$${price[i].toLocaleString()}${i === 1 && price[1] >= priceCeiling ? '+' : ''}`,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => (i === 0 ? [e.target.value, d[1]] : [d[0], e.target.value])),
    onBlur: () => {
      if (draft[i] === null) return
      const digits = Number(draft[i]!.replace(/\D/g, ''))
      setPriceAt(i, i === 1 && !digits ? priceCeiling : digits)
      setDraft((d) => (i === 0 ? [null, d[1]] : [d[0], null]))
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') e.currentTarget.blur()
    },
  })

  const years = yearMin && yearMax ? Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMax - i) : []
  const activeCount = FILTER_KEYS.filter((k) => searchParams[k]).length
  const pct = (v: number) => (v / priceCeiling) * 100

  return (
    <div className="card mb-6 overflow-hidden lg:mb-0" aria-busy={isPending}>
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="filter-panel"
          className="flex items-center gap-2.5 lg:pointer-events-none"
        >
          <SlidersHorizontal className="h-5 w-5 text-navy" aria-hidden="true" />
          <span className="text-lg font-bold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-xs font-bold text-white">{activeCount}</span>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform lg:hidden ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => push(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])))}
          disabled={activeCount === 0}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-navy disabled:opacity-50"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div id="filter-panel" className={`${isOpen ? 'block' : 'hidden'} space-y-6 border-t border-sand-200 px-5 py-5 lg:block`}>
        <Select id="filter-make" label="Make" value={searchParams.make ?? ''} onChange={(v) => push({ make: v || undefined, model: undefined })}>
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m.name} value={m.name}>{m.name} ({m.count})</option>
          ))}
        </Select>

        <fieldset>
          <legend className="label">Price range</legend>
          <div className="relative mx-2 h-6">
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-sand-200" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-navy"
              style={{ left: `${pct(price[0])}%`, right: `${100 - pct(price[1])}%` }}
            />
            {([0, 1] as const).map((i) => (
              <input
                key={i}
                type="range"
                min={0}
                max={priceCeiling}
                step={PRICE_STEP}
                value={price[i]}
                onChange={(e) => setPriceAt(i, Number(e.target.value))}
                aria-label={i === 0 ? 'Minimum price' : 'Maximum price'}
                aria-valuetext={`$${price[i].toLocaleString()}${i === 1 && price[1] >= priceCeiling ? ' or more' : ''}`}
                className="range-thumb pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent"
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="sr-only" htmlFor="price-min">Minimum price</label>
            <input id="price-min" {...priceInputProps(0)} />
            <span className="text-gray-500" aria-hidden="true">–</span>
            <label className="sr-only" htmlFor="price-max">Maximum price</label>
            <input id="price-max" {...priceInputProps(1)} />
          </div>
        </fieldset>

        {years.length > 0 && (
          <fieldset>
            <legend className="label">Year</legend>
            <div className="grid grid-cols-2 gap-3">
              <Select id="filter-year-min" label="Year from" hideLabel value={searchParams.yearMin ?? ''} onChange={(v) => push({ yearMin: v || undefined })}>
                <option value="">From</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select id="filter-year-max" label="Year to" hideLabel value={searchParams.yearMax ?? ''} onChange={(v) => push({ yearMax: v || undefined })}>
                <option value="">To</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
            </div>
          </fieldset>
        )}

        <Select id="filter-mileage" label="Mileage" value={searchParams.mileageMax ?? ''} onChange={(v) => push({ mileageMax: v || undefined })}>
          <option value="">Any mileage</option>
          {MILEAGE_OPTIONS.map((m) => (
            <option key={m} value={m}>Under {m.toLocaleString()} mi</option>
          ))}
        </Select>

        {bodyStyles.length > 0 && (
          <Select id="filter-body" label="Body style" value={searchParams.bodyStyle ?? ''} onChange={(v) => push({ bodyStyle: v || undefined })}>
            <option value="">All body styles</option>
            {bodyStyles.map((b) => (
              <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
            ))}
          </Select>
        )}

        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4 flex-shrink-0 text-navy" aria-hidden="true" />
          {isPending ? 'Updating results…' : 'Filters update automatically'}
        </p>
      </div>
    </div>
  )
}

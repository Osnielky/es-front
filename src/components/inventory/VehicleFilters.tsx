'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface Props {
  searchParams: Record<string, string | undefined>
  makes: string[]
  bodyStyles: string[]
}

const PRICE_STEPS = [15000, 20000, 25000, 30000, 40000, 50000, 75000]
const MILES_STEPS = [25000, 50000, 75000, 100000, 150000]
const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'USED', label: 'Used' },
  { value: 'CERTIFIED', label: 'Certified' },
  { value: 'NEW', label: 'New' },
]

const FILTER_KEYS = ['make', 'bodyStyle', 'priceMax', 'yearMin', 'condition', 'mileageMax']

export default function VehicleFilters({ searchParams, makes, bodyStyles }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const thisYear = new Date().getFullYear()
  const yearSteps = [thisYear - 2, thisYear - 4, thisYear - 7, thisYear - 10]

  const update = useCallback(
    (patch: Record<string, string>) => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== 'page' && !(k in patch)) params.set(k, v)
      })
      Object.entries(patch).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [searchParams, router, pathname]
  )

  const clearAll = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])))
  const activeCount = FILTER_KEYS.filter((k) => searchParams[k]).length

  const chip = (key: string, value: string, label: string) => (
    <button
      key={`${key}-${value || 'any'}`}
      type="button"
      className="filter-chip"
      aria-pressed={(searchParams[key] ?? '') === value}
      onClick={() => update({ [key]: value })}
    >
      {label}
    </button>
  )

  const group = (title: string, children: React.ReactNode) => (
    <div key={title} className="border-t border-line pt-3">
      <p className="mb-2 font-display text-lg font-bold">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )

  const body = (
    <div className="space-y-4">
      {group('Body style', <>{chip('bodyStyle', '', 'All')}{bodyStyles.map((b) => chip('bodyStyle', b, b))}</>)}
      {group('Max price', <>{chip('priceMax', '', 'Any')}{PRICE_STEPS.map((p) => chip('priceMax', String(p), `$${(p / 1000).toFixed(0)}k`))}</>)}
      {group('Max miles', <>{chip('mileageMax', '', 'Any')}{MILES_STEPS.map((m) => chip('mileageMax', String(m), `${m / 1000}k`))}</>)}
      {group('Make', <>{chip('make', '', 'All')}{makes.map((m) => chip('make', m, m))}</>)}
      {group('Year', <>{chip('yearMin', '', 'Any')}{yearSteps.map((y) => chip('yearMin', String(y), `${y}+`))}</>)}
      {group('Condition', <>{CONDITIONS.map((c) => chip('condition', c.value, c.label))}</>)}
      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-sm font-semibold text-accent-500 hover:underline">
          <X className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Phone / tablet: a scrollable chip bar with a toggle for the full set */}
      <div className="lg:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="filter-chip flex-none inline-flex items-center gap-1.5 font-semibold"
            aria-pressed={open || activeCount > 0}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <span className="flex-none">{chip('priceMax', '25000', 'Under $25k')}</span>
          <span className="flex-none">{chip('priceMax', '35000', 'Under $35k')}</span>
          {bodyStyles.slice(0, 4).map((b) => <span key={b} className="flex-none">{chip('bodyStyle', b, b)}</span>)}
          <span className="flex-none">{chip('mileageMax', '50000', 'Under 50k mi')}</span>
        </div>
        {open && <div className="card mb-5 p-4">{body}</div>}
      </div>

      {/* Desktop: sidebar */}
      <aside className="sticky top-20 hidden lg:block" aria-label="Filters">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-2xl font-bold">Filters</p>
          {activeCount > 0 && <span className="pill bg-brand-600 text-white">{activeCount} active</span>}
        </div>
        {body}
      </aside>
    </>
  )
}

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface Props {
  searchParams: Record<string, string | undefined>
}

const MAKES = ['BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mercedes-Benz', 'Nissan', 'Toyota']
const BODY_STYLES = ['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Convertible', 'Hatchback', 'Wagon']

export default function VehicleFilters({ searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams()
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== key && k !== 'page') params.set(k, v)
      })
      if (value) params.set(key, value)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearFilters = () => router.push(pathname)

  const activeCount = Object.entries(searchParams).filter(
    ([k, v]) => v && v !== '' && k !== 'page'
  ).length

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-6 lg:mb-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          <span className="font-bold text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5 px-5 py-5">
        {/* Condition */}
        <div>
          <label className="label">Condition</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'NEW', label: 'New' },
              { value: 'USED', label: 'Used' },
              { value: 'CERTIFIED', label: 'CPO' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter('condition', value)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  (searchParams.condition ?? '') === value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-brand-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Make */}
        <div>
          <label className="label">Make</label>
          <select
            className="input"
            value={searchParams.make ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('make', e.target.value)}
          >
            <option value="">All Makes</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Body Style */}
        <div>
          <label className="label">Body Style</label>
          <select
            className="input"
            value={searchParams.bodyStyle ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('bodyStyle', e.target.value)}
          >
            <option value="">All Styles</option>
            {BODY_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="label">Max Price</label>
          <select
            className="input"
            value={searchParams.priceMax ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('priceMax', e.target.value)}
          >
            <option value="">Any Price</option>
            {[10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000].map((p) => (
              <option key={p} value={p}>${p.toLocaleString()}</option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <label className="label">Year Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input"
              placeholder="From"
              value={searchParams.yearMin ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('yearMin', e.target.value)}
            />
            <input
              type="number"
              className="input"
              placeholder="To"
              value={searchParams.yearMax ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('yearMax', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


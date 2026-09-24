import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getVehiclesByIds } from '@/lib/data'
import { vehiclePath } from '@/lib/seo'
import { estimateMonthlyPayment, FINANCE_DISCLAIMER } from '@/lib/finance'
import { engineLabel, MAX_COMPARE } from '@/lib/vehicle-display'
import type { Vehicle } from '@/types'

// Shopper-specific view: never index, always render fresh
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Compare Vehicles',
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: Promise<{ ids?: string }>
}

const ROWS: Array<{ label: string; value: (v: Vehicle) => string | null | undefined }> = [
  { label: 'Price', value: (v) => `$${v.price.toLocaleString()}` },
  { label: 'Est. payment*', value: (v) => `$${estimateMonthlyPayment(v.price).toLocaleString()}/mo` },
  { label: 'Status', value: (v) => (v.status === 'AVAILABLE' ? 'Available' : v.status === 'PENDING' ? 'Sale pending' : 'Sold') },
  { label: 'Year', value: (v) => String(v.year) },
  { label: 'Trim', value: (v) => v.trim },
  { label: 'Mileage', value: (v) => `${v.mileage.toLocaleString()} mi` },
  { label: 'Body style', value: (v) => v.bodyStyle },
  { label: 'Engine', value: (v) => engineLabel(v.engine) },
  { label: 'Transmission', value: (v) => v.transmission },
  { label: 'Fuel type', value: (v) => v.fuelType },
  { label: 'Exterior', value: (v) => v.exteriorColor },
  { label: 'Interior', value: (v) => v.interiorColor },
  { label: 'Title', value: (v) => (v.cleanTitle ? 'Clean title' : null) },
  { label: 'VIN', value: (v) => v.vin },
]

export default async function ComparePage({ searchParams }: Props) {
  const { ids = '' } = await searchParams
  const requested = [...new Set(ids.split(',').map((id) => id.trim()).filter(Boolean))].slice(0, MAX_COMPARE)
  const vehicles = await getVehiclesByIds(requested).catch(() => [])

  return (
    <div className="theme-glass min-h-screen">
      <div className="mx-auto max-w-site px-4 py-8">
        <Link href="/inventory" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F0B27A] hover:text-[#f6c89c] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to inventory
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ivory sm:text-4xl">Compare vehicles</h1>

        {vehicles.length < 2 ? (
          <div className="card mt-6 p-10 text-center">
            <p className="text-ivory/75">Pick at least two vehicles with &ldquo;Add to compare&rdquo; to see them side by side.</p>
            <Link href="/inventory" className="btn-primary mt-5">Browse inventory</Link>
          </div>
        ) : (
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Side-by-side comparison of {vehicles.length} vehicles</caption>
              <thead>
                <tr>
                  <td className="w-40 p-4" />
                  {vehicles.map((v) => (
                    <th key={v.id} scope="col" className="p-4 align-top font-normal">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ivory/[0.06]">
                        {v.images[0] && (
                          <Image src={v.images[0]} alt="" fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover" />
                        )}
                      </div>
                      <p className="mt-3 text-base font-bold text-ivory">{v.year} {v.make} {v.model}</p>
                      <Link href={vehiclePath(v)} className="mt-2 inline-flex items-center gap-1 font-semibold text-[#F0B27A] hover:text-[#f6c89c] hover:underline">
                        View vehicle <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(({ label, value }) => (
                  <tr key={label} className="border-t border-ivory/15">
                    <th scope="row" className="p-4 font-semibold text-ivory/75">{label}</th>
                    {vehicles.map((v) => (
                      <td key={v.id} className="p-4 text-ivory">{value(v) || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-ivory/15 p-4 text-xs text-ivory/75">* {FINANCE_DISCLAIMER}</p>
          </div>
        )}
      </div>
    </div>
  )
}

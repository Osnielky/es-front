import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Fuel, ArrowRight } from 'lucide-react'
import type { Vehicle } from '@/types'

interface Props {
  vehicle: Pick<
    Vehicle,
    'slug' | 'make' | 'model' | 'year' | 'trim' | 'price' | 'mileage' | 'condition' | 'images' | 'exteriorColor' | 'bodyStyle' | 'fuelType'
  >
}

const CONDITION_STYLES: Record<string, string> = {
  NEW: 'badge-new',
  USED: 'badge-used',
  CERTIFIED: 'badge-certified',
}
const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified',
}

export default function VehicleCard({ vehicle }: Props) {
  const { slug, make, model, year, trim, price, mileage, condition, images, fuelType } = vehicle
  const heroImage = images[0]

  return (
    <Link
      href={`/inventory/${slug}`}
      className="card-hover group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Badge */}
        <span className={`absolute left-3 top-3 ${CONDITION_STYLES[condition] ?? 'badge bg-gray-100 text-gray-700'}`}>
          {CONDITION_LABEL[condition] ?? condition}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{make}</p>
            <h2 className="mt-0.5 text-lg font-bold leading-snug text-gray-900 group-hover:text-brand-700 transition-colors">
              {year} {model}
              {trim && <span className="ml-1 text-sm font-normal text-gray-400">{trim}</span>}
            </h2>
          </div>
          <p className="shrink-0 rounded-xl bg-brand-50 px-3 py-1.5 text-lg font-extrabold text-brand-700">
            ${Number(price).toLocaleString()}
          </p>
        </div>

        {/* Specs row */}
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-gray-400" />
            {mileage.toLocaleString()} mi
          </span>
          {fuelType && (
            <span className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-gray-400" />
              {fuelType}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end text-sm font-semibold text-brand-600 group-hover:text-brand-700">
          View Details
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Settings2, Car, Heart, ImageIcon, Phone, Info, CheckCircle2 } from 'lucide-react'
import type { Vehicle } from '@/types'

const DEALER_PHONE = process.env.NEXT_PUBLIC_DEALER_PHONE ?? ''

interface Props {
  vehicle: Pick<
    Vehicle,
    | 'slug'
    | 'make'
    | 'model'
    | 'year'
    | 'trim'
    | 'price'
    | 'mileage'
    | 'condition'
    | 'images'
    | 'exteriorColor'
    | 'bodyStyle'
    | 'fuelType'
    | 'engine'
    | 'transmission'
    | 'vin'
    | 'updatedAt'
  >
}

const CONDITION_STYLES: Record<string, string> = {
  NEW: 'bg-emerald-600 text-white',
  USED: 'bg-blue-600 text-white',
  CERTIFIED: 'bg-emerald-600 text-white',
}
const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified Pre-Owned',
}

export default function VehicleCard({ vehicle }: Props) {
  const {
    make,
    model,
    year,
    trim,
    price,
    mileage,
    condition,
    images,
    exteriorColor,
    engine,
    transmission,
    vin,
    updatedAt,
  } = vehicle
  const heroImage = images[0]
  const photoCount = images.length
  const isLowMiles = mileage < 50000
  const stockNumber = vin ? `A${vin.slice(-5).toUpperCase()}` : ''

  // Random estimated monthly payment between 200 and 350
  const estMonthly = Math.floor(Math.random() * (350 - 200 + 1)) + 200

  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${year} ${make} ${model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Car className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${CONDITION_STYLES[condition]}`}>
            {condition === 'CERTIFIED' && <CheckCircle2 className="h-3.5 w-3.5" />}
            {CONDITION_LABEL[condition]}
          </span>
          {isLowMiles && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Car className="h-3.5 w-3.5" />
              Low Miles
            </span>
          )}
        </div>

        {/* Heart icon */}
        <button className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors">
          <Heart className="h-5 w-5 text-gray-400" />
        </button>

        {/* Photo count */}
        {photoCount > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <ImageIcon className="h-3.5 w-3.5" />
            {photoCount} Photos
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title & Price Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {year} {make} {model} {trim}
            </h2>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {exteriorColor && <span>{exteriorColor}</span>}
              {stockNumber && <span> • Stock #{stockNumber}</span>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900">${Number(price).toLocaleString()}</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-sm text-brand-600 font-medium">
              <span className="text-xs">📅</span>
              Est. ${estMonthly}/mo
              <span className="text-brand-400">›</span>
            </p>
          </div>
        </div>

        {/* Specs Row */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Gauge className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Mileage</p>
              <p className="text-sm font-bold text-gray-900">{mileage.toLocaleString()} mi</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Settings2 className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Engine</p>
              <p className="text-sm font-bold text-gray-900">{engine || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Car className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Transmission</p>
              <p className="text-sm font-bold text-gray-900 truncate">{transmission || 'Auto'}</p>
            </div>
          </div>
        </div>

        {/* Clean Title & Last Updated */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Clean Title
          </span>
          <p className="text-xs text-gray-400">Last Updated: {formattedDate}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link
            href={`/inventory/${vin}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Info className="h-4 w-4" />
            Details
          </Link>
          <a
            href={`https://wa.me/1${DEALER_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in the ${year} ${make} ${model}${trim ? ` ${trim}` : ''} (Stock #${stockNumber}). Is it still available?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <a
            href={`tel:${DEALER_PHONE}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-brand-600 px-3 py-2.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        </div>
      </div>
    </div>
  )
}

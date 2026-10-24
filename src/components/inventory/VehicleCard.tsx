import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Cog, Settings2, Car, Camera, Phone } from 'lucide-react'
import type { Vehicle } from '@/types'
import WhatsAppButton from './WhatsAppButton'
import { estimateMonthlyPayment, formatUsd, PAYMENT_ASSUMPTIONS, shortMiles } from '@/lib/pricing'
import { DEALER, telHref } from '@/lib/contact'

interface Props {
  vehicle: Pick<
    Vehicle,
    | 'id'
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
    | 'engine'
    | 'transmission'
    | 'vin'
    | 'createdAt'
  >
  /** Load the hero image eagerly (first row on a page). */
  priority?: boolean
}

const NEW_ARRIVAL_DAYS = 7

export default function VehicleCard({ vehicle, priority = false }: Props) {
  const { id, slug, make, model, year, trim, price, mileage, condition, images, exteriorColor, engine, transmission, vin, createdAt } = vehicle
  const heroImage = images[0]
  const title = `${year} ${make} ${model}`
  const href = `/inventory/${slug}`
  const monthly = estimateMonthlyPayment(price)
  const stockNumber = vin ? `A${vin.slice(-5).toUpperCase()}` : ''
  const isNewArrival = Date.now() - new Date(createdAt).getTime() < NEW_ARRIVAL_DAYS * 86_400_000
  const subtitle = [trim, exteriorColor].filter(Boolean).join(' · ')

  return (
    <article className="card-hover flex min-w-0 flex-col overflow-hidden">
      {/* Photo */}
      <Link href={href} className="group relative block aspect-[4/3] overflow-hidden bg-slate-100" aria-label={`${title} ${trim ?? ''}`.trim()}>
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${title}${exteriorColor ? `, ${exteriorColor}` : ''}`}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <Car className="h-14 w-14" strokeWidth={1.25} />
            <span className="text-xs font-semibold">Photos coming soon</span>
          </div>
        )}

        <span className={`chip absolute left-2.5 top-2.5 ${isNewArrival ? 'bg-emerald-600/95' : ''}`}>
          {isNewArrival ? 'Just arrived' : condition === 'NEW' ? 'New' : condition === 'CERTIFIED' ? 'Certified' : 'Used'}
          {!isNewArrival && <span className="opacity-80">· {shortMiles(mileage)}</span>}
        </span>

        {images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-sm bg-brand-800/75 px-2 py-1 text-xs font-semibold text-white">
            <Camera className="h-3.5 w-3.5" />
            {images.length}
          </span>
        )}
      </Link>

      {/* Sticker */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link href={href} className="block">
          <h3 className="font-display text-2xl font-bold leading-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
        </Link>

        <div className="flex items-end justify-between gap-3 border-y border-dashed border-line py-2.5">
          <div>
            <p className="price text-[32px]">{formatUsd(price)}</p>
            <p className="mt-1 text-xs text-slate-500">Plus tax, tag &amp; title</p>
          </div>
          {monthly > 0 && (
            <div className="text-right">
              <p className="font-display text-xl font-bold leading-none text-ink tabular-nums">{formatUsd(monthly)}/mo</p>
              <p className="mt-1 text-xs text-slate-500">est. with {formatUsd(PAYMENT_ASSUMPTIONS.downPayment)} down</p>
            </div>
          )}
        </div>

        <ul className="flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-slate-500">
          <li className="inline-flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-brand-600" />{mileage.toLocaleString('en-US')} mi</li>
          {engine && <li className="inline-flex items-center gap-1.5"><Cog className="h-3.5 w-3.5 text-brand-600" />{engine}</li>}
          {transmission && <li className="inline-flex items-center gap-1.5"><Settings2 className="h-3.5 w-3.5 text-brand-600" />{transmission}</li>}
        </ul>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-1">
          <WhatsAppButton vehicleId={id} vin={vin} year={year} make={make} model={model} trim={trim} price={price} stockNumber={stockNumber} />
          {DEALER.phone && (
            <a href={telHref()} className="btn-secondary btn-sm px-3" aria-label={`Call about the ${title}`}>
              <Phone className="h-[18px] w-[18px]" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

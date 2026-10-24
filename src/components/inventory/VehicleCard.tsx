import Link from 'next/link'
import { Gauge, Settings2, Cog, CheckCircle2, ArrowRight, Search } from 'lucide-react'
import type { Vehicle } from '@/types'
import { vehiclePath, vehicleUrl, stockNumber as getStockNumber } from '@/lib/seo'
import { estimateMonthlyPayment } from '@/lib/finance'
import { engineLabel, shortMiles } from '@/lib/vehicle-display'
import WhatsAppButton from './WhatsAppButton'
import CardImageCarousel from './CardImageCarousel'
import { SaveCarButton, CompareCheckbox } from './ShortlistControls'

interface Props {
  // First cards in a list are above the fold on mobile — load their image eagerly for LCP
  priority?: boolean
  // h3 when the card sits under a section h2 (e.g. "Similar vehicles")
  headingLevel?: 'h2' | 'h3'
  layout?: 'grid' | 'list'
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
    | 'interiorColor'
    | 'bodyStyle'
    | 'engine'
    | 'transmission'
    | 'vin'
    | 'cleanTitle'
  > & { status?: Vehicle['status'] }
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified',
}

// Card = photo on top, then a "window sticker": name, price with payment estimate, specs, actions.
// Sold and pending vehicles keep the same shape but say so plainly and swap the contact actions.
export default function VehicleCard({ vehicle, priority = false, headingLevel: Heading = 'h2', layout = 'grid' }: Props) {
  const { make, model, year, trim, price, mileage, condition, images, exteriorColor, bodyStyle, engine, transmission, cleanTitle } = vehicle
  const status = vehicle.status ?? 'AVAILABLE'
  const isSold = status === 'SOLD'
  const isPending = status === 'PENDING'
  const href = vehiclePath(vehicle)
  const title = `${year} ${make} ${model}`
  const fullTitle = [year, make, model, trim].filter(Boolean).join(' ')
  const estMonthly = !isSold && price > 0 ? estimateMonthlyPayment(price) : 0
  const isList = layout === 'list'
  const shortlistItem = { id: vehicle.id, title: fullTitle, href, image: images[0], price }
  const subtitle = [trim, exteriorColor].filter(Boolean).join(' · ') || bodyStyle

  const specs = [
    { icon: Gauge, value: `${mileage.toLocaleString('en-US')} mi`, label: 'Mileage' },
    { icon: Cog, value: engineLabel(engine), label: 'Engine' },
    { icon: Settings2, value: transmission, label: 'Transmission' },
  ].filter((s): s is typeof s & { value: string } => Boolean(s.value))

  return (
    <article className={`card-hover flex min-w-0 overflow-hidden ${isList ? 'flex-col md:flex-row' : 'flex-col'} ${isSold ? 'opacity-95' : ''}`}>
      {/* Photo */}
      <div className={`relative flex-shrink-0 overflow-hidden bg-slate-100 ${isList ? 'aspect-[4/3] md:aspect-auto md:w-[42%]' : 'aspect-[4/3]'}`}>
        <div className={isSold ? 'h-full w-full saturate-[0.6]' : 'h-full w-full'}>
          <CardImageCarousel
            images={images}
            alt={`${fullTitle} ${isSold ? 'sold by' : 'for sale at'} E&S Car Sales in Naples, FL`}
            href={href}
            priority={priority}
            sizes={isList ? '(max-width: 768px) 100vw, 480px' : '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'}
          />
        </div>
        {isSold ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center rounded-lg bg-red-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Sold</span>
        ) : isPending ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Sale pending</span>
        ) : (
          <span className="chip pointer-events-none absolute left-2.5 top-2.5">
            {CONDITION_LABEL[condition]}
            <span className="opacity-80">· {shortMiles(mileage)}</span>
          </span>
        )}
        {!isSold && (
          <div className="absolute right-2.5 top-2.5">
            <SaveCarButton item={shortlistItem} />
          </div>
        )}
      </div>

      {/* Sticker */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading className="font-display text-2xl font-bold leading-tight text-ink">
              <Link href={href} className="rounded hover:text-brand-600">{title}</Link>
            </Heading>
            {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
          </div>
          {cleanTitle && !isSold && (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clean title
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 border-y border-dashed border-line py-2.5">
          <div>
            {isSold ? (
              <>
                <p className="font-display text-[28px] font-extrabold leading-none text-slate-400 line-through decoration-2 tabular-nums">
                  {price > 0 ? `$${price.toLocaleString('en-US')}` : 'Sold'}
                </p>
                <p className="mt-1 text-xs font-semibold text-red-600">Sold{price > 0 ? ' at this price' : ''}</p>
              </>
            ) : price > 0 ? (
              <>
                <p className="price text-[32px]">${price.toLocaleString('en-US')}</p>
                <p className="mt-1 text-xs text-slate-500">Plus tax, tag &amp; title</p>
              </>
            ) : (
              <p className="font-display text-2xl font-bold text-ink">Call for price</p>
            )}
          </div>
          {estMonthly > 0 && (
            <div className="text-right">
              <p className="font-display text-xl font-bold leading-none text-ink tabular-nums">${estMonthly.toLocaleString('en-US')}/mo<sup className="text-slate-400">*</sup></p>
              <p className="mt-1 text-xs text-slate-500">est. per month</p>
            </div>
          )}
        </div>

        {specs.length > 0 && (
          <dl className="flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-slate-500">
            {specs.map(({ icon: Icon, value, label }) => (
              <div key={label} className="inline-flex items-center gap-1.5">
                <dt className="flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {isSold ? (
          <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
            <Link href={`/inventory?make=${encodeURIComponent(make)}`} className="btn-primary btn-sm" aria-label={`Find a similar ${make}`}>
              <Search className="h-4 w-4" aria-hidden="true" />
              Find similar
            </Link>
            <Link href={href} aria-label={`See details: ${fullTitle} (sold)`} className="btn-secondary btn-sm">
              See details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
              <WhatsAppButton
                vehicleId={vehicle.id}
                year={year}
                make={make}
                model={model}
                trim={trim}
                stockNumber={getStockNumber(vehicle)}
                url={vehicleUrl(vehicle)}
                label="WhatsApp"
                className="btn-wa btn-sm"
              />
              <Link href={href} aria-label={`View vehicle: ${fullTitle}`} className="btn-navy btn-sm">
                Details
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div>
              <CompareCheckbox item={shortlistItem} />
            </div>
          </>
        )}
      </div>
    </article>
  )
}

import Link from 'next/link'
import { Gauge, Settings2, Car, CheckCircle2, Calculator, ArrowRight, Cog } from 'lucide-react'
import type { Vehicle } from '@/types'
import { vehiclePath, vehicleUrl, stockNumber as getStockNumber } from '@/lib/seo'
import { estimateMonthlyPayment, FINANCE_DISCLAIMER } from '@/lib/finance'
import { colorSwatch, engineLabel } from '@/lib/vehicle-display'
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
  >
}

const CONDITION_LABEL: Record<string, string> = {
  NEW: 'New',
  USED: 'Used',
  CERTIFIED: 'Certified',
}

function ColorSpec({ label, color }: { label: string; color: string | null }) {
  if (!color) return null
  const swatch = colorSwatch(color)
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ivory/75">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-ivory">
        <span
          className="h-5 w-5 flex-shrink-0 rounded-full border border-ivory/30"
          style={{ background: swatch ?? 'repeating-linear-gradient(45deg,rgb(255 253 248 / 0.35),rgb(255 253 248 / 0.35) 3px,transparent 3px,transparent 6px)' }}
          aria-hidden="true"
        />
        <span className="truncate">{color}</span>
      </p>
    </div>
  )
}

export default function VehicleCard({ vehicle, priority = false, headingLevel: Heading = 'h2', layout = 'grid' }: Props) {
  const { make, model, year, trim, price, mileage, condition, images, exteriorColor, interiorColor, bodyStyle, engine, transmission, cleanTitle } = vehicle
  const href = vehiclePath(vehicle)
  const title = `${year} ${make} ${model}`
  const fullTitle = [year, make, model, trim].filter(Boolean).join(' ')
  const estMonthly = estimateMonthlyPayment(Number(price))
  const isList = layout === 'list'
  const shortlistItem = { id: vehicle.id, title: fullTitle, href, image: images[0], price: Number(price) }

  const specs = [
    { icon: Gauge, value: `${mileage.toLocaleString()} mi`, label: 'Mileage' },
    { icon: Settings2, value: transmission, label: 'Transmission' },
    { icon: Cog, value: engineLabel(engine), label: 'Engine' },
    { icon: Car, value: bodyStyle, label: 'Body style' },
  ].filter((s): s is typeof s & { value: string } => Boolean(s.value))

  return (
    <article className={`card flex overflow-hidden ${isList ? 'flex-col md:flex-row' : 'flex-col'}`}>
      {/* Photo */}
      <div className={`relative flex-shrink-0 overflow-hidden bg-ivory/[0.06] ${isList ? 'aspect-[16/9] md:aspect-auto md:w-[42%]' : 'aspect-[16/9]'}`}>
        <CardImageCarousel
          images={images}
          alt={`${fullTitle} for sale in Naples, FL`}
          href={href}
          priority={priority}
          sizes={isList ? '(max-width: 768px) 100vw, 480px' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px'}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-ivory/20 bg-[#0c1e33]/75 px-3 py-1 text-xs font-semibold text-ivory shadow-sm backdrop-blur-md">
          {CONDITION_LABEL[condition]}
        </span>
        <div className="absolute right-3 top-3">
          <SaveCarButton item={shortlistItem} />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading className="text-xl font-bold leading-tight text-ivory">
              <Link href={href} className="hover:text-[#F0B27A]">
                {title}
              </Link>
            </Heading>
            {(trim || bodyStyle) && <p className="mt-0.5 text-sm text-ivory/75">{trim ?? bodyStyle}</p>}
          </div>
          {cleanTitle && (
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Clean title
            </span>
          )}
        </div>

        <p className="mt-2 text-3xl font-extrabold tracking-tight text-ivory">${Number(price).toLocaleString()}</p>

        {estMonthly > 0 && (
          <p className="mt-3 flex items-center gap-3 rounded-xl bg-ivory/[0.08] px-4 py-2.5 text-ivory/90" title={FINANCE_DISCLAIMER}>
            <Calculator className="h-5 w-5 flex-shrink-0 text-[#F0B27A]" aria-hidden="true" />
            <span>
              Est. <strong className="font-bold text-ivory">${estMonthly.toLocaleString()}</strong>/mo<sup className="text-ivory/75">*</sup>
            </span>
          </p>
        )}

        {specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 border-b border-ivory/15">
            {specs.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 border-t border-ivory/15 py-2.5 ${i % 2 === 0 ? 'pr-3' : 'border-l pl-3'}`}
              >
                <dt className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-ivory/70" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="truncate text-sm font-medium text-ivory/90">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {(exteriorColor || interiorColor) && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-b border-ivory/15 pb-3">
            <ColorSpec label="Exterior" color={exteriorColor} />
            <ColorSpec label="Interior" color={interiorColor} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={href}
            aria-label={`View vehicle: ${fullTitle}`}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-ivory px-3 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
          >
            View vehicle
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <WhatsAppButton
            vehicleId={vehicle.id}
            year={year}
            make={make}
            model={model}
            trim={trim}
            stockNumber={getStockNumber(vehicle)}
            url={vehicleUrl(vehicle)}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-emerald-400/50 bg-emerald-400/10 px-3 py-2.5 text-sm font-semibold text-emerald-200 transition-colors hover:border-emerald-300/70 hover:bg-emerald-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0B27A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1e33]"
          />
        </div>

        <div className="mt-3">
          <CompareCheckbox item={shortlistItem} />
        </div>
      </div>
    </article>
  )
}

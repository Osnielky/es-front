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
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-gray-800">
        <span
          className="h-5 w-5 flex-shrink-0 rounded-full border border-sand-300"
          style={{ background: swatch ?? 'repeating-linear-gradient(45deg,#e8dcc5,#e8dcc5 3px,#fffdf8 3px,#fffdf8 6px)' }}
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
      <div className={`relative flex-shrink-0 overflow-hidden bg-sand ${isList ? 'aspect-[16/9] md:aspect-auto md:w-[42%]' : 'aspect-[16/9]'}`}>
        <CardImageCarousel
          images={images}
          alt={`${fullTitle} for sale in Naples, FL`}
          href={href}
          priority={priority}
          sizes={isList ? '(max-width: 768px) 100vw, 480px' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px'}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white shadow-sm">
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
            <Heading className="text-xl font-bold leading-tight text-gray-900">
              <Link href={href} className="hover:text-navy-800">
                {title}
              </Link>
            </Heading>
            {(trim || bodyStyle) && <p className="mt-0.5 text-sm text-gray-600">{trim ?? bodyStyle}</p>}
          </div>
          {cleanTitle && (
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-600 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Clean title
            </span>
          )}
        </div>

        <p className="mt-2 text-3xl font-extrabold tracking-tight text-navy">${Number(price).toLocaleString()}</p>

        {estMonthly > 0 && (
          <p className="mt-3 flex items-center gap-3 rounded-xl bg-sand px-4 py-2.5 text-gray-800" title={FINANCE_DISCLAIMER}>
            <Calculator className="h-5 w-5 flex-shrink-0 text-navy" aria-hidden="true" />
            <span>
              Est. <strong className="font-bold text-navy">${estMonthly.toLocaleString()}</strong>/mo<sup className="text-gray-500">*</sup>
            </span>
          </p>
        )}

        {specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 border-b border-sand-200">
            {specs.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 border-t border-sand-200 py-2.5 ${i % 2 === 0 ? 'pr-3' : 'border-l pl-3'}`}
              >
                <dt className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-navy" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="truncate text-sm font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {(exteriorColor || interiorColor) && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-b border-sand-200 pb-3">
            <ColorSpec label="Exterior" color={exteriorColor} />
            <ColorSpec label="Interior" color={interiorColor} />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={href}
            aria-label={`View vehicle: ${fullTitle}`}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-navy px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
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
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-green-700 bg-white px-3 py-2.5 text-sm font-semibold text-green-800 transition-colors hover:bg-green-50"
          />
        </div>

        <div className="mt-3">
          <CompareCheckbox item={shortlistItem} />
        </div>
      </div>
    </article>
  )
}

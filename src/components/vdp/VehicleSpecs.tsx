// Key specifications panel (server component): three columns from md, two on phones.
// Values come straight from the inventory record; anything not recorded says so instead of guessing.
import { Armchair, Car, Cog, Gauge, Palette, Cylinder } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Vehicle } from '@/types'
import { colorSwatch, cylinderLabel } from '@/lib/vehicle-display'

export const NOT_LISTED = 'Not listed'

function ColorValue({ name }: { name: string | null }) {
  if (!name) return <span className="font-normal text-ink-muted">{NOT_LISTED}</span>
  const swatch = colorSwatch(name)
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-4 w-4 flex-shrink-0 rounded-full border ${swatch ? 'border-ink/25' : 'border-dashed border-ink-muted'}`}
        style={swatch ? { backgroundColor: swatch } : undefined}
        aria-hidden="true"
      />
      <span className="min-w-0 break-words">{name}</span>
    </span>
  )
}

export default function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const specs: Array<{ icon: LucideIcon; label: string; value: React.ReactNode }> = [
    { icon: Gauge, label: 'Mileage', value: `${vehicle.mileage.toLocaleString('en-US')} mi` },
    { icon: Cog, label: 'Transmission', value: vehicle.transmission },
    { icon: Cylinder, label: 'Engine', value: cylinderLabel(vehicle.engine) ?? vehicle.engine },
    { icon: Car, label: 'Body style', value: vehicle.bodyStyle },
    { icon: Palette, label: 'Exterior', value: <ColorValue name={vehicle.exteriorColor} /> },
    { icon: Armchair, label: 'Interior', value: <ColorValue name={vehicle.interiorColor} /> },
  ]

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3">
      {specs.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex min-w-0 gap-3 bg-ivory px-4 py-4 sm:px-5 sm:py-5">
          <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy" strokeWidth={1.5} aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-[0.8125rem] font-medium text-ink-muted">{label}</dt>
            <dd className="mt-0.5 break-words text-[0.9375rem] font-semibold text-ink sm:text-base">
              {value ?? <span className="font-normal text-ink-muted">{NOT_LISTED}</span>}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

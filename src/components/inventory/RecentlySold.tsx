import Link from 'next/link'
import type { Vehicle } from '@/types'
import VehicleCard from './VehicleCard'

interface Props {
  vehicles: Vehicle[]
  /** What the list is scoped to, e.g. "Toyota" or "SUVs"; used in the heading */
  subject?: string
  /** Show the "See all sold" link (hidden on the sold page itself) */
  showAllLink?: boolean
  headingLevel?: 'h2' | 'h3'
}

// Sold vehicles stay on the site as proof of what the lot carries and what it sells for. They sit after
// the available cars, read clearly as sold, and send shoppers to similar vehicles instead of dead ends.
export default function RecentlySold({ vehicles, subject, showAllLink = true, headingLevel: Heading = 'h2' }: Props) {
  if (vehicles.length === 0) return null
  return (
    <section aria-labelledby="sold-heading" className="mt-12 border-t border-line pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Recently sold</p>
          <Heading id="sold-heading" className="section-title mt-2">
            {subject ? `${subject} we've sold` : 'Sold from this lot'} <span className="highlight">recently</span>
          </Heading>
          <p className="section-sub max-w-[60ch]">
            These cars have found new owners. We keep them here so you can see what we carry and what it sells for.
            Like one of them? Ask us and we&apos;ll tell you when something similar arrives.
          </p>
        </div>
        {showAllLink && (
          <Link href="/inventory/sold" className="btn-secondary btn-sm">See all sold vehicles</Link>
        )}
      </div>
      <div className="vehicle-grid">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} headingLevel="h3" />
        ))}
      </div>
    </section>
  )
}

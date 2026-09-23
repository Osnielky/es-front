import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInventoryFacets, getVehicles } from '@/lib/data'
import { bodyStylePath, makePath } from '@/lib/seo'
import { conditionPrefix, landingIntro, landingMetadata } from '@/lib/landing'
import InventoryLanding from '@/components/inventory/InventoryLanding'

export const revalidate = 300
export async function generateStaticParams() {
  return []
}

interface Props {
  params: Promise<{ bodyStyle: string }>
}

// "SUV" → "SUVs", "Truck" → "Trucks"; leaves already-plural or odd names alone
function pluralize(name: string) {
  return /s$/i.test(name) ? name : `${name}s`
}

async function load(styleSlug: string) {
  const { bodyStyles } = await getInventoryFacets()
  const style = bodyStyles.find((s) => s.slug === styleSlug)
  if (!style) return null
  const { vehicles } = await getVehicles({ bodyStyle: style.name, limit: 60 })
  if (vehicles.length === 0) return null
  const h1 = `${conditionPrefix(vehicles)}${pluralize(style.name)} for Sale in Naples, FL`
  return { style, bodyStyles, vehicles, h1 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).bodyStyle)
  if (!data) return { title: 'Not Found', robots: { index: false } }
  return landingMetadata(data.h1, bodyStylePath(data.style.name), data.vehicles)
}

export default async function BodyStyleLandingPage({ params }: Props) {
  const data = await load((await params).bodyStyle)
  if (!data) notFound()
  const { style, bodyStyles, vehicles, h1 } = data
  const makeCounts = new Map<string, number>()
  for (const v of vehicles) makeCounts.set(v.make, (makeCounts.get(v.make) ?? 0) + 1)

  return (
    <InventoryLanding
      h1={h1}
      intro={landingIntro(style.name, vehicles, `Makes include ${[...makeCounts.keys()].slice(0, 5).join(', ')}.`)}
      vehicles={vehicles}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Inventory', url: '/inventory' },
        { name: pluralize(style.name), url: bodyStylePath(style.name) },
      ]}
      related={[
        {
          heading: `${pluralize(style.name)} by make`,
          links: [...makeCounts.entries()].map(([make, count]) => ({ href: makePath(make), label: make, count })),
        },
        {
          heading: 'Other body styles',
          links: bodyStyles.filter((s) => s.slug !== style.slug).map((s) => ({ href: bodyStylePath(s.name), label: pluralize(s.name), count: s.count })),
        },
      ]}
    />
  )
}

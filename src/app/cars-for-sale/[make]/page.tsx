import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInventoryFacets, getVehicles } from '@/lib/data'
import { makePath, modelPath, bodyStylePath } from '@/lib/seo'
import { conditionPrefix, landingIntro, landingMetadata } from '@/lib/landing'
import InventoryLanding from '@/components/inventory/InventoryLanding'

export const revalidate = 300
export async function generateStaticParams() {
  return []
}

interface Props {
  params: Promise<{ make: string }>
}

async function load(makeSlug: string) {
  const { makes, bodyStyles } = await getInventoryFacets()
  const make = makes.find((m) => m.slug === makeSlug)
  if (!make) return null
  const { vehicles } = await getVehicles({ make: make.name, limit: 60 })
  if (vehicles.length === 0) return null
  const h1 = `${conditionPrefix(vehicles)}${make.name} for Sale in Naples, FL`
  return { make, makes, bodyStyles, vehicles, h1 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).make)
  if (!data) return { title: 'Not Found', robots: { index: false } }
  return landingMetadata(data.h1, makePath(data.make.name), data.vehicles)
}

export default async function MakeLandingPage({ params }: Props) {
  const data = await load((await params).make)
  if (!data) notFound()
  const { make, makes, bodyStyles, vehicles, h1 } = data
  const styleSlugs = new Set(vehicles.map((v) => v.bodyStyle).filter(Boolean))

  return (
    <InventoryLanding
      h1={h1}
      intro={landingIntro(make.name, vehicles, `Models in stock include ${make.models.slice(0, 5).map((m) => m.name).join(', ')}.`)}
      vehicles={vehicles}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Inventory', url: '/inventory' },
        { name: make.name, url: makePath(make.name) },
      ]}
      related={[
        {
          heading: `${make.name} models in stock`,
          links: make.models.map((m) => ({ href: modelPath(make.name, m.name), label: `${make.name} ${m.name}`, count: m.count })),
        },
        {
          heading: 'Shop by body style',
          links: bodyStyles.filter((s) => styleSlugs.has(s.name)).map((s) => ({ href: bodyStylePath(s.name), label: s.name, count: s.count })),
        },
        {
          heading: 'Other makes',
          links: makes.filter((m) => m.slug !== make.slug).map((m) => ({ href: makePath(m.name), label: m.name, count: m.count })),
        },
      ]}
    />
  )
}

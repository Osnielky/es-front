import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInventoryFacets, getVehicles } from '@/lib/data'
import { makePath, modelPath } from '@/lib/seo'
import { conditionPrefix, landingIntro, landingMetadata } from '@/lib/landing'
import InventoryLanding from '@/components/inventory/InventoryLanding'

export const revalidate = 300
export async function generateStaticParams() {
  return []
}

interface Props {
  params: Promise<{ make: string; model: string }>
}

async function load(makeSlug: string, modelSlug: string) {
  const { makes } = await getInventoryFacets()
  const make = makes.find((m) => m.slug === makeSlug)
  const model = make?.models.find((m) => m.slug === modelSlug)
  if (!make || !model) return null
  const { vehicles } = await getVehicles({ make: make.name, model: model.name, exactModel: true, limit: 60 })
  if (vehicles.length === 0) return null
  const h1 = `${conditionPrefix(vehicles)}${make.name} ${model.name} for Sale in Naples, FL`
  return { make, model, vehicles, h1 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make, model } = await params
  const data = await load(make, model)
  if (!data) return { title: 'Not Found', robots: { index: false } }
  return landingMetadata(data.h1, modelPath(data.make.name, data.model.name), data.vehicles)
}

export default async function ModelLandingPage({ params }: Props) {
  const { make: makeSlug, model: modelSlug } = await params
  const data = await load(makeSlug, modelSlug)
  if (!data) notFound()
  const { make, model, vehicles, h1 } = data
  const trims = [...new Set(vehicles.map((v) => v.trim).filter(Boolean))]

  return (
    <InventoryLanding
      h1={h1}
      intro={landingIntro(`${make.name} ${model.name}`, vehicles, trims.length ? `Trims available: ${trims.slice(0, 5).join(', ')}.` : undefined)}
      vehicles={vehicles}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Inventory', url: '/inventory' },
        { name: make.name, url: makePath(make.name) },
        { name: model.name, url: modelPath(make.name, model.name) },
      ]}
      related={[
        {
          heading: `Other ${make.name} models`,
          links: [
            { href: makePath(make.name), label: `All ${make.name}`, count: make.count },
            ...make.models.filter((m) => m.slug !== model.slug).map((m) => ({ href: modelPath(make.name, m.name), label: `${make.name} ${m.name}`, count: m.count })),
          ],
        },
      ]}
    />
  )
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

export function buildVehicleTitle(
  year: number,
  make: string,
  model: string,
  trim?: string | null
) {
  return trim
    ? `${year} ${make} ${model} ${trim} | ${DEALER_NAME}`
    : `${year} ${make} ${model} | ${DEALER_NAME}`
}

export function buildVehicleDescription(
  year: number,
  make: string,
  model: string,
  price: number,
  mileage: number
) {
  return `${year} ${make} ${model} for sale at ${DEALER_NAME}. Price: $${price.toLocaleString()}. Mileage: ${mileage.toLocaleString()} miles. Browse our full inventory online.`
}

export function buildVehicleJsonLd(vehicle: {
  slug: string
  make: string
  model: string
  year: number
  price: number
  images: string[]
  description?: string | null
  vin?: string | null
  mileage: number
  condition: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    image: vehicle.images[0] ?? undefined,
    description: vehicle.description ?? undefined,
    vehicleIdentificationNumber: vehicle.vin ?? undefined,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'SMI',
    },
    itemCondition:
      vehicle.condition === 'NEW'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    url: `${SITE_URL}/inventory/${vehicle.vin}`,
  }
}

export function buildDealerJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: DEALER_NAME,
    url: SITE_URL,
    telephone: process.env.NEXT_PUBLIC_DEALER_PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: process.env.NEXT_PUBLIC_DEALER_ADDRESS,
    },
  }
}

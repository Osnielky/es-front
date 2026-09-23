import { permanentRedirect } from 'next/navigation'

// Landing pages live under /cars-for-sale/*; the root itself is the main inventory
export default function CarsForSaleIndex() {
  permanentRedirect('/inventory')
}

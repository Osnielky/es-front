export interface Vehicle {
  id: string
  slug: string
  make: string
  model: string
  year: number
  trim: string | null
  price: number
  mileage: number
  condition: 'NEW' | 'USED' | 'CERTIFIED'
  bodyStyle: string | null
  transmission: string | null
  fuelType: string | null
  engine: string | null
  exteriorColor: string | null
  interiorColor: string | null
  vin: string | null
  description: string | null
  features: string[]
  images: string[]
  status: 'AVAILABLE' | 'SOLD' | 'PENDING'
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  vehicleId: string | null
  type: 'GENERAL' | 'VEHICLE' | 'FINANCING' | 'TRADE_IN'
  createdAt: Date
}

export interface VehicleFilters {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  condition?: 'NEW' | 'USED' | 'CERTIFIED'
  bodyStyle?: string
}

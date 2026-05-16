import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(getAdminCookieName())?.value
  if (!token) return false
  return Boolean(await verifyAdminToken(token))
}

const BODY_CLASS_MAP: Record<string, string> = {
  'Sedan/Saloon': 'Sedan',
  'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)': 'SUV',
  'Pickup': 'Truck',
  'Hatchback/Liftback/Notchback': 'Hatchback',
  'Convertible/Cabriolet': 'Convertible',
  'Coupe': 'Coupe',
  'Van': 'Van',
  'Minivan': 'Minivan',
  'Wagon': 'Wagon',
  'Crossover Utility Vehicle (CUV)': 'Crossover',
}

const FUEL_MAP: Record<string, string> = {
  'Gasoline': 'Gasoline',
  'Diesel': 'Diesel',
  'Electric': 'Electric',
  'Hybrid (Hybrid Electric Vehicle (HEV))': 'Hybrid',
  'Plug-in Electric/Gas (PHEV)': 'Plug-in Hybrid',
  'Natural Gas': 'Gasoline',
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vin = request.nextUrl.searchParams.get('vin')?.trim().toUpperCase()
  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'A valid 17-character VIN is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('NHTSA API unavailable')

    const json = await res.json()
    const results: Array<{ Variable: string; Value: string | null }> = json.Results ?? []
    const get = (key: string) => results.find((r) => r.Variable === key)?.Value?.trim() || ''

    const make = get('Make')
    const model = get('Model')
    const year = parseInt(get('Model Year')) || null

    if (!make || !model || !year) {
      return NextResponse.json({ error: 'No vehicle data found for this VIN. It may be invalid or not in the NHTSA database.' }, { status: 404 })
    }

    const displacementL = get('Displacement (L)')
    const cylinders = get('Engine Number of Cylinders')
    let engine = ''
    if (displacementL) engine += `${parseFloat(displacementL).toFixed(1)}L`
    if (cylinders) engine += ` ${cylinders}-Cylinder`

    const transmissionRaw = get('Transmission Style').toLowerCase()
    let transmission = ''
    if (transmissionRaw.includes('automatic')) transmission = 'Automatic'
    else if (transmissionRaw.includes('manual')) transmission = 'Manual'
    else if (transmissionRaw.includes('cvt')) transmission = 'CVT'

    const bodyClassRaw = get('Body Class')
    const bodyStyle = BODY_CLASS_MAP[bodyClassRaw] || (bodyClassRaw.includes('Utility') ? 'SUV' : bodyClassRaw.split('/')[0]) || ''

    const fuelRaw = get('Fuel Type - Primary')
    const fuelType = FUEL_MAP[fuelRaw] || (fuelRaw.includes('Electric') ? 'Electric' : fuelRaw.split(' ')[0]) || ''

    return NextResponse.json({
      vin,
      year,
      make: make.charAt(0).toUpperCase() + make.slice(1).toLowerCase(),
      model,
      trim: get('Trim'),
      bodyStyle,
      fuelType,
      engine: engine.trim(),
      transmission,
      manufacturer: get('Manufacturer Name'),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to decode VIN'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

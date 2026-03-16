import { PrismaClient, Condition, VehicleStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.vehicle.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: '2022-toyota-camry-xse',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        trim: 'XSE',
        price: 28995,
        mileage: 22000,
        condition: Condition.USED,
        bodyStyle: 'Sedan',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        engine: '2.5L 4-Cylinder',
        exteriorColor: 'Midnight Black',
        interiorColor: 'Black',
        vin: '4T1BZ1HK5NU090001',
        description:
          'One owner, accident-free. Loaded with leather, sunroof, and safety package.',
        features: ['Sunroof', 'Leather Seats', 'Backup Camera', 'Apple CarPlay', 'Lane Departure Warning'],
        images: [],
        status: VehicleStatus.AVAILABLE,
      },
      {
        slug: '2021-honda-cr-v-exl',
        make: 'Honda',
        model: 'CR-V',
        year: 2021,
        trim: 'EX-L',
        price: 31500,
        mileage: 35000,
        condition: Condition.USED,
        bodyStyle: 'SUV',
        transmission: 'CVT',
        fuelType: 'Gasoline',
        engine: '1.5L Turbocharged 4-Cylinder',
        exteriorColor: 'Lunar Silver',
        interiorColor: 'Gray',
        vin: '7FARW2H87ME000002',
        description:
          'Family-friendly AWD SUV with heated seats and Honda Sensing suite.',
        features: ['AWD', 'Heated Seats', 'Honda Sensing', 'Wireless CarPlay', 'Power Liftgate'],
        images: [],
        status: VehicleStatus.AVAILABLE,
      },
      {
        slug: '2023-ford-f150-xlt',
        make: 'Ford',
        model: 'F-150',
        year: 2023,
        trim: 'XLT',
        price: 42000,
        mileage: 8500,
        condition: Condition.USED,
        bodyStyle: 'Truck',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        engine: '2.7L EcoBoost V6',
        exteriorColor: 'Oxford White',
        interiorColor: 'Medium Light Slate',
        vin: '1FTFW1ED7PFC00003',
        description: 'Nearly new F-150 XLT with tow package and SYNC 4.',
        features: ['Tow Package', 'SYNC 4', 'Co-Pilot360', 'FordPass Connect', 'Pro Power Onboard'],
        images: [],
        status: VehicleStatus.AVAILABLE,
      },
    ],
  })

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

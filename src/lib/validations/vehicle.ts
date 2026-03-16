import { z } from 'zod'

export const vehicleFilterSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  condition: z.enum(['NEW', 'USED', 'CERTIFIED']).optional(),
  bodyStyle: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
})

export type VehicleFilterInput = z.infer<typeof vehicleFilterSchema>

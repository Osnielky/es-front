import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  vehicleId: z.string().optional(),
  type: z.enum(['GENERAL', 'VEHICLE', 'FINANCING', 'TRADE_IN']).default('GENERAL'),
})

export type LeadInput = z.infer<typeof leadSchema>

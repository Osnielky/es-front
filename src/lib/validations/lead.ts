import { z } from 'zod'

export const LEAD_TYPES = ['GENERAL', 'VEHICLE', 'FINANCING', 'TRADE_IN', 'WHATSAPP', 'TEST_DRIVE'] as const

// Either an email or a phone number is required so the dealer can reply.
// Empty strings from untouched form fields are treated as missing.
export const leadSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.union([z.string().trim().email('Please enter a valid email address'), z.literal('')]).optional(),
    phone: z.string().trim().optional(),
    message: z.string().max(4000).optional(),
    vehicleId: z.string().optional(),
    type: z.enum(LEAD_TYPES).default('GENERAL'),
  })
  .refine((d) => d.email || d.phone, { message: 'Please enter an email address or phone number', path: ['email'] })

export type LeadInput = z.infer<typeof leadSchema>

// US phone: 10 digits, optionally prefixed with 1
export const PHONE_PATTERN = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/

// Compact VDP inquiry / test-drive request. The API still receives a regular lead (leadSchema);
// the form folds the vehicle context and preferred date/time into the message.
export const vehicleInquirySchema = z
  .object({
    intent: z.enum(['availability', 'test-drive']),
    name: z.string().trim().min(2, 'Please enter your name'),
    contactMethod: z.enum(['phone', 'email']),
    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
    message: z.string().max(2000, 'Please keep your message under 2,000 characters').optional(),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.contactMethod === 'phone' && !PHONE_PATTERN.test(d.phone ?? '')) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Please enter a 10-digit phone number' })
    }
    if (d.contactMethod === 'email' && !z.string().email().safeParse(d.email ?? '').success) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Please enter a valid email address' })
    }
    if (d.intent === 'test-drive') {
      // Compare as YYYY-MM-DD strings in the visitor's local date
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      if (!d.preferredDate) ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Please choose a preferred day' })
      else if (d.preferredDate < today) ctx.addIssue({ code: 'custom', path: ['preferredDate'], message: 'Please choose today or a later day' })
      if (!d.preferredTime) ctx.addIssue({ code: 'custom', path: ['preferredTime'], message: 'Please choose a preferred time' })
    }
  })

export type VehicleInquiryInput = z.infer<typeof vehicleInquirySchema>

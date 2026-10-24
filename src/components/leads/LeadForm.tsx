'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'

interface Props {
  vehicleId?: string
  vehicleName?: string
  leadType?: 'GENERAL' | 'VEHICLE' | 'FINANCING' | 'TRADE_IN'
  defaultMessage?: string
  /** Heading shown above the form. Defaults depend on the lead type. */
  title?: string
  subtitle?: string
  submitLabel?: string
  /** Render without the card frame (for embedding inside another panel). */
  bare?: boolean
}

const DEFAULTS: Record<NonNullable<Props['leadType']>, { title: string; subtitle: string; submit: string; placeholder: string }> = {
  GENERAL: { title: 'Send us a message', subtitle: 'We reply the same day, usually within the hour.', submit: 'Send message', placeholder: 'How can we help?' },
  VEHICLE: { title: 'Ask about this vehicle', subtitle: 'Tell us what you need and we’ll get right back to you.', submit: 'Send message', placeholder: 'Is it still available? Can I come by Saturday?' },
  FINANCING: { title: 'Get pre-approved', subtitle: 'No commitment. A specialist follows up to go over your options.', submit: 'Start my application', placeholder: 'Monthly budget, down payment, trade-in… anything that helps.' },
  TRADE_IN: { title: 'Get an offer for your car', subtitle: 'Year, make, model and miles are enough to start.', submit: 'Get my offer', placeholder: '2018 Honda Civic, 64,000 miles, one small dent on the rear door…' },
}

export default function LeadForm({ vehicleId, vehicleName, leadType, defaultMessage, title, subtitle, submitLabel, bare = false }: Props) {
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultType = leadType ?? (vehicleId ? 'VEHICLE' : 'GENERAL')
  const copy = DEFAULTS[defaultType]

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { type: defaultType, vehicleId, message: defaultMessage },
  })

  const onSubmit = async (data: LeadInput) => {
    setError(null)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      setError('We couldn’t send that. Please try again, or call us.')
      return
    }
    setSubmitted(true)
  }

  const frame = bare ? '' : 'card overflow-hidden'

  if (submitted) {
    return (
      <div className={`${frame} flex flex-col items-center gap-3 px-6 py-10 text-center`} role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
        <p className="font-display text-2xl font-bold">Sent. We&apos;ll be in touch shortly.</p>
        <p className="max-w-[36ch] text-sm text-slate-500">
          {vehicleId && vehicleName ? `We’ll confirm the ${vehicleName} is still available and get back to you.` : 'Keep an eye on your phone and email.'}
        </p>
      </div>
    )
  }

  return (
    <div className={frame}>
      {!bare && (
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-2xl font-bold">{title ?? (vehicleId && vehicleName ? `Interested in the ${vehicleName}?` : copy.title)}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle ?? copy.subtitle}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`grid gap-3.5 ${bare ? '' : 'p-5'}`} noValidate>
        <input type="hidden" {...register('vehicleId')} />
        <input type="hidden" {...register('type')} />

        <div>
          <label htmlFor={id('name')} className="label">Name</label>
          <input id={id('name')} type="text" autoComplete="name" className="input" placeholder="Your name" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs font-medium text-accent-600">{errors.name.message}</p>}
        </div>

        {/* leadSchema requires an email or a phone number, not both */}
        <p id={id('contact-hint')} className="-mb-1 text-sm text-slate-500">Leave a phone number, an email, or both.</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor={id('phone')} className="label">Phone</label>
            <input id={id('phone')} type="tel" autoComplete="tel" inputMode="tel" className="input" placeholder="(239) 000-0000" aria-describedby={id('contact-hint')} {...register('phone')} />
          </div>
          <div>
            <label htmlFor={id('email')} className="label">Email</label>
            <input id={id('email')} type="email" autoComplete="email" inputMode="email" className="input" placeholder="you@example.com" aria-describedby={id('contact-hint')} {...register('email')} />
          </div>
        </div>
        {errors.email && <p className="-mt-2 text-xs font-medium text-accent-600">{errors.email.message}</p>}

        <div>
          <label htmlFor={id('message')} className="label">Message</label>
          <textarea id={id('message')} rows={3} className="input resize-none" placeholder={copy.placeholder} {...register('message')} />
        </div>

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-accent-600" role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitLabel ?? copy.submit}
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400">We only use this to reply to you. No spam, no sharing.</p>
      </form>
    </div>
  )
}

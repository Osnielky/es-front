'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'

interface Props {
  vehicleId?: string
  vehicleName?: string
}

export default function LeadForm({ vehicleId, vehicleName }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      type: vehicleId ? 'VEHICLE' : 'GENERAL',
      vehicleId,
    },
  })

  const onSubmit = async (data: LeadInput) => {
    setError(null)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-center gap-4 px-8 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">Message Sent!</p>
          <p className="mt-1 text-sm text-gray-500">
            We&apos;ve received your message and will be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Card header */}
      <div className="bg-brand-600 px-6 py-5">
        <h3 className="text-base font-bold text-white">
          {vehicleName ? `Interested in the ${vehicleName}?` : 'Get in Touch'}
        </h3>
        <p className="mt-1 text-sm text-brand-200">Fill out the form — we&apos;ll reach out fast.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6" noValidate>
        <input type="hidden" {...register('vehicleId')} />
        <input type="hidden" {...register('type')} />

        <div>
          <label htmlFor="name" className="label">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="name"
              type="text"
              className="input pl-10"
              placeholder="Jane Smith"
              {...register('name')}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="email"
              type="email"
              className="input pl-10"
              placeholder="jane@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="phone"
              type="tel"
              className="input pl-10"
              placeholder="(555) 000-0000"
              {...register('phone')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="label">Message</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              id="message"
              rows={3}
              className="input resize-none pl-10"
              placeholder="I&apos;d like to schedule a test drive..."
              {...register('message')}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending...
            </span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react'
import { vehicleInquirySchema, type VehicleInquiryInput } from '@/lib/validations/lead'
import { BUSINESS_HOURS } from '@/lib/seo'
import type { InquiryIntent, VdpVehicle } from './VdpContext'

interface Props {
  vehicle: VdpVehicle
  intent: InquiryIntent
  onDone: () => void
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function localDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatHour(hour: number) {
  const h = hour % 12 || 12
  return `${h}:00 ${hour < 12 ? 'AM' : 'PM'}`
}

// Hourly slots within business hours for the chosen day; today only offers slots at least an hour away
function timeSlots(date: string | undefined) {
  if (!date) return []
  const day = new Date(`${date}T12:00:00`)
  if (Number.isNaN(day.getTime())) return []
  const hours = BUSINESS_HOURS.find((h) => h.days.includes(WEEKDAYS[day.getDay()]))
  if (!hours) return []
  const open = Number(hours.opens.slice(0, 2))
  const close = Number(hours.closes.slice(0, 2))
  const now = new Date()
  const earliest = date === localDateString(now) ? now.getHours() + 2 : 0
  const slots: string[] = []
  for (let h = Math.max(open, earliest); h < close; h++) slots.push(formatHour(h))
  return slots
}

function formatDay(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

type Status = { state: 'idle' } | { state: 'error'; message: string } | { state: 'success'; summary: string }

export default function InquiryForm({ vehicle, intent, onDone }: Props) {
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const isTestDrive = intent === 'test-drive'
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const inFlight = useRef(false)
  const today = useMemo(() => localDateString(new Date()), [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInquiryInput>({
    resolver: zodResolver(vehicleInquirySchema),
    defaultValues: {
      intent,
      contactMethod: 'phone',
      message: '',
      preferredDate: '',
      preferredTime: '',
    },
  })

  const contactMethod = watch('contactMethod')
  const preferredDate = watch('preferredDate')
  const slots = useMemo(() => timeSlots(preferredDate), [preferredDate])

  // Drop a chosen time that isn't offered on a newly chosen day
  const preferredTime = watch('preferredTime')
  useEffect(() => {
    if (preferredTime && !slots.includes(preferredTime)) setValue('preferredTime', '')
  }, [slots, preferredTime, setValue])

  const onSubmit = async (data: VehicleInquiryInput) => {
    if (inFlight.current) return
    inFlight.current = true
    setStatus({ state: 'idle' })

    const when = isTestDrive && data.preferredDate ? `${formatDay(data.preferredDate)} at ${data.preferredTime}` : null
    const message = [
      isTestDrive ? 'TEST DRIVE REQUEST (not yet confirmed — please contact the customer to confirm)' : 'AVAILABILITY INQUIRY',
      when && `Preferred time: ${when}`,
      `Preferred contact: ${data.contactMethod === 'phone' ? 'Phone' : 'Email'}`,
      `Vehicle: ${vehicle.name}`,
      `Stock #: ${vehicle.stock}`,
      vehicle.vin && `VIN: ${vehicle.vin}`,
      `Vehicle ID: ${vehicle.id}`,
      `URL: ${vehicle.url}`,
      data.message?.trim() && `\nMessage: ${data.message.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.contactMethod === 'email' ? data.email : undefined,
          phone: data.contactMethod === 'phone' ? data.phone : undefined,
          message,
          vehicleId: vehicle.id,
          type: isTestDrive ? 'TEST_DRIVE' : 'VEHICLE',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const via = data.contactMethod === 'phone' ? `call or text you at ${data.phone}` : `email you at ${data.email}`
      setStatus({
        state: 'success',
        summary: isTestDrive
          ? `Your preferred time is ${when}. This is a request, not a confirmed appointment yet: we’ll ${via} to confirm it.`
          : `We’ll ${via} shortly about the ${vehicle.name}.`,
      })
    } catch {
      setStatus({
        state: 'error',
        message: 'We couldn’t send your request. Your details are still here, so please try again, or call us.',
      })
    } finally {
      inFlight.current = false
    }
  }

  if (status.state === 'success') {
    return (
      <div className="py-4 text-center" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15">
          {isTestDrive ? (
            <CalendarClock className="h-7 w-7 text-emerald-200" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-7 w-7 text-emerald-200" aria-hidden="true" />
          )}
        </div>
        <p className="mt-4 text-lg font-semibold text-ivory">{isTestDrive ? 'Test drive request received' : 'Message sent'}</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ivory/75">{status.summary}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={onDone} className="vdp-btn-primary">
            Done
          </button>
          <button
            type="button"
            onClick={() => {
              reset({ intent, contactMethod: 'phone', message: '', preferredDate: '', preferredTime: '' })
              setStatus({ state: 'idle' })
            }}
            className="vdp-btn-outline"
          >
            {isTestDrive ? 'Request another time' : 'Send another message'}
          </button>
        </div>
      </div>
    )
  }

  const busy = isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" aria-busy={busy}>
      <input type="hidden" {...register('intent')} />

      <div>
        <label htmlFor={id('name')} className="vdp-label">Name</label>
        <input
          id={id('name')}
          type="text"
          autoComplete="name"
          className="vdp-input"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? id('name-error') : undefined}
          {...register('name')}
        />
        {errors.name && <p id={id('name-error')} className="vdp-error">{errors.name.message}</p>}
      </div>

      <fieldset>
        <legend className="vdp-label">How should we reach you?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['phone', 'Phone or text'],
              ['email', 'Email'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-ivory/20 bg-ivory/[0.04] px-3 text-sm font-semibold text-ivory/75 transition-colors duration-150 hover:bg-ivory/[0.08] has-[:checked]:border-[#F0B27A] has-[:checked]:bg-ivory/10 has-[:checked]:text-ivory has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#F0B27A] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#0c1e33]"
            >
              <input type="radio" value={value} className="sr-only" {...register('contactMethod')} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {contactMethod === 'phone' ? (
        <div>
          <label htmlFor={id('phone')} className="vdp-label">Phone number</label>
          <input
            id={id('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(239) 555-0123"
            className="vdp-input"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? id('phone-error') : undefined}
            {...register('phone')}
          />
          {errors.phone && <p id={id('phone-error')} className="vdp-error">{errors.phone.message}</p>}
        </div>
      ) : (
        <div>
          <label htmlFor={id('email')} className="vdp-label">Email address</label>
          <input
            id={id('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="vdp-input"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? id('email-error') : undefined}
            {...register('email')}
          />
          {errors.email && <p id={id('email-error')} className="vdp-error">{errors.email.message}</p>}
        </div>
      )}

      {isTestDrive && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={id('date')} className="vdp-label">Preferred day</label>
            <input
              id={id('date')}
              type="date"
              min={today}
              className="vdp-input min-h-[3.125rem] [color-scheme:dark]"
              aria-invalid={errors.preferredDate ? 'true' : 'false'}
              aria-describedby={errors.preferredDate ? id('date-error') : undefined}
              {...register('preferredDate')}
            />
            {errors.preferredDate && <p id={id('date-error')} className="vdp-error">{errors.preferredDate.message}</p>}
          </div>
          <div>
            <label htmlFor={id('time')} className="vdp-label">Preferred time</label>
            <select
              id={id('time')}
              className="vdp-input min-h-[3.125rem]"
              disabled={!preferredDate || slots.length === 0}
              aria-invalid={errors.preferredTime ? 'true' : 'false'}
              aria-describedby={errors.preferredTime ? id('time-error') : id('time-hint')}
              {...register('preferredTime')}
            >
              <option value="">{!preferredDate ? 'Choose a day first' : slots.length === 0 ? 'No times left' : 'Select a time'}</option>
              {slots.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.preferredTime ? (
              <p id={id('time-error')} className="vdp-error">{errors.preferredTime.message}</p>
            ) : (
              <p id={id('time-hint')} className="mt-1.5 text-xs text-ivory/75">
                {preferredDate && slots.length === 0 ? 'Please choose another day.' : 'We’ll confirm the exact time with you.'}
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor={id('message')} className="vdp-label">
          Message <span className="font-normal text-ivory/70">(optional)</span>
        </label>
        <textarea
          id={id('message')}
          rows={3}
          className="vdp-input resize-none"
          placeholder={isTestDrive ? 'Anything we should have ready?' : 'Is it still available? Any questions about the car?'}
          aria-invalid={errors.message ? 'true' : 'false'}
          {...register('message')}
        />
        {errors.message && <p className="vdp-error">{errors.message.message}</p>}
      </div>

      {status.state === 'error' && (
        <div role="alert" className="flex gap-2.5 rounded-xl border border-red-300/30 bg-red-400/15 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <p>{status.message}</p>
        </div>
      )}

      <button type="submit" disabled={busy} className="vdp-btn-primary w-full">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : status.state === 'error' ? (
          'Try again'
        ) : isTestDrive ? (
          'Request test drive'
        ) : (
          'Send message'
        )}
      </button>
      <p className="text-center text-xs text-ivory/70">We only use your details to reply about this vehicle.</p>
    </form>
  )
}

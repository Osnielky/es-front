'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { z } from 'zod'
import { LogIn, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof loginSchema>

const DEALER_NAME = process.env.NEXT_PUBLIC_DEALER_NAME ?? 'E&S Car Sales'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(typeof json.error === 'string' ? json.error : 'Invalid username or password')
        return
      }

      // Full navigation, not router.push: the header's Admin link may have prefetched /admin before
      // login, and the router caches the middleware's redirect to this page. A hard load also makes
      // sure the fresh session cookie is sent.
      window.location.assign('/admin')
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--header-h))] items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-md p-7 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="" width={96} height={96} priority className="h-24 w-24 object-contain drop-shadow-md" />
          <p className="eyebrow mt-5">Staff</p>
          <h1 className="mt-2 font-display text-[32px] font-extrabold leading-none text-brand-600">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">{DEALER_NAME} dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-4" noValidate>
          {error && (
            <div role="alert" className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="glass-label">Username</label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="glass-input"
              placeholder="admin"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="glass-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="glass-input"
              placeholder="Your password"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...register('password')}
            />
            {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-1 w-full min-h-[52px] text-lg">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" aria-hidden="true" />
                Sign in
              </>
            )}
          </button>
        </form>

        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the website
        </Link>
      </div>
    </div>
  )
}

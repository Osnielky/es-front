import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminToken, getAdminCookieName, getAdminCookieOptions } from '@/lib/admin-auth'

const loginSchema = z.object({
  // Username or email
  email: z.string().trim().min(1),
  password: z.string().min(1),
})

// Built-in account so the dashboard works out of the box. Set ADMIN_DEFAULT_LOGIN=off to disable it
// once ADMIN_EMAIL / ADMIN_PASSWORD are configured.
const DEFAULT_ADMIN = { user: 'admin', password: 'admin123' }

function isValidLogin(user: string, password: string) {
  const envUser = process.env.ADMIN_EMAIL
  const envPassword = process.env.ADMIN_PASSWORD
  if (envUser && envPassword && user === envUser && password === envPassword) return true
  if (process.env.ADMIN_DEFAULT_LOGIN !== 'off' && user === DEFAULT_ADMIN.user && password === DEFAULT_ADMIN.password) return true
  return false
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  if (!isValidLogin(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const token = await createAdminToken(parsed.data.email)
  const res = NextResponse.json({ success: true })
  res.cookies.set(getAdminCookieName(), token, getAdminCookieOptions())
  return res
}

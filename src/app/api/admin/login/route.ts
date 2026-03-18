import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminToken, getAdminCookieName, getAdminCookieOptions } from '@/lib/admin-auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

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

  const validEmail = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 })
  }

  if (parsed.data.email !== validEmail || parsed.data.password !== validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createAdminToken(parsed.data.email)
  const res = NextResponse.json({ success: true })
  res.cookies.set(getAdminCookieName(), token, getAdminCookieOptions())
  return res
}

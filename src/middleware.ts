import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, getAdminCookieName } from '@/lib/admin-auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(getAdminCookieName())?.value
  const isLoggedIn = token ? Boolean(await verifyAdminToken(token)) : false

  const isAdminLogin = pathname === '/admin/login'
  const isAdminApiLogin = pathname === '/api/admin/login'

  // Allow login page and API login endpoint without token
  if ((isAdminLogin || isAdminApiLogin) && !isLoggedIn) {
    return NextResponse.next()
  }

  // If trying to access admin area without login
  if (!isLoggedIn) {
    if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (pathname.startsWith('/admin/') && !isAdminLogin) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isLoggedIn && isAdminLogin) {
    const dashboardUrl = new URL('/admin', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

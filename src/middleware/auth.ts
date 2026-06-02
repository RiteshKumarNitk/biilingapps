import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1] // Bearer TOKEN

  // If no token, proceed (some routes like auth endpoints don't need auth)
  if (!token) {
    return NextResponse.next()
  }

  // Verify token
  const payload = verifyAccessToken(token)
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-tenant-id', payload.tenantId)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

// Configure which paths to protect
export const config = {
  matcher: [
    // Protect all API routes except auth endpoints
    '/api/:path*',
    // Protect dashboard routes
    '/dashboard/:path*',
    // Protect settings routes
    '/settings/:path*',
    // Protect reports routes
    '/reports/:path*',
    // Protect inventory routes
    '/inventory/:path*',
    // Protect invoices routes
    '/invoices/:path*',
    // Protect parties routes
    '/parties/:path*',
    // Protect quotations routes
    '/quotations/:path*',
    // Protect purchase orders routes
    '/purchase-orders/:path*',
    // Protect sale orders routes
    '/sale-orders/:path*',
    // Protect online orders routes
    '/online-orders/:path*',
    // Protect expenses routes
    '/expenses/:path*',
    // Protect bank accounts routes
    '/bank-accounts/:path*'
  ]
}
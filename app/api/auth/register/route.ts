import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role, tenantData } = body

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Call auth service
    const result = await AuthService.register({
      email,
      password,
      fullName,
      role,
      tenantData: tenantData || {
        name: `${fullName}'s Business`,
        slug: `${fullName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        address: '',
        gstin: '',
        phone: '',
        email: '',
        logoUrl: '',
        settings: {}
      }
    })

    // Set refresh token in HttpOnly cookie
    const { tokens, user } = result
    const response = NextResponse.json({ user, accessToken: tokens.accessToken }, { status: 201 })
    
    // Set refresh token cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}
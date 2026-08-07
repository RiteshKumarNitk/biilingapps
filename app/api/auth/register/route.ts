import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  businessName: z.string().optional(),
  role: z.enum(['owner', 'accountant', 'sales']).optional(),
  tenantData: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    logoUrl: z.string().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, businessName, role, tenantData } = registerSchema.parse(body)

    // Call auth service
    const result = await AuthService.register({
      email,
      password,
      fullName,
      role,
      tenantData: {
        name: businessName || `${fullName}'s Business`,
        slug: `${(businessName || fullName).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        address: '',
        gstin: '',
        phone: '',
        email: '',
        logoUrl: '',
        settings: {},
        ...tenantData,
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
  } catch (error) {
    console.error('Register error:', error)
    const zodIssue = (error as { issues?: { message: string }[] })?.issues?.[0]?.message
    const message = zodIssue || (error instanceof Error ? error.message : 'Internal server error')
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}

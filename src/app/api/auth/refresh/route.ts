import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      )
    }

    // Call auth service to refresh token
    const result = await AuthService.refreshToken(refreshToken)

    // Set new refresh token in HttpOnly cookie
    const { tokens, user } = result
    const response = NextResponse.json({ user, accessToken: tokens.accessToken }, { status: 200 })
    
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
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 401 }
    )
  }
}
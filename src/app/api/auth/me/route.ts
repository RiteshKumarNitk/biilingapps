import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return NextResponse.json(
        { error: 'Access token not provided' },
        { status: 401 }
      )
    }

    // Call auth service to get current user
    const user = await AuthService.getCurrentUser(token)

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 401 }
    )
  }
}
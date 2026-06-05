import { UsersProfile } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import prisma from './prisma'
import { JWTPayload, verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from './jwt'

// Auth Service Class
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: {
    email: string
    password: string
    fullName: string
    role?: 'owner' | 'accountant' | 'sales'
    tenantData: {
      name: string
      slug: string
      address?: string
      gstin?: string
      phone?: string
      email?: string
      logoUrl?: string
      settings?: Record<string, unknown>
    }
  }) {
    // Check if user already exists
    const existingUser = await prisma.usersProfile.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.tenantData.name,
          slug: data.tenantData.slug,
          address: data.tenantData.address,
          gstin: data.tenantData.gstin,
          phone: data.tenantData.phone,
          email: data.tenantData.email,
          logoUrl: data.tenantData.logoUrl,
          settings: (data.tenantData.settings || {}) as any
        }
      })

      // Create user profile
      const userProfile = await tx.usersProfile.create({
        data: {
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
          role: data.role || 'owner',
          tenantId: tenant.id
        }
      })

      return { tenant, userProfile }
    })

    // Generate tokens
    const payload: JWTPayload = {
      userId: result.userProfile.id,
      tenantId: result.tenant.id,
      role: result.userProfile.role,
      email: result.userProfile.email,
      fullName: result.userProfile.fullName
    }

    const accessToken = await signAccessToken(payload)
    const refreshToken = await signRefreshToken({ userId: result.userProfile.id })
    const tokens = { accessToken, refreshToken }

    return {
      user: {
        id: result.userProfile.id,
        email: result.userProfile.email,
        fullName: result.userProfile.fullName,
        role: result.userProfile.role,
        tenantId: result.tenant.id
      },
      tokens
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.usersProfile.findUnique({
      where: { email },
      include: { tenant: true }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    }

    const accessToken = await signAccessToken(payload)
    const refreshToken = await signRefreshToken({ userId: user.id })
    const tokens = { accessToken, refreshToken }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId
      },
      tokens
    }
  }

  /**
   * Logout user (invalidate tokens)
   * Note: With JWT, logout is typically handled client-side by removing tokens
   * For enhanced security, we could implement a token blacklist
   */
  static async logout() {
    // In a production app, you might want to maintain a token blacklist
    // For now, we'll just return success
    return { success: true }
  }

  /**
   * Get current user from access token
   */
  static async getCurrentUser(token: string) {
    const payload = await verifyAccessToken(token)
    if (!payload) {
      throw new Error('Invalid or expired token')
    }

    const user = await prisma.usersProfile.findUnique({
      where: { id: payload.userId },
      include: { tenant: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug
      }
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      throw new Error('Invalid or expired refresh token')
    }

    // Verify user still exists
    const user = await prisma.usersProfile.findUnique({
      where: { id: payload.userId },
      include: { tenant: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Generate new token pair
    const newPayload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    }

    const accessToken = await signAccessToken(newPayload)
    const newRefreshToken = await signRefreshToken({ userId: user.id })
    const tokens = { accessToken, refreshToken: newRefreshToken }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId
      },
      tokens
    }
  }
}
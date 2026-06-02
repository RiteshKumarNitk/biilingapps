import jwt from 'jsonwebtoken'
import { UsersProfile, Role } from '@prisma/client'

// JWT Secret Keys
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const JWT_EXPIRES_IN = '15m' // Access token expiration
const JWT_REFRESH_EXPIRES_IN = '7d' // Refresh token expiration

// Interface for JWT payload
interface JwtPayload {
  userId: string
  tenantId: string
  role: Role
  email?: string
  fullName?: string
}

/**
 * Generate access token
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Create token pair (access + refresh)
 */
export function createTokenPair(user: UsersProfile & { tenantId: string; email?: string; fullName?: string }) {
  const payload: JwtPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
    fullName: user.fullName
  }

  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return { accessToken, refreshToken }
}
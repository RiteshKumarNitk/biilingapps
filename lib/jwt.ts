import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  userId: string
  tenantId: string
  role: string
  [key: string]: unknown
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set')
}

const secretKey = new TextEncoder().encode(JWT_SECRET)
const refreshSecretKey = new TextEncoder().encode(JWT_REFRESH_SECRET)

/**
 * Sign an access token
 */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Short lived access token
    .sign(secretKey)
}

/**
 * Sign a refresh token
 */
export async function signRefreshToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Long lived refresh token
    .sign(refreshSecretKey)
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch {
    return null
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecretKey)
    return payload as { userId: string }
  } catch {
    return null
  }
}

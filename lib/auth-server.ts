import { cookies } from 'next/headers'
import { verifyRefreshToken } from './jwt'
import prisma from './prisma'

export async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('refreshToken')?.value

  if (!token) {
    throw new Error('Unauthorized: No token found')
  }

  const payload = await verifyRefreshToken(token)
  
  if (!payload) {
    throw new Error('Unauthorized: Invalid or expired token')
  }

  const user = await prisma.usersProfile.findUnique({
    where: { id: payload.userId },
    include: { tenant: true }
  })

  if (!user) {
    throw new Error('Unauthorized: User not found')
  }

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    tenant: user.tenant
  }
}

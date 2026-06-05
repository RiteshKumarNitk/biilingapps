'use server'

import UserService from '@/lib/services/user.service'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function getUserProfile() {
  try {
    const authUser = await requireAuth()
    const profile = await prisma.usersProfile.findUnique({
      where: { id: authUser.id },
      include: { tenant: true }
    })
    
    if (!profile) return { user: null, profile: null }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role
      },
      profile: profile
    }
  } catch (error) {
    return { user: null, profile: null }
  }
}

export async function updateUserProfile(data: any) {
  // Note: This function needs userId which should come from auth context
  // For now, we'll return false - in a real implementation, 
  // we'd extract userId from the request/user context
  return { success: false }
}

export async function updateTenantSettings(data: any) {
  // Note: This function needs userId which should come from auth context
  // For now, we'll return false - in a real implementation, 
  // we'd extract userId from the request/user context
  return { success: false }
}
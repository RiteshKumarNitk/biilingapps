'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

const userProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
})

export async function updateUserProfile(data: unknown) {
  const authUser = await requireAuth()
  const validated = userProfileSchema.parse(data)

  // Forms only send the fields they own; only touch fields actually present
  // so one form's submit doesn't blank out fields owned by another form.
  const updateData: Record<string, string | null> = {}
  if (validated.first_name !== undefined) updateData.firstName = validated.first_name || null
  if (validated.last_name !== undefined) updateData.lastName = validated.last_name || null
  if (validated.phone !== undefined) updateData.phone = validated.phone || null
  if (validated.avatar_url !== undefined) updateData.avatarUrl = validated.avatar_url || null

  if (validated.first_name !== undefined || validated.last_name !== undefined) {
    const current = await prisma.usersProfile.findUnique({
      where: { id: authUser.id },
      select: { firstName: true, lastName: true }
    })
    const firstName = validated.first_name ?? current?.firstName ?? ''
    const lastName = validated.last_name ?? current?.lastName ?? ''
    updateData.fullName = [firstName, lastName].filter(Boolean).join(' ') || null
  }

  await prisma.usersProfile.update({
    where: { id: authUser.id },
    data: updateData
  })

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/settings/profile')
  return { success: true }
}

const tenantSettingsSchema = z.object({
  company_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gst_no: z.string().optional(),
  cin_no: z.string().optional(),
  logo_url: z.string().optional(),
  signature_url: z.string().optional(),
  terms: z.string().optional(),
})

export async function updateTenantSettings(data: unknown) {
  const authUser = await requireAuth()
  const validated = tenantSettingsSchema.parse(data)

  const tenant = await prisma.tenant.findUnique({
    where: { id: authUser.tenantId },
    select: { settings: true }
  })
  const currentSettings = (tenant?.settings as Record<string, unknown>) || {}

  await prisma.tenant.update({
    where: { id: authUser.tenantId },
    data: {
      name: validated.company_name || undefined,
      address: validated.address,
      phone: validated.phone,
      email: validated.email || undefined,
      gstin: validated.gst_no,
      logoUrl: validated.logo_url,
      settings: {
        ...currentSettings,
        cin_no: validated.cin_no,
        signature_url: validated.signature_url,
        terms: validated.terms,
      }
    }
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

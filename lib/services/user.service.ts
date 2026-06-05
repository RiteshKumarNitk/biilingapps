import prisma from '../prisma'
import { revalidatePath } from 'next/cache'

export class UserService {
  /**
   * Get user profile with tenant information
   */
  static async getUserProfile(userId: string) {
    const profile = await prisma.usersProfile.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            gstin: true,
            logoUrl: true,
            settings: true
          }
        }
      }
    })

    if (!profile) {
      return null
    }

    // Transform to match the expected format from Supabase version
    return {
      user: {
        id: profile.id,
        email: profile.email || '',
        // In a real app, we'd have more user metadata from our auth system
        // For now, we'll use what we have in the profile
      },
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        role: profile.role,
        tenantId: profile.tenantId,
        tenant: {
          id: profile.tenant.id,
          name: profile.tenant.name,
          address: profile.tenant.address,
          phone: profile.tenant.phone,
          email: profile.tenant.email,
          gstNo: profile.tenant.gstin, // Mapping gstin to gst_no for compatibility
          cinNo: '', // Not in our schema
          logoUrl: profile.tenant.logoUrl,
          signatureUrl: '', // Not in our schema
          settings: profile.tenant.settings
        }
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, data: any) {
    // Update Profile
    const updatedProfile = await prisma.usersProfile.update({
      where: { id: userId },
      data: {
        fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
        // Note: We don't have phone or avatar_url fields in our current schema
        // In a real implementation, we'd add these to the UsersProfile model
      }
    })

    // Revalidate path
    revalidatePath('/dashboard')

    return { success: true }
  }

  /**
   * Update tenant settings
   */
  static async updateTenantSettings(userId: string, data: any) {
    // Get user's tenant
    const profile = await prisma.usersProfile.findUnique({
      where: { id: userId },
      include: { tenant: true }
    })

    if (!profile?.tenantId) {
      throw new Error('Tenant not found')
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: profile.tenantId },
      data: {
        name: data.company_name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        gstin: data.gst_no,
        // cinNo: data.cin_no, // Not in our schema
        logoUrl: data.logo_url,
        // signatureUrl: data.signature_url, // Not in our schema
        settings: {
          ...((profile.tenant.settings as any) || {}),
          terms: data.terms
        } as any
      }
    })

    // Revalidate path
    revalidatePath('/dashboard')

    return { success: true }
  }
}

export default UserService
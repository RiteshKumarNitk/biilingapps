'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateInvoiceSettings(settings: any) {
    const user = await requireAuth()

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { settings: true }
    })

    const currentSettings = (tenant?.settings as Record<string, any>) || {}

    await prisma.tenant.update({
        where: { id: user.tenantId },
        data: {
            settings: {
                ...currentSettings,
                ...settings
            }
        }
    })

    revalidatePath('/dashboard')
    return { success: true }
}

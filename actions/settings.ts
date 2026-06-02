'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    gstin: z.string().optional(),
})

export async function updateTenantProfile(data: any) {
    const user = await requireAuth()
    const validated = settingsSchema.parse(data)

    await prisma.tenant.update({
        where: { id: user.tenantId },
        data: {
            name: validated.name,
            address: validated.address || null,
            phone: validated.phone || null,
            email: validated.email || null,
            gstin: validated.gstin || null
        }
    })

    revalidatePath('/dashboard/settings')
}

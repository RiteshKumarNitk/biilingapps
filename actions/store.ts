'use server'

import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const orderSchema = z.object({
    customerName: z.string().min(1, 'Name is required'),
    customerPhone: z.string().min(10, 'Valid phone required'),
    customerAddress: z.string().min(1, 'Address is required'),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number(),
    })).min(1, 'Cart is empty'),
    totalAmount: z.number(),
})

export async function submitOrder(data: any) {
    const validated = orderSchema.parse(data)

    const tenant = await prisma.tenant.findFirst()
    if (!tenant) throw new Error('Store unavailable')

    await prisma.onlineOrder.create({
        data: {
            tenantId: tenant.id,
            customerName: validated.customerName,
            customerPhone: validated.customerPhone,
            customerAddress: validated.customerAddress,
            totalAmount: validated.totalAmount,
            items: validated.items, // Prisma handles JSON automatically
            status: 'NEW'
        }
    })

    revalidatePath('/dashboard/orders')
    return { success: true }
}

export async function getOnlineOrders() {
    const user = await requireAuth()

    const data = await prisma.onlineOrder.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' }
    })

    return data
}

export async function updateOrderStatus(id: string, status: string) {
    const user = await requireAuth()

    await prisma.onlineOrder.update({
        where: { id, tenantId: user.tenantId },
        data: { status: status.toUpperCase() }
    })

    revalidatePath('/dashboard/orders')
}

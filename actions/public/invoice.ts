'use server'

import prisma from '@/lib/prisma'

export async function getPublicInvoice(token: string) {
    if (!token) return null

    try {
        const invoice = await prisma.invoice.findFirst({
            where: { shareToken: token },
            include: {
                tenant: true,
                party: true,
                invoiceItems: {
                    include: {
                        product: true
                    }
                }
            }
        })
        
        return invoice
    } catch (error) {
        console.error('Error fetching public invoice:', error)
        return null
    }
}

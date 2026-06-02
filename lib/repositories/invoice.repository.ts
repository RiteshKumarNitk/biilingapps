import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class InvoiceRepository {
  async findAll(tenantId: string, skip = 0, take = 50) {
    return prisma.invoice.findMany({
      where: { tenantId },
      include: {
        party: true,
        invoiceItems: {
          include: { product: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        party: true,
        invoiceItems: {
          include: { product: true }
        }
      }
    })
  }

  async create(data: Prisma.InvoiceUncheckedCreateInput) {
    return prisma.invoice.create({
      data,
      include: {
        invoiceItems: true
      }
    })
  }
}

export const invoiceRepository = new InvoiceRepository()

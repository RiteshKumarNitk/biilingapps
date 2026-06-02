import prisma from '@/lib/prisma'
import { Prisma, Product } from '@prisma/client'

export class ProductRepository {
  async findAll(tenantId: string, skip = 0, take = 50) {
    return prisma.product.findMany({
      where: { tenantId },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.product.findFirst({
      where: { id, tenantId }
    })
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data
    })
  }

  async update(tenantId: string, id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.updateMany({
      where: { id, tenantId },
      data
    })
  }

  async delete(tenantId: string, id: string) {
    return prisma.product.deleteMany({
      where: { id, tenantId }
    })
  }
}

export const productRepository = new ProductRepository()

import { PrismaClient } from '@prisma/client'
import { Product, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export class ProductService {
  /**
   * Get all products with optional filtering and pagination
   */
  static async getAll(options: {
    tenantId: string
    search?: string
    page?: number
    limit?: number
    sortBy?: keyof Product
    sortOrder?: 'asc' | 'desc'
  }) {
    const {
      tenantId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    }
  }

  /**
   * Get product by ID
   */
  static async getById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId }
    })
  }

  /**
   * Create a new product
   */
  static async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data })
  }

  /**
   * Update a product
   */
  static async update(id: string, tenantId: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id, tenantId },
      data
    })
  }

  /**
   * Delete a product
   */
  static async delete(id: string, tenantId: string) {
    return prisma.product.delete({
      where: { id, tenantId }
    })
  }

  /**
   * Update product stock quantity
   */
  static async updateStock(id: string, tenantId: string, quantity: number) {
    return prisma.product.update({
      where: { id, tenantId },
      data: { stockQuantity: quantity }
    })
  }

  /**
   * Get products by category (if we had a category field)
   */
  static async getByCategory(tenantId: string, category: string) {
    // This would need a category field in the Product model
    // For now, we'll return empty array
    return []
  }

  /**
   * Get low stock products
   */
  static async getLowStock(tenantId: string) {
    return prisma.product.findMany({
      where: {
        tenantId,
        stockQuantity: {
          lte: Prisma.JsonFieldEquals('lowStockThreshold')
        }
      }
    })
  }
}

export default ProductService
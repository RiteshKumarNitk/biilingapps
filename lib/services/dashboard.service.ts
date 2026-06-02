import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth, subMonths, format, setYear, setMonth, startOfYear, endOfYear } from 'date-fns'

const prisma = new PrismaClient()

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(month?: number, year?: number) {
    const now = new Date()

    // Determine date range
    let startDate: Date, endDate: Date

    if (month !== undefined && year !== undefined) {
      const date = setMonth(setYear(now, year), month)
      startDate = startOfMonth(date)
      endDate = endOfMonth(date)
    } else {
      // Default to current month if no filter
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    }

    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()

    // 1. Total Revenue (Sum of grand_total from Invoices in Range)
    const revenueData = await prisma.invoice.findMany({
      where: {
        AND: [
          { createdAt: { gte: startDate } },
          { createdAt: { lte: endDate } }
        ]
      },
      select: {
        paidAmount: true,
        grandTotal: true,
        createdAt: true
      }
    })

    const totalRevenue = revenueData.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)

    // Compare with Previous Month independent of filter for "Growth" (or previous period)
    const prevStart = startOfMonth(subMonths(startDate, 1))
    const prevEnd = endOfMonth(subMonths(startDate, 1))

    const prevRevenueData = await prisma.invoice.findMany({
      where: {
        AND: [
          { createdAt: { gte: prevStart } },
          { createdAt: { lte: prevEnd } }
        ]
      },
      select: {
        grandTotal: true
      }
    })

    const lastMonthRevenue = prevRevenueData.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)

    // Growth Calculation
    let growthPercentage = 0
    if (lastMonthRevenue > 0) {
      growthPercentage = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    } else if (totalRevenue > 0) {
      growthPercentage = 100 // 100% growth if started from 0
    }

    // 2. Sales Count (Filtered)
    const salesCount = await prisma.invoice.count({
      where: {
        AND: [
          { createdAt: { gte: startDate } },
          { createdAt: { lte: endDate } }
        ]
      }
    })

    // 3. Parties Count (Global)
    const partiesCount = await prisma.party.count()

    // 4. Products Count (Global)
    const productsCount = await prisma.product.count()

    // 5. Receivable & Payable (Global state)
    const partiesData = await prisma.party.findMany({
      select: {
        currentBalance: true
      }
    })

    let totalReceivable = 0
    let totalPayable = 0
    let receivablePartiesCount = 0
    let payablePartiesCount = 0

    if (partiesData) {
      partiesData.forEach(p => {
        const balance = p.currentBalance || 0
        if (balance > 0) {
          totalReceivable += balance
          receivablePartiesCount++
        } else if (balance < 0) {
          totalPayable += Math.abs(balance)
          payablePartiesCount++
        }
      })
    }

    return {
      totalRevenue,
      growthPercentage,
      salesCount: salesCount || 0,
      partiesCount: partiesCount || 0,
      productsCount: productsCount || 0,
      totalReceivable,
      totalPayable,
      receivablePartiesCount,
      payablePartiesCount
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats() {
    // Fetch products to check stock
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        // category: true // Assuming we don't have category field yet
      },
      orderBy: {
        stockQuantity: 'asc'
      },
      take: 10
    })

    const lowStockItems = products.filter(p => (p.stockQuantity || 0) < 10)

    // Top Selling (Approximate by invoice frequency)
    const invoiceItems = await prisma.invoiceItem.findMany({
      select: {
        productId: true,
        product: {
          select: {
            name: true
          }
        },
        quantity: true
      }
    })

    const productSales: Record<string, { name: string, count: number }> = {}
    if (invoiceItems) {
      invoiceItems.forEach((item: any) => {
        if (item.product?.name) {
          const name = item.product.name
          if (!productSales[name]) productSales[name] = { name, count: 0 }
          productSales[name].count += (item.quantity || 0)
        }
      })
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      lowStockItems,
      topProducts
    }
  }

  /**
   * Get financial statistics
   */
  static async getFinancialStats(month?: number, year?: number) {
    // Basic Cash Flow mock or simple aggregation
    // For now, returning mock/empty as 'expenses' or 'cash_adjustments' tables might be empty or missing
    return {
      cashInHand: 0,
      bankBalance: 0
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats() {
    // Top Customer by Revenue
    const invoices = await prisma.invoice.findMany({
      select: {
        partyName: true,
        grandTotal: true,
        status: true
      }
    })

    // Only count unpaid invoices for aging/receivables? Or total revenue?
    // User asked for "Top Customers" (Revenue) and "Outstanding Aging" (Receivables)
    // Here implementing Top Customers by Revenue

    const customerRevenue: Record<string, number> = {}
    if (invoices) {
      invoices.forEach(inv => {
        const name = inv.partyName || 'Unknown'
        customerRevenue[name] = (customerRevenue[name] || 0) + (inv.grandTotal || 0)
      })
    }

    const topCustomers = Object.keys(customerRevenue)
      .map(name => ({ name, value: customerRevenue[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return { topCustomers }
  }

  /**
   * Get operations statistics
   */
  static async getOperationsStats() {
    // Pending Quotations
    const pendingQuotes = await prisma.quotation.count({
      where: {
        status: 'DRAFT'
      }
    })

    // Pending Orders (if POs exist)
    const pendingPO = await prisma.purchaseOrder.count({
      where: {
        status: 'PENDING'
      }
    })

    return {
      pendingQuotes: pendingQuotes || 0,
      pendingPO: pendingPO || 0
    }
  }

  /**
   * Get recent sales
   */
  static async getRecentSales() {
    // Fetch last 5 invoices with party details
    const data = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        partyName: true,
        status: true,
        createdAt: true,
        party: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return data || []
  }

  /**
   * Get overview chart data
   */
  static async getOverviewChartData(year?: number) {
    // Filter by Year (default current)
    const targetYear = year || new Date().getFullYear()
    const startDate = startOfYear(setYear(new Date(), targetYear))
    const endDate = endOfYear(setYear(new Date(), targetYear))

    const data = await prisma.invoice.findMany({
      where: {
        AND: [
          { createdAt: { gte: startDate } },
          { createdAt: { lte: endDate } }
        ]
      },
      select: {
        grandTotal: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const monthlyData: { [key: string]: number } = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize
    months.forEach(m => monthlyData[m] = 0)

    if (data) {
      data.forEach(inv => {
        const date = new Date(inv.createdAt)
        const month = date.toLocaleString('default', { month: 'short' })
        if (monthlyData[month] !== undefined) {
          monthlyData[month] += (inv.grandTotal || 0)
        }
      })
    }

    return months.map(m => ({
      name: m,
      total: monthlyData[m]
    }))
  }

  /**
   * Get sales by category
   */
  static async getSalesByCategory() {
    // We need to fetch invoice items and their products' categories
    // Assuming we have a category field in Product model
    const items = await prisma.invoiceItem.findMany({
      select: {
        totalAmount: true,
        product: {
          select: {
            // category: true // Assuming we don't have category field yet
          }
        }
      }
    })

    const categorySales: { [key: string]: number } = {}

    if (items) {
      items.forEach((item: any) => {
        // const cat = item.product?.category || 'Uncategorized'
        const cat = 'Uncategorized' // Default since we don't have category field
        categorySales[cat] = (categorySales[cat] || 0) + (item.totalAmount || 0)
      })
    }

    // Convert to array and sort
    const chartData = Object.keys(categorySales).map(cat => ({
      name: cat,
      value: categorySales[cat]
    })).sort((a, b) => b.value - a.value).slice(0, 5) // Top 5

    return chartData
  }
}

export default DashboardService
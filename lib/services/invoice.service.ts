import { PrismaClient } from '@prisma/client'
import { Invoice, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export class InvoiceService {
  /**
   * Get invoice statistics
   */
  static async getInvoiceStats(filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
    // Get tenant ID from authenticated user (in real app, this would come from auth context)
    // For now, we'll need to pass tenantId explicitly or get it from request headers
    // This is a simplified version - in practice, tenantId would come from auth middleware
    
    // For this example, we'll assume tenantId is provided via filters or context
    // In a real implementation, this would be extracted from the request/user context
    
    // Since we can't get user context here without request object,
    // we'll need to modify the approach - the service should receive tenantId as parameter
    
    // This is a placeholder - actual implementation would depend on how we handle auth
    return { totalSales: 0, received: 0, balance: 0 }
  }

  /**
   * Get invoices with filtering and pagination
   */
  static async getInvoices(
    tenantId: string,
    page = 1,
    pageSize = 10,
    filters?: {
      search?: string;
      startDate?: Date;
      endDate?: Date;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) {
    const where: any = {
      tenantId,
      ...(filters?.search && {
        OR: [
          { partyName: { contains: filters.search, mode: 'insensitive' } },
          { invoiceNumber: { contains: filters.search, mode: 'insensitive' } }
        ]
      }),
      ...(filters?.startDate && filters?.endDate && {
        AND: [
          { date: { gte: filters.startDate } },
          { date: { lte: filters.endDate } }
        ]
      }),
      ...(filters?.status && filters.status !== 'all' && {
        ...(filters.status === 'unpaid' && { paymentStatus: { not: 'PAID' } }),
        ...(filters.status !== 'unpaid' && { paymentStatus: filters.status })
      })
    }

    const skip = (page - 1) * pageSize

    const [data, count] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: {
          [filters?.sortBy || 'date']: filters?.sortOrder === 'asc' ? 'asc' : 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.invoice.count({ where })
    ])

    return { data, count }
  }

  /**
   * Create a new invoice
   */
  static async createInvoice(data: any, tenantId: string) {
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Calculate totals
      const items = data.items || []
      const subtotal = items.reduce((acc: any, item: any) => acc + (item.quantity * item.unit_price), 0)
      const grandTotal = items.reduce((acc: any, item: any) => acc + item.total_amount, 0)
      const receivedAmount = data.received_amount || 0

      // 1. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber: data.invoice_number,
          partyId: data.party_id,
          partyName: data.party_name,
          date: data.date,
          dueDate: data.due_date,
          status: data.status,
          paymentStatus: data.payment_status,
          partyAddress: data.party_address,
          shippingAddress: data.shipping_address,
          partyPhone: data.party_phone,
          partyEmail: data.party_email,
          notes: data.notes,
          subtotal,
          grandTotal,
          paidAmount: receivedAmount
        }
      })

      // 2. Create Invoice Items
      const invoiceItems = items.map((item: any) => ({
        tenantId,
        invoiceId: invoice.id,
        productId: item.product_id,
        description: item.description,
        // unit: item.unit, // Assuming we don't have unit field in InvoiceItem model
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount || 0,
        gstRate: item.gst_rate,
        taxAmount: item.tax_amount || 0,
        totalAmount: item.total_amount
      }))

      await tx.invoiceItem.createMany({
        data: invoiceItems
      })

      // 3. Update Stock (Stock Movement)
      for (const item of items) {
        if (item.product_id) {
          await tx.stockMovement.create({
            data: {
              tenantId,
              productId: item.product_id,
              type: 'INVOICE_SENT',
              quantity: item.quantity,
              referenceId: invoice.id,
              notes: `Invoice ${invoice.invoiceNumber}`
            }
          })

          // Update product stock
          await tx.product.update({
            where: { id: item.product_id, tenantId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      // 4. Create Payment Record (if received amount > 0)
      if (receivedAmount > 0 && data.party_id) {
        await tx.payment.create({
          data: {
            tenantId,
            partyId: data.party_id,
            invoiceId: invoice.id,
            amount: receivedAmount,
            mode: 'CASH', // Default to cash
            transactionRef: data.invoice_number,
            notes: `Payment for Invoice ${invoice.invoiceNumber}`
          }
        })

        // Update invoice paid amount
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: receivedAmount,
            paymentStatus: receivedAmount >= grandTotal ? 'PAID' : 'PARTIAL'
          }
        })
      }

      // 5. Update Party Balance
      if (data.party_id) {
        // Get current party balance
        const party = await tx.party.findUnique({
          where: { id: data.party_id, tenantId }
        })

        if (party) {
          // Calculate new balance
          // For simplicity, we're just updating based on this transaction
          // In a real system, you'd calculate from all transactions
          const newBalance = party.currentBalance + (data.party_type === 'supplier' ? receivedAmount : -receivedAmount)
          
          await tx.party.update({
            where: { id: data.party_id, tenantId },
            data: {
              currentBalance: newBalance
            }
          })
        }
      }

      // Revalidate paths
      revalidatePath('/dashboard/invoices')
      revalidatePath('/dashboard/parties')

      return invoice
    })
  }

  /**
   * Get invoice details with related data
   */
  static async getInvoiceDetails(id: string, tenantId: string) {
    // 1. Get Invoice with Party Details
    const invoice = await prisma.invoice.findUnique({
      where: { id, tenantId },
      include: {
        party: true
      }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // 2. Get Items
    const items = await prisma.invoiceItem.findMany({
      where: { invoiceId: id, tenantId },
      include: {
        product: {
          select: {
            name: true,
            hsnCode: true
          }
        }
      }
    })

    // 3. Get Tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: invoice.tenantId }
    })

    return { invoice, items, tenant }
  }

  /**
   * Get last invoice number for a tenant
   */
  static async getLastInvoiceNumber(tenantId: string) {
    const lastInvoice = await prisma.invoice.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    })

    if (lastInvoice && lastInvoice.invoiceNumber) {
      // Try to parse number
      const parts = lastInvoice.invoiceNumber.split('-')
      if (parts.length > 1) {
        const num = parseInt(parts[parts.length - 1])
        if (!isNaN(num)) {
          return `${parts[0]}-${String(num + 1).padStart(4, '0')}`
        }
      }
    }

    return 'INV-0001'
  }

  /**
   * Delete an invoice
   */
  static async deleteInvoice(id: string, tenantId: string) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Get Invoice Details
      const invoice = await tx.invoice.findUnique({
        where: { id, tenantId },
        include: {
          invoiceItems: {
            include: {
              product: true
            }
          }
        }
      })

      if (!invoice) {
        throw new Error('Invoice not found')
      }

      // 2. Reverse Stock
      if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
        for (const item of invoice.invoiceItems) {
          if (item.productId) {
            // Update Stock (Add back)
            await tx.product.update({
              where: { id: item.productId, tenantId },
              data: {
                stockQuantity: {
                  increment: item.quantity
                }
              }
            })

            // Record Movement
            await tx.stockMovement.create({
              data: {
                tenantId,
                productId: item.productId,
                type: 'ADJUSTMENT', // Using adjustment for deleted invoice
                quantity: item.quantity,
                referenceId: id,
                notes: `Invoice ${invoice.invoiceNumber} Deleted`
              }
            })
          }
        }
      }

      // 3. Delete Linked Payment (if any)
      if (invoice.invoiceNumber) {
        await tx.payment.deleteMany({
          where: {
            tenantId,
            transactionRef: invoice.invoiceNumber,
            // type: 'in' // Assuming we don't have type field in Payment model
          }
        })
      }

      // 4. Delete Invoice Items
      await tx.invoiceItem.deleteMany({
        where: {
          invoiceId: id,
          tenantId
        }
      })

      // 5. Delete Invoice
      await tx.invoice.delete({
        where: { id, tenantId }
      })

      // 6. Recalculate Party Balance
      if (invoice.partyId) {
        try {
          // In a real implementation, we'd recalculate based on all transactions
          // For now, we'll just adjust by the invoice amount
          const party = await tx.party.findUnique({
            where: { id: invoice.partyId, tenantId }
          })

          if (party) {
            const adjustment = invoice.partyId === party.id ? 
              (invoice.grandTotal - invoice.paidAmount) * -1 : 
              invoice.grandTotal - invoice.paidAmount
            
            await tx.party.update({
              where: { id: invoice.partyId, tenantId },
              data: {
                currentBalance: party.currentBalance + adjustment
              }
            })
          }
        } catch (e) {
          console.error("Failed to sync balance after delete:", e)
        }
      }

      // Revalidate paths
      revalidatePath('/dashboard/invoices')
      revalidatePath('/dashboard/parties')

      return { success: true }
    })
  }
}

export default InvoiceService
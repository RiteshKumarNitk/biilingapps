import { PrismaClient } from '@prisma/client'
import { Party, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export class PartyService {
  /**
   * Get parties with filtering and pagination
   */
  static async getParties(options: {
    tenantId: string
    type?: 'customer' | 'supplier'
    search?: string
    page?: number
    limit?: number
  }) {
    const {
      tenantId,
      type,
      search = '',
      page = 1,
      limit = 10
    } = options

    const skip = (page - 1) * limit

    const where: any = {
      tenantId,
      ...(type && { type: type.toUpperCase() }), // PartyType enum is uppercase
      ...(search && {
        name: { contains: search, mode: 'insensitive' }
      })
    }

    const [parties, totalCount] = await Promise.all([
      prisma.party.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.party.count({ where })
    ])

    return {
      parties,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    }
  }

  /**
   * Create a new party
   */
  static async createParty(data: any, tenantId: string) {
    // Clean up UI-specific fields not in DB
    const { is_shipping_same, is_custom_credit_limit, balance_type, ...dbData } = data

    // Ensure numeric fields are proper numbers or 0
    if (dbData.credit_limit === undefined || dbData.credit_limit === null || isNaN(dbData.credit_limit)) {
      dbData.credit_limit = 0
    }
    if (dbData.opening_balance === undefined || dbData.opening_balance === null || isNaN(dbData.opening_balance)) {
      dbData.opening_balance = 0
    }

    // Derive type (customer/supplier) from balance_type if not present
    // 'to_receive' -> We derive as Customer
    // 'to_pay' -> We derive as Supplier
    if (!dbData.type) {
      dbData.type = balance_type === 'to_pay' ? 'SUPPLIER' : 'CUSTOMER'
    }

    // Initialize current_balance
    if (dbData.current_balance === undefined) {
      // If Supplier ('to_pay'), make opening balance negative (Credit)
      // If Customer ('to_receive'), make opening balance positive (Debit)
      let bal = Math.abs(dbData.opening_balance)
      if (dbData.type === 'SUPPLIER' || balance_type === 'to_pay') {
        bal = -bal
      }
      dbData.current_balance = bal
    }

    // Create party
    const party = await prisma.party.create({
      data: {
        ...dbData,
        tenantId
      }
    })

    // Revalidate path
    revalidatePath('/dashboard/parties')

    return party
  }

  /**
   * Recalculate party balance based on transactions
   */
  static async recalculatePartyBalance(partyId: string, tenantId: string) {
    // 1. Fetch Party
    const party = await prisma.party.findUnique({
      where: { id: partyId, tenantId }
    })

    if (!party) {
      throw new Error('Party not found')
    }

    // 2. Fetch Transactions
    const [invoices, purchases, payments, creditNotes, debitNotes] = await Promise.all([
      prisma.invoice.findMany({
        where: { partyId: partyId, tenantId },
        select: { id: true, date: true, invoiceNumber: true, grandTotal: true }
      }),
      prisma.purchaseOrder.findMany({
        where: { partyId: partyId, tenantId },
        select: { id: true, date: true, poNumber: true, grandTotal: true }
      }),
      prisma.payment.findMany({
        where: { partyId: partyId, tenantId },
        select: { id: true, createdAt: true, amount: true, /* type: true */ } // Assuming we don't have type field
      }),
      prisma.creditNote.findMany({
        where: { partyId: partyId, tenantId },
        select: { id: true, date: true, cnNumber: true, grandTotal: true }
      }),
      prisma.debitNote.findMany({
        where: { partyId: partyId, tenantId },
        select: { id: true, date: true, dnNumber: true, grandTotal: true }
      })
    ])

    // 3. Calculate Balance
    // Convention: +ve = Receivable (Dr), -ve = Payable (Cr)

    let balance = (party.openingBalance || 0)
    // If opening was "To Pay" (Supplier), it's a Credit balance (-ve)
    // If opening was "To Receive" (Customer), it's a Debit balance (+ve)
    // We use the `type` or `balance_type` field.
    // Assuming 'supplier' implies Cr, 'customer' implies Dr. 
    // Ideally check `balance_type` if available for explicit control.
    if ((party.type === 'SUPPLIER') /*|| (party.balance_type === 'to_pay')*/) {
      // Only flip if opening_balance is stored as absolute unsigned number (which it is usually)
      // If it was already stored signed, we wouldn't need this. Assuming absolute.
      if (balance > 0) balance = -balance
    }

    // Process invoices (sales) -> Increases Receivable (Dr +)
    for (const invoice of invoices) {
      balance += invoice.grandTotal || 0
      // Note: Payment is handled as separate 'payment_in' transaction
    }

    // Process purchases -> Increases Payable (Cr -)
    for (const purchase of purchases) {
      balance -= purchase.grandTotal || 0
    }

    // Process payments
    // Note: Since we don't have a clear type field in payments, we'll need to infer
    // For now, we'll skip payment processing in this calculation
    // In a real implementation, we'd have a clear way to distinguish payment_in vs payment_out

    // Process credit notes (sales return) -> Reduces Receivable (Dr -)
    for (const creditNote of creditNotes) {
      balance -= creditNote.grandTotal || 0
    }

    // Process debit notes (purchase return) -> Reduces Payable (Cr +)
    for (const debitNote of debitNotes) {
      balance += debitNote.grandTotal || 0
    }

    // 4. Update
    const updatedParty = await prisma.party.update({
      where: { id: partyId, tenantId },
      data: { currentBalance: balance }
    })

    // Revalidate paths
    revalidatePath('/dashboard/parties')
    revalidatePath(`/dashboard/parties/${partyId}`)

    return balance
  }

  /**
   * Bulk recalculate all parties
   */
  static async recalculateAllParties(tenantId: string) {
    const parties = await prisma.party.findMany({
      where: { tenantId },
      select: { id: true }
    })

    for (const party of parties) {
      try {
        await this.recalculatePartyBalance(party.id, tenantId)
      } catch (e) {
        console.error(`Failed to recalc party ${party.id}`, e)
      }
    }

    revalidatePath('/dashboard/parties')
  }

  /**
   * Get party ledger
   */
  static async getPartyLedger(partyId: string, tenantId: string) {
    // Fetch different types of transactions
    const [invoices, purchases, payments, creditNotes, debitNotes] = await Promise.all([
      prisma.invoice.findMany({
        where: { partyId: partyId, tenantId },
        select: {
          id: true,
          date: true,
          invoiceNumber: true,
          grandTotal: true,
          status: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.purchaseOrder.findMany({
        where: { partyId: partyId, tenantId },
        select: {
          id: true,
          date: true,
          poNumber: true,
          grandTotal: true,
          status: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.payment.findMany({
        where: { partyId: partyId, tenantId },
        select: {
          id: true,
          createdAt: true,
          amount: true,
          /* type: true, */
          transactionRef: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.creditNote.findMany({
        where: { partyId: partyId, tenantId },
        select: {
          id: true,
          date: true,
          cnNumber: true,
          grandTotal: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.debitNote.findMany({
        where: { partyId: partyId, tenantId },
        select: {
          id: true,
          date: true,
          dnNumber: true,
          grandTotal: true
        },
        orderBy: { date: 'desc' }
      })
    ])

    // Combine and sort
    const ledger = [
      ...(invoices.map(i => ({
        ...i,
        type: 'INVOICE',
        amount: i.grandTotal,
        ref: i.invoiceNumber
      }))),
      ...(purchases.map(p => ({
        ...p,
        type: 'PURCHASE_ORDER',
        amount: p.grandTotal,
        ref: p.poNumber
      }))),
      // Note: Payments type inference would be needed here
      ...(payments.map(p => ({
        ...p,
        type: 'PAYMENT', // Placeholder
        amount: p.amount,
        ref: p.transactionRef
      }))),
      ...(creditNotes.map(cn => ({
        ...cn,
        type: 'CREDIT_NOTE',
        amount: cn.grandTotal,
        ref: p.cnNumber
      }))),
      ...(debitNotes.map(dn => ({
        ...dn,
        type: 'DEBIT_NOTE',
        amount: dn.grandTotal,
        ref: dn.dnNumber
      })))
    ].sort((a, b) => {
      const dateA = a.date || a.createdAt
      const dateB = b.date || b.createdAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return ledger
  }

  /**
   * Get party by ID
   */
  static async getParty(id: string, tenantId: string) {
    const party = await prisma.party.findUnique({
      where: { id, tenantId }
    })

    if (!party) {
      throw new Error('Party not found')
    }

    return party
  }

  /**
   * Update party
   */
  static async updateParty(id: string, tenantId: string, data: any) {
    // 1. Fetch current party data to calculate balance diff
    const currentParty = await prisma.party.findUnique({
      where: { id, tenantId },
      select: {
        openingBalance: true,
        currentBalance: true
      }
    })

    if (!currentParty) {
      throw new Error('Failed to fetch existing party data')
    }

    // Clean up UI-specific fields not in DB
    const { is_shipping_same, is_custom_credit_limit, balance_type, ...dbData } = data

    // Ensure numeric fields
    if (dbData.credit_limit !== undefined && (dbData.credit_limit === null || isNaN(dbData.credit_limit))) {
      dbData.credit_limit = 0
    }

    // Handle Opening Balance
    if (dbData.opening_balance !== undefined) {
      // Recalculate current_balance logic:
      // New Current Balance = Old Current Balance - Old Opening Balance + New Opening Balance
      // This assumes current_balance = opening_balance + transactions
      const oldOpening = currentParty.openingBalance || 0
      const oldCurrent = currentParty.currentBalance || 0
      const newOpening = dbData.opening_balance || 0

      const diff = newOpening - oldOpening
      dbData.current_balance = oldCurrent + diff
    }

    // Update type if balance_type is provided (though usually type shouldn't change, but if user wants to swap...)
    if (balance_type) {
      dbData.type = balance_type === 'to_pay' ? 'SUPPLIER' : 'CUSTOMER'
    }

    // Explicitly exclude fields that shouldn't change
    delete dbData.id
    delete dbData.createdAt
    delete dbData.tenantId

    // Update party
    const party = await prisma.party.update({
      where: { id, tenantId },
      data: dbData
    })

    // Revalidate paths
    revalidatePath('/dashboard/parties')
    revalidatePath(`/dashboard/parties/${id}`)

    return party
  }

  /**
   * Delete party
   */
  static async deleteParty(id: string, tenantId: string) {
    await prisma.party.delete({
      where: { id, tenantId }
    })

    revalidatePath('/dashboard/parties')
  }

  /**
   * Import parties bulk
   */
  static async importPartiesBulk(parties: any[], tenantId: string) {
    // 1. Fetch existing parties for name matching
    const existingParties = await prisma.party.findMany({
      where: { tenantId },
      select: { id: true, name: true }
    })

    // Create normalized map (lowercase trimmed name -> id)
    const nameToIdMap = new Map<string, string>()
    existingParties?.forEach(p => {
      if (p.name) nameToIdMap.set(p.name.trim().toLowerCase(), p.id)
    })

    const partiesToInsert = parties.map(p => {
      let current_balance = p.current_balance
      if (current_balance === undefined) {
        let bal = Math.abs(p.opening_balance || 0)
        if (p.type === 'supplier') {
          bal = -bal
        }
        current_balance = bal
      }

      const dbRow = {
        ...p,
        tenantId,
        credit_limit: p.credit_limit || 0,
        opening_balance: p.opening_balance || 0,
        current_balance: current_balance
      }

      // Smart Match Logic
      // If ID is missing/empty, try to find by Name
      if (!dbRow.id) {
        const normalizedName = dbRow.name?.trim().toLowerCase()
        const existingId = nameToIdMap.get(normalizedName)
        if (existingId) {
          dbRow.id = existingId // Match found: Update
        } else {
          delete dbRow.id // No match: Insert (Auto UUID)
        }
      }

      return dbRow
    })

    const insertedData = await prisma.party.createMany({
      data: partiesToInsert,
      skipDuplicates: true
    })

    revalidatePath('/dashboard/parties')
    return { success: true, count: insertedData.count || parties.length }
  }
}

export default PartyService
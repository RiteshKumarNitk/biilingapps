import { revalidatePath } from 'next/cache'
import prisma from '../prisma'
import { partySchema, PartyFormValues } from '../schemas/party'

function mapPartyToPrisma(data: PartyFormValues) {
  return {
    name: data.name,
    gstin: data.gstin,
    gstType: data.gst_type,
    phone: data.phone,
    email: data.email || undefined,
    address: data.billing_address,
    shippingAddress: data.is_shipping_same ? data.billing_address : data.shipping_address,
    state: data.state,
    city: data.city,
    pincode: data.pincode,
    panNumber: data.pan_number,
    bankDetails: data.bank_details,
    terms: data.terms,
    description: data.description,
    creditLimit: data.is_custom_credit_limit ? data.credit_limit : undefined,
    asOfDate: data.as_of_date,
    openingBalance: data.opening_balance || 0,
    type: (data.balance_type === 'to_pay' ? 'SUPPLIER' : 'CUSTOMER') as 'SUPPLIER' | 'CUSTOMER',
  }
}

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
  static async createParty(data: unknown, tenantId: string) {
    const parsed = partySchema.parse(data)
    const mapped = mapPartyToPrisma(parsed)

    // Opening balance sign: Supplier ('to_pay') is a Credit balance (-ve),
    // Customer ('to_receive') is a Debit balance (+ve)
    const absOpening = Math.abs(mapped.openingBalance)
    const currentBalance = mapped.type === 'SUPPLIER' ? -absOpening : absOpening

    // Create party
    const party = await prisma.party.create({
      data: {
        ...mapped,
        currentBalance,
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

    // Process payments. The Payment model has no direction field, so we infer
    // it from the party type: payments against a customer reduce what they owe
    // us (Receivable -), payments against a supplier reduce what we owe them
    // (Payable +).
    for (const payment of payments) {
      balance += party.type === 'SUPPLIER' ? (payment.amount || 0) : -(payment.amount || 0)
    }

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
        ref: cn.cnNumber
      }))),
      ...(debitNotes.map(dn => ({
        ...dn,
        type: 'DEBIT_NOTE',
        amount: dn.grandTotal,
        ref: dn.dnNumber
      })))
    ].sort((a: any, b: any) => {
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
  static async updateParty(id: string, tenantId: string, data: unknown) {
    const parsed = partySchema.parse(data)
    const mapped = mapPartyToPrisma(parsed)

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

    // Recalculate current_balance so it stays consistent with any change to
    // opening balance: New Current = Old Current - Old Opening + New Opening.
    // This preserves transaction-driven movement since creation.
    const oldOpening = currentParty.openingBalance || 0
    const oldCurrent = currentParty.currentBalance || 0
    const newOpening = mapped.openingBalance
    const currentBalance = oldCurrent + (newOpening - oldOpening)

    // Update party
    const party = await prisma.party.update({
      where: { id, tenantId },
      data: { ...mapped, currentBalance }
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
  static async importPartiesBulk(parties: Record<string, unknown>[], tenantId: string) {
    // 1. Fetch existing parties for name matching
    const existingParties = await prisma.party.findMany({
      where: { tenantId },
      select: { id: true, name: true }
    })

    // Create normalized map (lowercase trimmed name -> id)
    const nameToIdMap = new Map<string, string>()
    existingParties.forEach(p => {
      if (p.name) nameToIdMap.set(p.name.trim().toLowerCase(), p.id)
    })

    let count = 0
    for (const p of parties) {
      const name = String(p.name ?? '').trim()
      if (!name) continue

      const type: 'CUSTOMER' | 'SUPPLIER' = p.type === 'supplier' ? 'SUPPLIER' : 'CUSTOMER'
      const openingBalance = Number(p.opening_balance) || 0
      const absBalance = Math.abs(openingBalance)
      const currentBalance = type === 'SUPPLIER' ? -absBalance : absBalance

      const dbRow = {
        tenantId,
        name,
        type,
        phone: (p.phone as string) || undefined,
        email: (p.email as string) || undefined,
        gstin: (p.gstin as string) || undefined,
        gstType: (p.gst_type as string) || undefined,
        address: (p.billing_address as string) || (p.address as string) || undefined,
        shippingAddress: (p.shipping_address as string) || undefined,
        openingBalance,
        currentBalance,
      }

      const existingId = nameToIdMap.get(name.toLowerCase())

      if (existingId) {
        await prisma.party.update({ where: { id: existingId, tenantId }, data: dbRow })
      } else {
        await prisma.party.create({ data: dbRow })
      }
      count++
    }

    revalidatePath('/dashboard/parties')
    return { success: true, count }
  }
}

export default PartyService
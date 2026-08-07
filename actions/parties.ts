'use server'

import PartyService from '@/lib/services/party.service'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { Party } from '@prisma/client'

// Many older components read the legacy snake_case/lowercase shape
// (current_balance, opening_balance, type: 'customer'|'supplier'). Prisma
// returns camelCase fields and an uppercase enum, so this normalizes both
// shapes onto the same object rather than fixing every call site.
function withLegacyAliases(party: Party) {
  return {
    ...party,
    type: party.type.toLowerCase() as 'customer' | 'supplier',
    opening_balance: party.openingBalance,
    current_balance: party.currentBalance,
    balance: party.currentBalance,
    gst_type: party.gstType,
    billing_address: party.address,
    shipping_address: party.shippingAddress,
    credit_limit: party.creditLimit,
    as_of_date: party.asOfDate,
    pan_number: party.panNumber,
    bank_details: party.bankDetails,
  }
}

export async function getParties(type?: 'customer' | 'supplier', search = '', _ts?: number) {
  const user = await requireAuth()
  const where: any = { tenantId: user.tenantId }
  if (type) {
    where.type = type.toUpperCase()
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  const parties = await prisma.party.findMany({ where, orderBy: { name: 'asc' } })
  return parties.map(withLegacyAliases)
}

export async function createParty(data: unknown) {
  const user = await requireAuth()
  return await PartyService.createParty(data, user.tenantId)
}

export async function recalculatePartyBalance(partyId: string) {
  const user = await requireAuth()
  return await PartyService.recalculatePartyBalance(partyId, user.tenantId)
}

export async function recalculateAllParties() {
  const user = await requireAuth()
  return await PartyService.recalculateAllParties(user.tenantId)
}

export async function getPartyLedger(partyId: string) {
  const user = await requireAuth()
  return await PartyService.getPartyLedger(partyId, user.tenantId)
}

export async function getParty(id: string) {
  const user = await requireAuth()
  const party = await prisma.party.findUnique({ where: { id, tenantId: user.tenantId } })
  return party ? withLegacyAliases(party) : null
}

export async function updateParty(id: string, data: unknown) {
  const user = await requireAuth()
  return await PartyService.updateParty(id, user.tenantId, data)
}

export async function deleteParty(id: string) {
  const user = await requireAuth()
  return await PartyService.deleteParty(id, user.tenantId)
}

export async function importPartiesBulk(parties: Record<string, unknown>[]) {
  const user = await requireAuth()
  try {
    const result = await PartyService.importPartiesBulk(parties, user.tenantId)
    return { success: true, count: result.count }
  } catch (error) {
    console.error('Failed to import parties:', error)
    const message = error instanceof Error ? error.message : 'Failed to import parties'
    return { success: false, error: message }
  }
}
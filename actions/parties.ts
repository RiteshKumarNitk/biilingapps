'use server'

import PartyService from '@/lib/services/party.service'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function getParties(type?: 'customer' | 'supplier', search = '', _ts?: number) {
  const user = await requireAuth()
  const where: any = { tenantId: user.tenantId }
  if (type) {
    where.type = type.toUpperCase()
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  return prisma.party.findMany({ where, orderBy: { name: 'asc' } })
}

export async function createParty(data: any) {
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
  return prisma.party.findUnique({ where: { id, tenantId: user.tenantId } })
}

export async function updateParty(id: string, data: any) {
  const user = await requireAuth()
  return await PartyService.updateParty(id, user.tenantId, data)
}

export async function deleteParty(id: string) {
  const user = await requireAuth()
  return await PartyService.deleteParty(id, user.tenantId)
}

export async function importPartiesBulk(parties: any[]) {
  const user = await requireAuth()
  try {
    const result = await PartyService.importPartiesBulk(parties, user.tenantId)
    return { success: true, count: result.count }
  } catch (error: any) {
    console.error('Failed to import parties:', error)
    return { success: false, error: error.message || 'Failed to import parties' }
  }
}
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class PartyRepository {
  async findAll(tenantId: string, skip = 0, take = 50) {
    return prisma.party.findMany({
      where: { tenantId },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(tenantId: string, id: string) {
    return prisma.party.findFirst({
      where: { id, tenantId }
    })
  }

  async create(data: Prisma.PartyUncheckedCreateInput) {
    return prisma.party.create({
      data
    })
  }
}

export const partyRepository = new PartyRepository()

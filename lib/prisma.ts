import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

let prisma: PrismaClient

declare global {
  var prisma: PrismaClient | undefined
}

const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is missing. Using dummy URL for build phase.")
    process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy"
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

if (process.env.NODE_ENV === 'production') {
  prisma = getPrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = getPrismaClient()
  }
  prisma = global.prisma
}

export default prisma
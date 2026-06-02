import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing data (optional, be careful in production!)
  // await prisma.tenant.deleteMany()

  // Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Vyapar Demo Store',
      slug: 'vyapar-demo',
      email: 'hello@vyapar-demo.com',
      address: '123 Market Street, Delhi',
      phone: '9876543210',
      gstin: '07AAECV9999K1Z2'
    }
  })
  console.log(`Created Tenant: ${tenant.name}`)

  // Create User Profile
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.usersProfile.create({
    data: {
      email: 'admin@vyapardemo.com',
      password: hashedPassword,
      fullName: 'Ritesh Kumar',
      role: 'owner',
      tenantId: tenant.id
    }
  })
  console.log(`Created Admin User: ${user.email}`)

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      name: 'Lenovo ThinkPad X1',
      description: 'Business Laptop 16GB RAM',
      sku: 'LNV-X1',
      price: 120000,
      costPrice: 95000,
      gstRate: 18,
      stockQuantity: 15,
      unit: 'pcs'
    }
  })

  const product2 = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      name: 'Logitech MX Master 3',
      description: 'Wireless Mouse',
      sku: 'LOG-MX3',
      price: 8500,
      costPrice: 6000,
      gstRate: 18,
      stockQuantity: 40,
      unit: 'pcs'
    }
  })

  const product3 = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      name: 'Mechanical Keyboard',
      price: 4500,
      gstRate: 18,
      stockQuantity: 20,
      unit: 'pcs'
    }
  })
  console.log('Created Products')

  // Create Parties
  const customer = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      type: 'CUSTOMER',
      name: 'Acme Corp',
      email: 'billing@acmecorp.com',
      phone: '9998887776',
      address: '456 Business Ave, Mumbai',
      openingBalance: 0,
      currentBalance: 128500
    }
  })

  const supplier = await prisma.party.create({
    data: {
      tenantId: tenant.id,
      type: 'SUPPLIER',
      name: 'Tech Distributors Pvt Ltd',
      email: 'sales@techdistributors.com',
      phone: '1112223334',
      openingBalance: 0,
      currentBalance: 0
    }
  })
  console.log('Created Parties')

  // Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      invoiceNumber: 'INV-2026-001',
      date: new Date(),
      partyId: customer.id,
      partyName: customer.name,
      partyAddress: customer.address,
      status: 'GENERATED',
      subtotal: 128500,
      totalGst: 23130,
      grandTotal: 151630,
      paidAmount: 23130,
      paymentStatus: 'PARTIAL',
      invoiceItems: {
        create: [
          {
            tenantId: tenant.id,
            productId: product1.id,
            description: product1.name,
            quantity: 1,
            unitPrice: product1.price,
            gstRate: product1.gstRate,
            taxAmount: 21600,
            totalAmount: 141600
          },
          {
            tenantId: tenant.id,
            productId: product2.id,
            description: product2.name,
            quantity: 1,
            unitPrice: product2.price,
            gstRate: product2.gstRate,
            taxAmount: 1530,
            totalAmount: 10030
          }
        ]
      }
    }
  })
  console.log(`Created Invoice: ${invoice.invoiceNumber}`)

  // Create Payment
  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      partyId: customer.id,
      invoiceId: invoice.id,
      amount: 23130,
      mode: 'ONLINE',
      transactionRef: 'UPI-987654321',
      notes: 'Initial partial payment'
    }
  })
  console.log(`Created Payment: ${payment.amount}`)

  // Create Ledger Entry
  await prisma.ledgerEntry.create({
    data: {
      tenantId: tenant.id,
      date: new Date(),
      description: `Payment received for ${invoice.invoiceNumber}`,
      accountType: 'bank',
      debit: 23130,
      credit: 0,
      referenceId: payment.id,
      referenceType: 'payment'
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Bulk realistic-data seed for QA load testing (Phase 3).
 * Writes directly via Prisma into a dedicated, clearly-marked test tenant so
 * it never mixes with real business data. Safe to re-run: delete the tenant
 * (cascades) to remove everything this script created.
 *
 * Usage: npx tsx prisma/seed-qa-data.ts
 */
import 'dotenv/config'
import { PrismaClient, PartyType, PaymentMode } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const TENANT_SLUG = 'qa-load-test'

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function randDateWithinDays(daysBack: number) {
    const now = Date.now()
    return new Date(now - randInt(0, daysBack) * 24 * 60 * 60 * 1000)
}

const FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavita', 'Suresh', 'Neha', 'Arjun', 'Pooja', 'Manoj', 'Divya', 'Sanjay']
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Joshi', 'Mehta', 'Kapoor', 'Chopra']
const BUSINESS_SUFFIX = ['Traders', 'Enterprises', 'Industries', 'Trading Co', 'Distributors', 'Retail', 'Wholesale', 'Solutions', 'Textiles', 'Electronics']
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow']

const CATEGORIES = ['Electronics', 'Stationery', 'Furniture', 'Groceries', 'Apparel', 'Hardware', 'Cosmetics', 'Sports']
const PRODUCT_NOUNS = ['Widget', 'Gadget', 'Component', 'Kit', 'Set', 'Pack', 'Unit', 'Device', 'Accessory', 'Item']
const GST_SLABS = [0, 5, 12, 18, 28]
const UNITS = ['pcs', 'box', 'kg', 'ltr', 'dozen']

async function main() {
    console.log('Seeding QA load-test tenant...')

    const existing = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } })
    if (existing) {
        console.log('QA tenant already exists, deleting it first for a clean re-seed...')
        await prisma.tenant.delete({ where: { id: existing.id } })
    }

    const tenant = await prisma.tenant.create({
        data: {
            name: '[QA TEST] Load Test Business',
            slug: TENANT_SLUG,
            email: 'qa-test@example.com',
            address: '1 Test Street, QA City',
            phone: '9000000000',
            gstin: '27AAAAA0000A1Z5',
        }
    })
    console.log(`Created tenant: ${tenant.name} (${tenant.id})`)

    const hashedPassword = await bcrypt.hash('QaTest@12345', 10)
    await prisma.usersProfile.create({
        data: {
            email: 'qa-test@example.com',
            password: hashedPassword,
            fullName: 'QA Test Owner',
            role: 'owner',
            tenantId: tenant.id,
        }
    })
    console.log('Created owner user (login: qa-test@example.com / QaTest@12345)')

    // ---- Parties: ~35 customers, ~15 suppliers ----
    const partyData = []
    for (let i = 0; i < 35; i++) {
        const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(BUSINESS_SUFFIX)}`
        partyData.push({
            tenantId: tenant.id,
            type: PartyType.CUSTOMER,
            name,
            phone: `9${randInt(100000000, 999999999)}`,
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            address: `${randInt(1, 999)} Main Road, ${pick(CITIES)}`,
            city: pick(CITIES),
            openingBalance: randInt(0, 20000),
            currentBalance: 0,
        })
    }
    for (let i = 0; i < 15; i++) {
        const name = `${pick(BUSINESS_SUFFIX)} ${pick(LAST_NAMES)} Pvt Ltd`
        partyData.push({
            tenantId: tenant.id,
            type: PartyType.SUPPLIER,
            name,
            phone: `8${randInt(100000000, 999999999)}`,
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            address: `${randInt(1, 999)} Industrial Area, ${pick(CITIES)}`,
            city: pick(CITIES),
            openingBalance: randInt(0, 15000),
            currentBalance: 0,
        })
    }
    await prisma.party.createMany({ data: partyData })
    const parties = await prisma.party.findMany({ where: { tenantId: tenant.id } })
    const customers = parties.filter(p => p.type === 'CUSTOMER')
    const suppliers = parties.filter(p => p.type === 'SUPPLIER')
    console.log(`Created ${parties.length} parties (${customers.length} customers, ${suppliers.length} suppliers)`)

    // ---- Products: ~120 ----
    const productData = []
    for (let i = 0; i < 120; i++) {
        const cost = randInt(50, 20000)
        const margin = 1 + randInt(10, 60) / 100
        productData.push({
            tenantId: tenant.id,
            name: `${pick(CATEGORIES)} ${pick(PRODUCT_NOUNS)} #${i + 1}`,
            description: `Sample product ${i + 1} for QA load testing`,
            sku: `QA-SKU-${1000 + i}`,
            hsnCode: `${randInt(1000, 9999)}`,
            price: Math.round(cost * margin),
            costPrice: cost,
            gstRate: pick(GST_SLABS),
            stockQuantity: randInt(0, 500),
            lowStockThreshold: 10,
            unit: pick(UNITS),
            category: pick(CATEGORIES),
        })
    }
    await prisma.product.createMany({ data: productData })
    const products = await prisma.product.findMany({ where: { tenantId: tenant.id } })
    console.log(`Created ${products.length} products`)

    function buildItems(count: number) {
        const chosen = Array.from({ length: count }, () => pick(products))
        return chosen.map(p => {
            const quantity = randInt(1, 10)
            const discount = Math.random() < 0.2 ? Math.round(p.price * quantity * 0.05) : 0
            const taxable = quantity * p.price - discount
            const taxAmount = Math.round(taxable * (p.gstRate / 100) * 100) / 100
            const totalAmount = Math.round((taxable + taxAmount) * 100) / 100
            return { product: p, quantity, discount, taxable, taxAmount, totalAmount }
        })
    }

    // ---- Sales invoices: 300 ----
    const stockDelta = new Map<string, number>()
    let salesCreated = 0
    for (let i = 0; i < 300; i++) {
        const customer = pick(customers)
        const items = buildItems(randInt(1, 4))
        const subtotal = items.reduce((a, it) => a + it.taxable, 0)
        const totalGst = items.reduce((a, it) => a + it.taxAmount, 0)
        const grandTotal = Math.round((subtotal + totalGst) * 100) / 100
        const paymentRoll = Math.random()
        const paidAmount = paymentRoll < 0.5 ? grandTotal : paymentRoll < 0.8 ? Math.round(grandTotal * 0.5 * 100) / 100 : 0
        const paymentStatus = paidAmount >= grandTotal ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID'
        const date = randDateWithinDays(180)

        const invoice = await prisma.invoice.create({
            data: {
                tenantId: tenant.id,
                invoiceNumber: `QA-INV-${1000 + i}`,
                date,
                createdAt: date,
                partyId: customer.id,
                partyName: customer.name,
                partyAddress: customer.address,
                status: 'GENERATED',
                subtotal: Math.round(subtotal * 100) / 100,
                totalGst: Math.round(totalGst * 100) / 100,
                grandTotal,
                paidAmount,
                paymentStatus,
                invoiceItems: {
                    create: items.map(it => ({
                        tenantId: tenant.id,
                        productId: it.product.id,
                        description: it.product.name,
                        quantity: it.quantity,
                        unitPrice: it.product.price,
                        gstRate: it.product.gstRate,
                        discount: it.discount,
                        taxAmount: it.taxAmount,
                        totalAmount: it.totalAmount,
                    }))
                }
            }
        })

        for (const it of items) {
            stockDelta.set(it.product.id, (stockDelta.get(it.product.id) || 0) - it.quantity)
        }

        if (paidAmount > 0) {
            await prisma.payment.create({
                data: {
                    tenantId: tenant.id,
                    partyId: customer.id,
                    invoiceId: invoice.id,
                    amount: paidAmount,
                    mode: pick([PaymentMode.CASH, PaymentMode.UPI, PaymentMode.BANK_TRANSFER, PaymentMode.CHEQUE, PaymentMode.ONLINE]),
                    transactionRef: invoice.invoiceNumber,
                    createdAt: date,
                }
            })
        }
        salesCreated++
        if (salesCreated % 50 === 0) console.log(`  ...${salesCreated}/300 sales invoices created`)
    }
    console.log(`Created ${salesCreated} sales invoices`)

    // ---- Purchase bills: 200 ----
    let purchasesCreated = 0
    for (let i = 0; i < 200; i++) {
        const supplier = pick(suppliers)
        const items = buildItems(randInt(1, 4))
        const grandTotal = Math.round(items.reduce((a, it) => a + it.taxable + it.taxAmount, 0) * 100) / 100
        const date = randDateWithinDays(180)

        await prisma.purchaseOrder.create({
            data: {
                tenantId: tenant.id,
                poNumber: `QA-PO-${1000 + i}`,
                date,
                createdAt: date,
                partyId: supplier.id,
                partyName: supplier.name,
                status: 'RECEIVED',
                grandTotal,
                poItems: {
                    create: items.map(it => ({
                        tenantId: tenant.id,
                        productId: it.product.id,
                        description: it.product.name,
                        quantity: it.quantity,
                        unit: it.product.unit,
                        unitPrice: it.product.costPrice,
                        gstRate: it.product.gstRate,
                        discount: it.discount,
                        taxAmount: it.taxAmount,
                        totalAmount: it.totalAmount,
                        hsnCode: it.product.hsnCode,
                    }))
                }
            }
        })

        for (const it of items) {
            stockDelta.set(it.product.id, (stockDelta.get(it.product.id) || 0) + it.quantity)
        }
        purchasesCreated++
        if (purchasesCreated % 50 === 0) console.log(`  ...${purchasesCreated}/200 purchase bills created`)
    }
    console.log(`Created ${purchasesCreated} purchase bills`)

    // ---- Apply net stock movement from all sales/purchases ----
    for (const [productId, delta] of stockDelta.entries()) {
        await prisma.product.update({
            where: { id: productId },
            data: { stockQuantity: { increment: delta } }
        })
    }
    console.log(`Applied stock deltas to ${stockDelta.size} products`)

    // ---- A handful of returns: credit notes (sales returns) and debit notes (purchase returns) ----
    const recentInvoices = await prisma.invoice.findMany({ where: { tenantId: tenant.id }, take: 15, include: { invoiceItems: true } })
    for (const inv of recentInvoices.slice(0, 10)) {
        const item = pick(inv.invoiceItems)
        if (!item) continue
        const qty = 1
        const taxable = qty * item.unitPrice
        const taxAmount = Math.round(taxable * (item.gstRate / 100) * 100) / 100
        await prisma.creditNote.create({
            data: {
                tenantId: tenant.id,
                cnNumber: `QA-CN-${inv.invoiceNumber}`,
                date: new Date(),
                partyId: inv.partyId,
                partyName: inv.partyName,
                originalInvoiceId: inv.id,
                subtotal: taxable,
                totalGst: taxAmount,
                grandTotal: Math.round((taxable + taxAmount) * 100) / 100,
                notes: 'QA test sales return',
                creditNoteItems: {
                    create: [{
                        tenantId: tenant.id,
                        productId: item.productId,
                        description: item.description,
                        quantity: qty,
                        unitPrice: item.unitPrice,
                        gstRate: item.gstRate,
                        taxAmount,
                        totalAmount: Math.round((taxable + taxAmount) * 100) / 100,
                    }]
                }
            }
        })
    }
    const recentPOs = await prisma.purchaseOrder.findMany({ where: { tenantId: tenant.id }, take: 10, include: { poItems: true } })
    for (const po of recentPOs.slice(0, 8)) {
        const item = pick(po.poItems)
        if (!item) continue
        const qty = 1
        const taxable = qty * item.unitPrice
        const taxAmount = Math.round(taxable * (item.gstRate / 100) * 100) / 100
        await prisma.debitNote.create({
            data: {
                tenantId: tenant.id,
                dnNumber: `QA-DN-${po.poNumber}`,
                date: new Date(),
                partyId: po.partyId,
                partyName: po.partyName,
                subtotal: taxable,
                totalGst: taxAmount,
                grandTotal: Math.round((taxable + taxAmount) * 100) / 100,
                notes: 'QA test purchase return',
                debitNoteItems: {
                    create: [{
                        tenantId: tenant.id,
                        productId: item.productId,
                        description: item.description,
                        quantity: qty,
                        unitPrice: item.unitPrice,
                        gstRate: item.gstRate,
                        taxAmount,
                        totalAmount: Math.round((taxable + taxAmount) * 100) / 100,
                    }]
                }
            }
        })
    }
    console.log('Created 10 credit notes (sales returns) and 8 debit notes (purchase returns)')

    // ---- Recompute every party's currentBalance from scratch (same formula as PartyService.recalculatePartyBalance) ----
    for (const party of parties) {
        const [inv, po, pay, cn, dn] = await Promise.all([
            prisma.invoice.findMany({ where: { partyId: party.id }, select: { grandTotal: true } }),
            prisma.purchaseOrder.findMany({ where: { partyId: party.id }, select: { grandTotal: true } }),
            prisma.payment.findMany({ where: { partyId: party.id }, select: { amount: true } }),
            prisma.creditNote.findMany({ where: { partyId: party.id }, select: { grandTotal: true } }),
            prisma.debitNote.findMany({ where: { partyId: party.id }, select: { grandTotal: true } }),
        ])
        let balance = party.openingBalance || 0
        if (party.type === 'SUPPLIER' && balance > 0) balance = -balance
        for (const i of inv) balance += i.grandTotal || 0
        for (const p of po) balance -= p.grandTotal || 0
        for (const p of pay) balance += party.type === 'SUPPLIER' ? (p.amount || 0) : -(p.amount || 0)
        for (const c of cn) balance -= c.grandTotal || 0
        for (const d of dn) balance += d.grandTotal || 0
        await prisma.party.update({ where: { id: party.id }, data: { currentBalance: Math.round(balance * 100) / 100 } })
    }
    console.log('Recomputed all party balances from transactions')

    console.log('\n✅ QA seed complete.')
    console.log(`Tenant: ${tenant.name} (slug: ${TENANT_SLUG})`)
    console.log('Login: qa-test@example.com / QaTest@12345')
    console.log('To remove all of this later: delete the Tenant row with this slug (cascades to everything).')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

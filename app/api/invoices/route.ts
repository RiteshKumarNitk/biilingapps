import { NextResponse } from 'next/server'
import InvoiceService from '@/lib/services/invoice.service'
import { requireAuth } from '@/lib/auth-server'
import { invoiceSchema } from '@/lib/schemas/invoice'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const invoices = await InvoiceService.getInvoices(user.tenantId, page, limit)

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const data = invoiceSchema.parse(body)
    const invoice = await InvoiceService.createInvoice(data, user.tenantId)

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.startsWith('Unauthorized') ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

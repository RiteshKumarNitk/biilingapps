import { NextResponse } from 'next/server'
import InvoiceService from '@/lib/services/invoice.service'

export async function GET(req: Request) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const invoices = await InvoiceService.getInvoices(tenantId, page, limit)
    
    return NextResponse.json({ invoices })
  } catch (error: any) {
    console.error('Get invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const body = await req.json()
    const invoice = await InvoiceService.createInvoice(body, tenantId)
    
    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

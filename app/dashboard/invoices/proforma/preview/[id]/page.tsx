
import { InvoiceData } from '@/lib/invoice-engine/types'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InvoicePreviewWrapper } from '@/components/invoice-engine/invoice-preview-wrapper'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

async function getProformaData(id: string): Promise<InvoiceData> {
    const user = await requireAuth()

    const q = await prisma.quotation.findUnique({
        where: { id, tenantId: user.tenantId },
        include: { quotationItems: true }
    })

    if (!q) throw new Error('Document not found')

    const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId }
    })

    // Map to InvoiceData
    return {
        id: q.id,
        documentTitle: q.type === 'proforma' ? 'Proforma Invoice' : 'Estimate / Quotation',
        documentNumber: q.quotationNumber,
        date: new Date(q.date).toLocaleDateString('en-IN'),
        dueDate: q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : undefined,

        company: {
            name: tenant?.name || 'My Business',
            address: tenant?.address || 'Business Address',
            phone: tenant?.phone || '',
            email: tenant?.email || user?.email,
            gstin: tenant?.gstin || '',
        },
        billTo: {
            name: q.partyName || 'Cash Sale',
            address: q.partyAddress || 'Address Line 1\nCity, State',
        },
        items: q.quotationItems.map((i: any, idx: number) => ({
            id: i.id,
            name: i.description,
            quantity: Number(i.quantity),
            unit: 'PCS',
            rate: Number(i.unitPrice),
            tax_amount: Number(i.taxAmount),
            gst_rate: Number(i.gstRate),
            amount: Number(i.totalAmount),
            hsn: '8471'
        })),
        subTotal: Number(q.subtotal),
        discountTotal: Number(q.discountAmount),
        taxTotal: Number(q.totalGst),
        grandTotal: Number(q.grandTotal),
        notes: q.notes || '',
        showGstColumns: true,
        amountInWords: 'Amount in words not implemented',
    }
}

export default async function PreviewPage({ params }: PageProps) {
    try {
        const resolvedParams = await params;
        const data = await getProformaData(resolvedParams.id)

        // We render a client component that takes over the screen
        // In Next.js App Router, we can just render the preview component 
        // which has "fixed inset-0" to look like a modal/full page.
        // We'll allow it to close by navigating back.

        return (
            <div className="min-h-screen bg-slate-50">
                {/* 
                   Since 'onClose' is a prop for client interaction (navigation), 
                   we'd ideally wrap this in a client component wrapper or handle navigation within InvoicePreview. 
                   For now, InvoicePreview will just use window.history.back() or Link if we modify it.
                   But wait, InvoicePreview component takes 'onClose'.
                   Let's wrap it in a client component here.
                 */}
                <InvoicePreviewWrapper data={data} />
            </div>
        )

    } catch (e) {
        return <div>Error loading document: {String(e)}</div>
    }
}

// Small client wrapper to handle router


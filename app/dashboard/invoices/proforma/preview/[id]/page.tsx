
import { InvoiceData } from '@/lib/invoice-engine/types'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InvoicePreviewWrapper } from '@/components/invoice-engine/invoice-preview-wrapper'

interface PageProps {
    params: {
        id: string
    }
}

// Function to map DB data to InvoiceData prop
async function getProformaData(id: string): Promise<InvoiceData> {
    const supabase = await createClient()
    const { data: q, error } = await supabase
        .from('quotations')
        .select(`*, items:quotation_items(*)`)
        .eq('id', id)
        .single()

    if (error || !q) throw new Error('Document not found')

    // Also fetch company profile for logo/address (User Profile or Settings table)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('users_profile').select('*').eq('id', user?.id).single()

    // Map to InvoiceData
    return {
        id: q.id,
        documentTitle: q.type === 'proforma' ? 'Proforma Invoice' : 'Estimate / Quotation',
        documentNumber: q.quotation_number,
        date: new Date(q.date).toLocaleDateString('en-IN'),
        dueDate: q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-IN') : undefined,

        company: {
            name: profile?.business_name || 'My Business',
            address: profile?.address || 'Business Address',
            phone: profile?.phone_number || '',
            email: profile?.email || user?.email,
            gstin: profile?.gstin || '',
            // logoUrl: profile?.logo_url --- assume none for now or hook up later
        },
        billTo: {
            name: q.party_name || 'Cash Sale',
            address: 'Address Line 1\nCity, State', // Needs Party Table fetch ideally
            // We only stored party_name in basic schema. In real app, fetch Party details by party_id
        },
        items: q.items.map((i: any, idx: number) => ({
            id: i.id,
            name: i.description, // using description as name for now based on schema
            quantity: Number(i.quantity),
            unit: 'PCS', // Schema doesn't have unit yet, default/mock
            rate: Number(i.unit_price),
            tax_amount: Number(i.tax_amount),
            gst_rate: Number(i.gst_rate),
            amount: Number(i.total_amount),
            hsn: '8471' // Mock
        })),
        subTotal: Number(q.subtotal),
        discountTotal: Number(q.discount_amount),
        taxTotal: Number(q.total_gst),
        grandTotal: Number(q.grand_total),
        notes: q.notes,
        showGstColumns: true,
        amountInWords: 'Twenty Five Thousand Rupees only', // Mock for demo, use number-to-words lib later
    }
}

export default async function PreviewPage({ params }: PageProps) {
    try {
        const data = await getProformaData(params.id)

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


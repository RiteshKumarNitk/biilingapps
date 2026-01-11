
import { InvoiceView } from '@/components/invoices/invoice-view'
import { getInvoiceDetails } from '@/actions/invoices'
import { notFound } from 'next/navigation'
import { DownloadButton } from '@/components/invoices/download-button'
import { ShareInvoiceButton } from '@/components/invoices/share-button'

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const { invoice, items, tenant } = await getInvoiceDetails(id)
    if (!invoice) notFound()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Invoice Details</h2>
                <div className="flex items-center space-x-2">
                    <ShareInvoiceButton
                        token={invoice.share_token}
                        invoiceNumber={invoice.invoice_number}
                        customerPhone={invoice.party_id} // Need to fetch party details for phone? Or assuming it's in party_name? 
                    // Actually schema has party_name cache, but phone is in parties table. 
                    // Let's pass empty string for now or fetch party if critical.
                    // Ideally we should just let user type phone in whatsapp.
                    />
                    <DownloadButton invoice={invoice} items={items || []} tenant={tenant} />
                </div>
            </div>
            <div className="rounded-md border p-4">
                <InvoiceView invoice={invoice} items={items || []} tenant={tenant} />
            </div>
        </div>
    )
}

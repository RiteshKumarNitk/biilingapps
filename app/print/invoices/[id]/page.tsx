
import { getInvoiceDetails } from '@/actions/invoices'
import { PrintableInvoice } from '@/components/invoices/printable-invoice'
import { notFound } from 'next/navigation'

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params as per Next.js 15+ requirements if applicable, or standard if <15
    // Assuming Next.js 14/15 where params is a promise in some configs or just props.
    // Safe to await if it's a promise, or just access if not.
    // Actually in Next 15 params is async.
    const { id } = await params

    try {
        const { invoice, items, tenant } = await getInvoiceDetails(id)

        if (!invoice) {
            return notFound()
        }

        return (
            <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:py-0">
                <PrintableInvoice
                    invoice={invoice}
                    items={items || []}
                    tenant={tenant}
                />
            </div>
        )
    } catch (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Invoice</h1>
                    <p className="text-slate-600">{(error as Error).message}</p>
                </div>
            </div>
        )
    }
}

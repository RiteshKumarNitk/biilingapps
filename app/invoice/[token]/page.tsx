
import { getPublicInvoice } from '@/actions/public/invoice'
import { InvoiceView } from '@/components/invoices/invoice-view'
import { notFound } from 'next/navigation'
import { DownloadButton } from '@/components/invoices/download-button'

export default async function PublicInvoicePage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params;
    const data = await getPublicInvoice(token)

    if (!data || !data.invoice) {
        notFound()
    }

    const { invoice, items, tenant } = data

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="container mx-auto max-w-4xl px-4 space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-primary">Invoice Shared</h1>
                        <p className="text-sm text-muted-foreground">You are viewing a shared invoice from {tenant.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <DownloadButton invoice={invoice} items={items} tenant={tenant} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded shadow-lg">
                    <InvoiceView invoice={invoice} items={items} tenant={tenant} />
                </div>

                <div className="text-center text-sm text-muted-foreground mt-8">
                    Powered by Vyapar App Clone
                </div>
            </div>
        </div>
    )
}


import { InvoiceForm } from '@/components/invoices/invoice-form'

export default function CreateInvoicePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
            </div>
            <div className="rounded-md border p-4">
                <InvoiceForm />
            </div>
        </div>
    )
}

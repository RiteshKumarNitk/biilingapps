
import { QuotationForm } from '@/components/quotations/quotation-form'
import { createClient } from '@/utils/supabase/server'

export default async function CreateQuotationPage() {
    // Fetch products and parties to pass to form
    const supabase = await createClient()
    const { data: products } = await supabase.from('products').select('*')
    const { data: parties } = await supabase.from('parties').select('*')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Quotation</h2>
            </div>
            <div className="grid gap-4">
                <QuotationForm products={products || []} parties={parties || []} />
            </div>
        </div>
    )
}

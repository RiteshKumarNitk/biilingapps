
import { PartyForm } from '@/components/parties/party-form'
import { getParty } from '@/actions/parties'
import { notFound } from 'next/navigation'

interface EditPartyPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditPartyPage({ params }: EditPartyPageProps) {
    const { id } = await params
    const party = await getParty(id)

    if (!party) {
        notFound()
    }

    // PartyForm's fields are snake_case; the Prisma row is camelCase.
    const initialData = {
        name: party.name,
        gstin: party.gstin || undefined,
        phone: party.phone || undefined,
        gst_type: party.gstType || undefined,
        state: party.state || undefined,
        email: party.email || undefined,
        billing_address: party.address || undefined,
        shipping_address: party.shippingAddress || undefined,
        opening_balance: party.openingBalance,
        balance_type: party.type === 'supplier' ? 'to_pay' as const : 'to_receive' as const,
        as_of_date: party.asOfDate || undefined,
        credit_limit: party.creditLimit || undefined,
        description: party.description || undefined,
        city: party.city || undefined,
        pincode: party.pincode || undefined,
        pan_number: party.panNumber || undefined,
        bank_details: party.bankDetails || undefined,
        terms: party.terms || undefined,
    }

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 min-h-screen bg-slate-50">
            <PartyForm initialData={initialData} partyId={id} />
        </div>
    )
}

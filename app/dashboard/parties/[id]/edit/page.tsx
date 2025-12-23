
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

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 min-h-screen bg-slate-50">
            <PartyForm initialData={party} partyId={id} />
        </div>
    )
}

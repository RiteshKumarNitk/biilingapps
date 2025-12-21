
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getParties, getPartyLedger } from '@/actions/parties'
import { PartyList } from '@/components/parties/party-list'
import { PartyDetails } from '@/components/parties/party-details'
import { Button } from '@/components/ui/button'
import { Plus, Settings, MoreVertical, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ModernLoader } from '@/components/ui/modern-loader'

export default function PartiesPage() {
    // Data
    const [parties, setParties] = useState<any[]>([])
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
    const [ledger, setLedger] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Load Parties Initial
    useEffect(() => {
        loadParties()
    }, [])

    // Load Ledger when party selected
    useEffect(() => {
        if (selectedPartyId) {
            loadLedger(selectedPartyId)
        } else {
            setLedger([])
        }
    }, [selectedPartyId])

    const loadParties = async () => {
        try {
            const data = await getParties()
            setParties(data || [])
            if (data && data.length > 0 && !selectedPartyId) {
                // Auto select first
                setSelectedPartyId(data[0].id)
            }
        } catch (error) {
            toast.error("Failed to load parties")
        } finally {
            setLoading(false)
        }
    }

    const loadLedger = async (id: string) => {
        try {
            const data = await getPartyLedger(id)
            setLedger(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load transactions")
        }
    }

    const selectedParty = parties.find(p => p.id === selectedPartyId)

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F7FA]">
            {/* 2. SUB HEADER - PAGE TITLE & LOCAL ACTIONS */}
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <h1 className="text-xl font-bold text-slate-800">Parties</h1>
                    <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/dashboard/parties/new">
                        <Button size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-semibold h-8 rounded-md px-3">
                            <Plus className="h-4 w-4 mr-1" /> Add Party
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* 3. MAIN CONTENT - SPLIT VIEW */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <ModernLoader text="Loading Parties..." />
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: LIST */}
                    <aside className="w-[320px] flex-none z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                        <PartyList
                            parties={parties}
                            selectedId={selectedPartyId}
                            onSelect={setSelectedPartyId}
                        />
                    </aside>

                    {/* RIGHT: DETAILS */}
                    <main className="flex-1 min-w-0 bg-slate-50/50">
                        <PartyDetails
                            party={selectedParty}
                            ledger={ledger}
                        />
                    </main>
                </div>
            )}
        </div>
    )
}

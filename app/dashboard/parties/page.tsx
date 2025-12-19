
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
            {/* 1. TOP HEADER - GLOBAL */}
            <header className="bg-white border-b px-4 h-14 flex items-center justify-between shadow-sm z-20 shrink-0">
                {/* Left: Search Global */}
                <div className="w-1/3 max-w-sm relative">
                    <span className="text-slate-400 absolute left-3 top-2 text-xs">🔍</span>
                    <input
                        placeholder="Search Transactions (Ctrl + F)"
                        className="w-full pl-8 pr-4 py-1.5 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices/new">
                        <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold h-9 rounded-full px-5 shadow-sm">
                            <Plus className="h-4 w-4 mr-1" /> Add Sale
                        </Button>
                    </Link>
                    <Link href="/dashboard/purchase/bills/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-full px-5 shadow-sm">
                            <Plus className="h-4 w-4 mr-1" /> Add Purchase
                        </Button>
                    </Link>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </header>

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


"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getParties, getPartyLedger } from '@/actions/parties'
import { PartyList } from '@/components/parties/party-list'
import { PartyDetails } from '@/components/parties/party-details'
import { Button } from '@/components/ui/button'
import { Plus, Settings, MoreVertical, ChevronDown, RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ModernLoader } from '@/components/ui/modern-loader'
import { exportToExcel } from '@/utils/export'
import { ImportPartiesDialog } from '@/components/parties/import-parties-dialog'

export default function PartiesPage() {
    // Data
    const [parties, setParties] = useState<any[]>([])
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
    const [ledger, setLedger] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [ledgerLoading, setLedgerLoading] = useState(false)

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

    const handleExport = () => {
        if (!parties.length) {
            toast.error("No parties to export")
            return
        }

        const data = parties.map(p => ({
            "Party ID": p.id,
            "Party Name": p.name,
            "Type": p.type,
            "Phone": p.phone || '',
            "Email": p.email || '',
            "GSTIN": p.gstin || '',
            "GST Type": p.gst_type || '',
            "Opening Balance": p.opening_balance || 0,
            "As of Date": p.as_of_date || '',
            "Current Balance": p.current_balance || p.balance || 0,
            "Credit Limit": p.credit_limit || 0,
            "Billing Address": p.billing_address || '',
            "Shipping Address": p.shipping_address || '',
            "Address": p.address || '',
            "State": p.state || '',
            "Description": p.description || ''
        }))

        exportToExcel(data, "Parties_Detailed_Report")
        toast.success("Exported successfully")
    }

    const loadParties = async () => {
        try {
            const data = await getParties(undefined, '', Date.now())
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
        setLedgerLoading(true)
        try {
            const data = await getPartyLedger(id)
            setLedger(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load transactions")
        } finally {
            setLedgerLoading(false)
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
                    <ImportPartiesDialog onImportSuccess={loadParties} />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 hidden sm:flex"
                        onClick={handleExport}
                        disabled={loading || parties.length === 0}
                    >
                        <Download className="h-4 w-4" /> Export Excel
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                        onClick={loadParties}
                        title="Refresh List"
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <Link href="/dashboard/parties/new">
                        <Button size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-semibold h-8 rounded-md px-3">
                            <Plus className="h-4 w-4 mr-1" /> Add Party
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600"
                        title="Force Recalculate All Balances"
                        onClick={async () => {
                            if (!confirm("This will recalculate balances for ALL parties. Continue?")) return;
                            const toastId = toast.loading("Recalculating all party balances...");
                            try {
                                const { recalculateAllParties } = await import('@/actions/parties');
                                await recalculateAllParties();
                                await loadParties();
                                toast.success("All balances updated!", { id: toastId });
                            } catch (e: any) {
                                toast.error("Failed: " + e.message, { id: toastId });
                            }
                        }}
                    >
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
                            isLoading={ledgerLoading}
                            onUpdate={loadParties}
                        />
                    </main>
                </div>
            )}
        </div>
    )
}

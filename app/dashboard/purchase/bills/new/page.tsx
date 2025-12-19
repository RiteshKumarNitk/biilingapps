
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Save, Share2, Settings, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionItem, STATES } from '@/components/transactions/shared'
import { getProducts } from '@/actions/inventory'
import { getParties } from '@/actions/parties'
import { createPurchaseBill } from '@/actions/purchase'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { ModernLoader, FullPageLoader } from '@/components/ui/modern-loader'

export default function AddPurchasePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Data
    const [products, setProducts] = useState<any[]>([])
    const [parties, setParties] = useState<any[]>([])

    // Form
    const [billNumber, setBillNumber] = useState('')
    const [billDate, setBillDate] = useState<Date>(new Date())
    const [stateOfSupply, setStateOfSupply] = useState('Karnataka')

    // Party
    const [selectedPartyId, setSelectedPartyId] = useState<string>('')
    const [partyName, setPartyName] = useState('')
    const [partyBalance, setPartyBalance] = useState(0) // Mock balance
    const [phoneNumber, setPhoneNumber] = useState('')

    // Items
    const [items, setItems] = useState<TransactionItem[]>([
        { rowId: '1', productId: '', description: '', quantity: 1, unit: 'PCS', price: 0, taxType: 'exclusive', discountValue: 0, discountType: 'percentage', gstRate: 0, taxAmount: 0, amount: 0 }
    ])

    // Payment
    const [paymentType, setPaymentType] = useState('cash')
    const [paidAmount, setPaidAmount] = useState(0)
    const [roundOff, setRoundOff] = useState(0)

    // Derived
    const itemsTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
    const grandTotal = Math.round((itemsTotal + roundOff) * 100) / 100
    const balancePayable = Math.max(0, grandTotal - paidAmount)

    useEffect(() => {
        const load = async () => {
            try {
                const [pData, partyData] = await Promise.all([
                    getProducts(1, 1000),
                    getParties('supplier') // Fetch suppliers
                ])
                setProducts(pData.data || [])
                setParties(partyData || [])
            } catch (e) {
                toast.error("Failed to load data")
            } finally {
                setInitialLoading(false)
            }
        }
        load()
    }, [])

    const handlePartySelect = (id: string) => {
        const party = parties.find(p => p.id === id)
        if (party) {
            setSelectedPartyId(id)
            setPartyName(party.name)
            setPhoneNumber(party.phone || '')
            setPartyBalance(party.current_balance || 0)
        }
    }

    const handleSave = async () => {
        if (!selectedPartyId || !billNumber) {
            toast.error("Please fill Party and Bill Number")
            return
        }

        if (items.length === 0 || !items[0].productId) {
            toast.error("Add at least one item")
            return
        }

        try {
            setLoading(true)
            await createPurchaseBill({
                bill_number: billNumber,
                party_id: selectedPartyId,
                party_name: partyName,
                date: billDate,
                grand_total: grandTotal,
                items: items.map(item => ({
                    product_id: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_amount: item.amount
                })),
                payment_status: balancePayable <= 0 ? 'paid' : 'unpaid'
            })
            toast.success("Purchase Bill Saved")
            router.push('/dashboard/purchase/bills')
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F7FA]">
            {/* 1. TOP HEADER (PURCHASE) */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Purchase</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Bill #</span>
                        <Input
                            value={billNumber}
                            onChange={(e) => setBillNumber(e.target.value)}
                            placeholder="Enter Bill No"
                            className="h-8 w-32 border-slate-300 font-semibold text-slate-700"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 w-[140px] justify-start text-left font-normal border-slate-300">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(billDate, "dd/MM/yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={billDate} onSelect={(d) => d && setBillDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>

                    <Select value={stateOfSupply} onValueChange={setStateOfSupply}>
                        <SelectTrigger className="h-8 w-[160px] border-slate-300 text-xs">
                            <SelectValue placeholder="State of Supply" />
                        </SelectTrigger>
                        <SelectContent className="h-60">
                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* 2. PARTY DETAILS */}
                <Card className="p-4 border shadow-sm rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Party Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Party (Supplier)</label>
                                <Button variant="link" className="h-auto p-0 text-blue-600 text-xs">+ Add Party</Button>
                            </div>

                            <Select value={selectedPartyId} onValueChange={handlePartySelect}>
                                <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                    <SelectValue placeholder="Search Supplier..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {parties.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedPartyId && (
                                <div className="text-xs text-slate-500 font-medium pl-1">
                                    Current Balance: <span className={cn("font-bold", partyBalance < 0 ? "text-red-500" : "text-green-500")}>
                                        ₹ {Math.abs(partyBalance).toFixed(2)} {partyBalance < 0 ? 'Payable' : 'Receivable'}
                                    </span>
                                </div>
                            )}

                            <Input
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                className="bg-slate-50 border-slate-200 h-9"
                            />
                        </div>

                        {/* Right side info (Bill details sync) */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded border border-slate-200 text-sm md:block hidden">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bill No:</span>
                                <span className="font-semibold">{billNumber || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Bill Date:</span>
                                <span className="font-semibold">{format(billDate, "dd MMM yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">State:</span>
                                <span className="font-semibold">{stateOfSupply}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. ITEM TABLE */}
                <div className="min-h-[300px]">
                    <TransactionTable items={items} setItems={setItems} products={products} />
                </div>

                {/* 4. TOTAL SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-20">
                    <div className="md:col-span-6 space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload className="h-8 w-8 mb-2" />
                            <span className="text-sm font-medium">Upload Bill (Scan / PDF)</span>
                        </div>
                    </div>

                    <div className="md:col-span-6 bg-white rounded-lg border shadow-sm p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">{itemsTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Round Off</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={roundOff}
                                    onChange={e => setRoundOff(parseFloat(e.target.value) || 0)}
                                    className="h-6 w-16 text-right text-xs"
                                />
                            </div>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Grand Total</span>
                            <span className="text-lg font-bold text-slate-800">₹ {grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-slate-50 p-3 rounded border space-y-3 mt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase text-slate-500">Paid Amount</label>
                                <div className="flex items-center gap-2">
                                    <Select value={paymentType} onValueChange={setPaymentType}>
                                        <SelectTrigger className="h-7 w-24 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <Input
                                    type="number"
                                    value={paidAmount}
                                    onChange={e => setPaidAmount(parseFloat(e.target.value))}
                                    className="h-10 text-right font-bold text-blue-600"
                                />
                            </div>
                            <div className="flex justify-between text-xs pt-1">
                                <span className="text-slate-500">Balance Payable</span>
                                <span className={cn("font-bold", balancePayable > 0 ? "text-red-500" : "text-green-500")}>
                                    ₹ {balancePayable.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FOOTER */}
            <footer className="bg-white border-t p-3 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                    {/* Any left actions */}
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" className="h-11">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button onClick={handleSave} disabled={loading} size="lg" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-200">
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </footer>
        </div>
    )
}

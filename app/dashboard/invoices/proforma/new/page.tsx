
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Save, Share2, Settings, Plus, Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionItem, STATES } from '@/components/transactions/shared'
import { getProducts } from '@/actions/inventory'
import { getParties } from '@/actions/parties'
import { createQuotation } from '@/actions/quotations' // Using quotation action with type='proforma'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { ModernLoader, FullPageLoader } from '@/components/ui/modern-loader'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function AddProformaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Data Lists
    const [products, setProducts] = useState<any[]>([])
    const [parties, setParties] = useState<any[]>([])

    // Form State
    const [quotationNumber, setQuotationNumber] = useState(`PROF-${Math.floor(Math.random() * 10000)}`) // Mock autogen
    const [date, setDate] = useState<Date>(new Date())
    const [validUntil, setValidUntil] = useState<Date | undefined>(undefined)
    const [stateOfSupply, setStateOfSupply] = useState('Karnataka') // Default

    // Party Details
    const [selectedPartyId, setSelectedPartyId] = useState<string>('')
    const [billingName, setBillingName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')

    // Items
    const [items, setItems] = useState<TransactionItem[]>([
        {
            rowId: '1',
            productId: '',
            description: '',
            quantity: 1,
            unit: 'PCS',
            price: 0,
            taxType: 'exclusive',
            discountValue: 0,
            discountType: 'percentage',
            gstRate: 0,
            taxAmount: 0,
            amount: 0
        }
    ])

    // Calculations
    const [roundOff, setRoundOff] = useState(0)

    // Derived Totals
    const itemsTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
    const totalTax = items.reduce((acc, item) => acc + (item.taxAmount || 0), 0)
    const grandTotal = Math.round((itemsTotal + roundOff) * 100) / 100

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [pData, partyData] = await Promise.all([
                    getProducts(1, 1000),
                    getParties('customer')
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

    // Handle Party Selection
    const handlePartySelect = (id: string) => {
        const party = parties.find(p => p.id === id)
        if (party) {
            setSelectedPartyId(id)
            setBillingName(party.name)
            setPhoneNumber(party.phone || '')
            setBillingAddress(party.address || '')
            setShippingAddress(party.address || '') // Default to same
        }
    }

    // Submit
    const handleSave = async () => {
        if (!selectedPartyId) {
            toast.error("Please select a party")
            return
        }

        if (items.length === 0 || !items[0].productId) {
            toast.error("Please add at least one item")
            return
        }

        try {
            setLoading(true)

            const payload: any = {
                quotation_number: quotationNumber,
                date: date,
                valid_until: validUntil,
                party_id: selectedPartyId,
                party_name: billingName,
                subtotal: itemsTotal - totalTax, // Approx
                total_gst: totalTax,
                discount_amount: items.reduce((acc, i) => acc + (i.discountValue || 0), 0), // Basic sum
                grand_total: grandTotal,
                notes: "", // Add notes field if needed, currently reusing 'Private Note' placeholder 
                type: 'proforma', // CRITICAL
                items: items.map(item => ({
                    product_id: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.price,
                    gst_rate: item.gstRate,
                    tax_amount: item.taxAmount,
                    total_amount: item.amount
                }))
            }

            await createQuotation(payload)
            toast.success("Proforma Invoice Saved!")
            router.push('/dashboard/invoices/proforma')

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
            {/* 1. TOP HEADER */}
            <header className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Proforma Invoice</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Ref No.</span>
                        <Input
                            value={quotationNumber}
                            onChange={(e) => setQuotationNumber(e.target.value)}
                            className="h-8 w-32 border-slate-300 font-semibold text-slate-700 bg-slate-50"
                            readOnly
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 w-[140px] justify-start text-left font-normal border-slate-300">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "dd/MM/yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
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
                        {/* Billing Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Party <span className="text-red-500">*</span></label>
                                <Button variant="link" className="h-auto p-0 text-blue-600 text-xs">+ Add Party</Button>
                            </div>

                            <div className="relative">
                                <Select value={selectedPartyId} onValueChange={handlePartySelect}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                        <SelectValue placeholder="Search Party Name..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Input
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="bg-slate-50 border-slate-200 h-9"
                                />
                            </div>

                            <Textarea
                                placeholder="Billing Address"
                                value={billingAddress}
                                onChange={e => setBillingAddress(e.target.value)}
                                className="min-h-[60px] bg-slate-50 border-slate-200 text-xs resize-none"
                            />
                        </div>

                        {/* Shipping Details */}
                        <div className="space-y-3 relative">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Ship To</label>
                                <div className="flex items-center gap-2">
                                    <Switch id="same-addr" onCheckedChange={(c) => { if (c) setShippingAddress(billingAddress) }} />
                                    <label htmlFor="same-addr" className="text-xs text-slate-500 cursor-pointer">Same as billing</label>
                                </div>
                            </div>
                            <Textarea
                                placeholder="Shipping Address"
                                value={shippingAddress}
                                onChange={e => setShippingAddress(e.target.value)}
                                className="min-h-[100px] bg-slate-50 border-slate-200 text-xs resize-none"
                            />
                        </div>
                    </div>
                </Card>

                {/* 3. ITEM TABLE */}
                <div className="min-h-[300px]">
                    <TransactionTable
                        items={items}
                        setItems={setItems}
                        products={products}
                    />
                </div>

                {/* 4. BOTTOM SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-20">
                    <div className="md:col-span-6 space-y-4">
                        {/* Left Side: Descriptions & Images */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600">Add Description</label>
                            <Textarea placeholder="Add a note for this proforma invoice..." className="h-20 text-xs bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="bg-white text-slate-600 text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Add Image
                            </Button>
                        </div>
                    </div>

                    <div className="md:col-span-6 bg-white rounded-lg border shadow-sm p-4 space-y-3">
                        {/* Totals */}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">{itemsTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                                <input type="checkbox" className="rounded border-slate-300" />
                                Round Off
                            </span>
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
                            <span className="text-lg font-bold text-slate-800">Total Amount</span>
                            <span className="text-lg font-bold text-slate-800">₹ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FIXED FOOTER */}
            <footer className="bg-white border-t p-3 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    {/* Empty left side */}
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="h-11">
                                <Printer className="h-4 w-4 mr-2" /> Print <span className="ml-2 text-xs">▼</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Print A4</DropdownMenuItem>
                            <DropdownMenuItem>Print A5</DropdownMenuItem>
                            <DropdownMenuItem>Print Thermal</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="lg" className="h-11">
                        <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>

                    <Button onClick={handleSave} disabled={loading} size="lg" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-200">
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </footer>
        </div>
    )
}

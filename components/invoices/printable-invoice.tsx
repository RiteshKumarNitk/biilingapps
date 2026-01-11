'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toWords } from 'number-to-words'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrintableInvoiceProps {
    invoice: any
    items: any[]
    tenant: any
}

type Theme = 'classic' | 'tally' | 'gst' | 'minimal'

const THEMES: Record<Theme, {
    name: string;
    colors: {
        header: string;
        headerText: string;
        border: string;
        accent: string;
        tableHeader: string;
        tableHeaderText: string;
    };
    styles: {
        font: string;
        borderStyle: string;
        tableBorder: string;
        uppercaseHeader: boolean;
        compact: boolean;
    }
}> = {
    classic: {
        name: 'Classic',
        colors: {
            header: 'bg-white',
            headerText: 'text-slate-900',
            border: 'border-slate-300',
            accent: 'text-blue-600',
            tableHeader: 'bg-slate-800',
            tableHeaderText: 'text-white'
        },
        styles: {
            font: 'font-sans',
            borderStyle: 'border',
            tableBorder: 'border',
            uppercaseHeader: true,
            compact: false
        }
    },
    tally: {
        name: 'Tally Theme',
        colors: {
            header: 'bg-yellow-50',
            headerText: 'text-black',
            border: 'border-black',
            accent: 'text-black',
            tableHeader: 'bg-transparent border-y-2 border-black',
            tableHeaderText: 'text-black font-bold'
        },
        styles: {
            font: 'font-mono',
            borderStyle: 'border-2',
            tableBorder: 'border-r border-black',
            uppercaseHeader: true,
            compact: true
        }
    },
    gst: {
        name: 'GST Theme',
        colors: {
            header: 'bg-blue-50',
            headerText: 'text-blue-900',
            border: 'border-blue-200',
            accent: 'text-blue-700',
            tableHeader: 'bg-blue-600',
            tableHeaderText: 'text-white'
        },
        styles: {
            font: 'font-sans',
            borderStyle: 'border',
            tableBorder: 'border-blue-200',
            uppercaseHeader: true,
            compact: false
        }
    },
    minimal: {
        name: 'Minimal',
        colors: {
            header: 'bg-white',
            headerText: 'text-black',
            border: 'border-gray-200',
            accent: 'text-black',
            tableHeader: 'bg-gray-100',
            tableHeaderText: 'text-black'
        },
        styles: {
            font: 'font-sans',
            borderStyle: 'border-0 border-b',
            tableBorder: 'border-0 border-b border-gray-100',
            uppercaseHeader: false,
            compact: false
        }
    }
}

export function PrintableInvoice({ invoice, items, tenant }: PrintableInvoiceProps) {
    const [theme, setTheme] = useState<Theme>('classic')
    const [isPreviewMode, setIsPreviewMode] = useState(false)

    // Removed auto-print to allow user to see preview first

    const handlePrint = () => {
        window.print()
    }

    const currentTheme = THEMES[theme]

    const calculatedSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const calculatedDiscount = items.reduce((acc, item) => acc + (item.discount || 0), 0)
    const calculatedTax = items.reduce((acc, item) => acc + (item.tax_amount || 0), 0)

    const grandTotal = invoice.grand_total || 0
    const amountInWords = toWords(grandTotal).toUpperCase()

    // Derived classes based on theme
    const containerClasses = cn(
        "max-w-[210mm] mx-auto min-h-[297mm] p-8 box-border relative print:p-0 print:w-full print:max-w-none print:min-h-0 bg-white shadow-lg print:shadow-none",
        currentTheme.styles.font,
        theme === 'tally' ? 'text-sm' : 'text-sm'
    )

    // Borders
    const boxBorder = cn(currentTheme.styles.borderStyle, currentTheme.colors.border)
    const tableHeaderClass = cn(
        currentTheme.colors.tableHeader,
        currentTheme.colors.tableHeaderText,
        "text-xs tracking-wider",
        currentTheme.styles.uppercaseHeader ? "uppercase" : ""
    )

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white pb-10 print:pb-0">
            {/* Toolbar - Hidden in Print */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm p-4 print:hidden mb-8">
                <div className="max-w-[210mm] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-slate-700">Print Preview</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Theme:</span>
                            <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue placeholder="Select Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(THEMES) as Theme[]).map((t) => (
                                        <SelectItem key={t} value={t}>{THEMES[t].name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
                            <Maximize2 className="h-4 w-4 mr-2" /> {isPreviewMode ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                            <Printer className="w-4 h-4 mr-2" /> Print Invoice
                        </Button>
                    </div>
                </div>
            </div>

            {/* Invoice Page */}
            <div className={cn(
                "transition-all duration-300 ease-in-out print:transform-none flex justify-center",
                isPreviewMode ? "scale-100" : ""
            )}>
                <div id="invoice-content" className={containerClasses}>
                    <style jsx global>{`
                        @media print {
                            @page {
                                size: A4;
                                margin: 0; 
                            }
                            body {
                                print-color-adjust: exact;
                                -webkit-print-color-adjust: exact;
                                background: white;
                                margin: 0;
                                padding: 0.5cm; 
                            }
                            .no-print {
                                display: none !important;
                            }
                            /* Hide everything else */
                            nav, header, footer, .sidebar, .toolbar { 
                                display: none !important; 
                            }
                        }
                    `}</style>

                    {/* 1. Header Section */}
                    <div className={cn("mb-6 relative", theme === 'minimal' ? "border-b pb-4" : "")}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className={cn("text-2xl font-bold mb-2", currentTheme.colors.headerText)}>{tenant.name}</h1>
                                <div className="text-slate-600 space-y-1 text-sm">
                                    <p className="whitespace-pre-line text-slate-700 font-medium">{tenant.address}</p>
                                    <div className="flex gap-4 mt-2">
                                        {tenant.email && <p>Email: {tenant.email}</p>}
                                        {tenant.phone && <p>Ph: {tenant.phone}</p>}
                                    </div>
                                    {tenant.gstin && <p>GSTIN: <span className="font-semibold text-slate-900">{tenant.gstin}</span></p>}
                                </div>
                            </div>

                            {/* Logo Box */}
                            {tenant.logo_url && (
                                <div className={cn(
                                    "relative h-20 w-20 flex items-center justify-center overflow-hidden",
                                    theme === 'tally' ? "border border-black" : "rounded-md"
                                )}>
                                    <Image src={tenant.logo_url} alt="Logo" fill className="object-contain" />
                                </div>
                            )}
                        </div>

                        {theme !== 'minimal' && <div className={cn("h-px w-full my-4", theme === 'tally' ? "bg-black" : "bg-slate-300")}></div>}

                        <div className="text-center">
                            <h2 className={cn("text-xl font-bold uppercase tracking-widest decoration-slate-400 underline-offset-4", currentTheme.colors.accent, theme === 'classic' ? "underline" : "")}>
                                Tax Invoice
                            </h2>
                        </div>
                    </div>

                    {/* 2. Invoice Info */}
                    <div className={cn("flex flex-col md:flex-row gap-0 mb-6", boxBorder)}>
                        {/* Left: Bill To */}
                        <div className={cn("flex-1 p-4 border-b md:border-b-0 md:border-r", currentTheme.colors.border)}>
                            <h3 className={cn("text-xs font-bold uppercase mb-3", currentTheme.colors.accent)}>Bill To</h3>
                            <p className="font-bold text-base mb-1">{invoice.party_name}</p>
                            {invoice.party_address && <p className="text-sm text-slate-600 whitespace-pre-line mb-2">{invoice.party_address}</p>}
                            <div className="space-y-1 text-sm">
                                {invoice.party_phone && <p>Ph: {invoice.party_phone}</p>}
                                {invoice.party_gstin && <p>GSTIN: <span className="font-semibold">{invoice.party_gstin}</span></p>}
                            </div>
                        </div>

                        {/* Middle: Ship To (Optional) */}
                        {invoice.shipping_address && (
                            <div className={cn("flex-1 p-4 border-b md:border-b-0 md:border-r", currentTheme.colors.border)}>
                                <h3 className={cn("text-xs font-bold uppercase mb-3", currentTheme.colors.accent)}>Ship To</h3>
                                <p className="font-bold text-base mb-1">{invoice.party_name}</p>
                                <p className="text-sm text-slate-600 whitespace-pre-line mb-2">{invoice.shipping_address}</p>
                            </div>
                        )}

                        {/* Right: Invoice Details */}
                        <div className="flex-1 p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Invoice No.</p>
                                <p className="font-bold">{invoice.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Date</p>
                                <p className="font-bold">{format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Place of Supply</p>
                                {/* Fallback if not available */}
                                <p className="font-bold">{invoice.place_of_supply || tenant.state || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Status</p>
                                <span className={cn(
                                    "font-bold text-xs px-2 py-0.5 rounded border inline-block",
                                    invoice.payment_status === 'paid' ? "border-green-600 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"
                                )}>
                                    {invoice.payment_status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Items Table */}
                    <div className="mb-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={tableHeaderClass}>
                                    <th className={cn("p-2 text-center w-12", currentTheme.styles.tableBorder)}>#</th>
                                    <th className={cn("p-2", currentTheme.styles.tableBorder)}>Item Name</th>
                                    <th className={cn("p-2 text-right w-20", currentTheme.styles.tableBorder)}>Qty</th>
                                    <th className={cn("p-2 text-right w-24", currentTheme.styles.tableBorder)}>Rate</th>
                                    <th className={cn("p-2 text-right w-20", currentTheme.styles.tableBorder)}>Disc</th>
                                    <th className={cn("p-2 text-right w-20", currentTheme.styles.tableBorder)}>Tax</th>
                                    <th className={cn("p-2 text-right w-28", theme === 'tally' ? 'border-l border-black' : '')}>Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {items.map((item, index) => (
                                    <tr key={item.id} className={cn(
                                        "border-b",
                                        theme === 'tally' ? "border-black border-dashed" : "border-slate-200"
                                    )}>
                                        <td className={cn("p-2 text-center align-top", theme === 'tally' ? 'border-r border-black' : '')}>{index + 1}</td>
                                        <td className={cn("p-2 align-top", theme === 'tally' ? 'border-r border-black' : '')}>
                                            <p className="font-medium">{item.products?.name || item.description}</p>
                                            {(item.products?.hsn_code) && (
                                                <p className="text-[10px] text-slate-500 mt-0.5">HSN/SAC: {item.products.hsn_code}</p>
                                            )}
                                        </td>
                                        <td className={cn("p-2 text-right align-top", theme === 'tally' ? 'border-r border-black' : '')}>{item.quantity}</td>
                                        <td className={cn("p-2 text-right align-top", theme === 'tally' ? 'border-r border-black' : '')}>₹{item.unit_price}</td>
                                        <td className={cn("p-2 text-right align-top", theme === 'tally' ? 'border-r border-black' : '')}>{item.discount || '-'}</td>
                                        <td className={cn("p-2 text-right align-top", theme === 'tally' ? 'border-r border-black' : '')}>{item.gst_rate ? `${item.gst_rate}%` : '0%'}</td>
                                        <td className="p-2 text-right align-top font-medium">₹{item.total_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 4. Amount Summary */}
                    <div className="flex flex-col items-end mb-8 space-y-2">
                        <div className={cn("w-full md:w-1/2 p-4", theme === 'tally' ? 'border border-black' : 'bg-slate-50 rounded')}>
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium">₹{calculatedSubtotal.toFixed(2)}</span>
                            </div>
                            {calculatedDiscount > 0 && (
                                <div className="flex justify-between mb-2 text-sm text-red-600">
                                    <span className="text-slate-600">Discount</span>
                                    <span className="font-medium">-₹{calculatedDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {calculatedTax > 0 && (
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-slate-600">Tax (GST)</span>
                                    <span className="font-medium">₹{calculatedTax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className={cn(
                                "flex justify-between py-2 border-t mt-2 text-lg font-bold",
                                theme === 'tally' ? 'border-black' : 'border-slate-200 text-slate-800'
                            )}>
                                <span>Total Amount</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-green-700">
                                <span>Received</span>
                                <span>₹{invoice.payment_status === 'paid' ? grandTotal.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-sm text-red-700 font-medium">
                                <span>Balance Due</span>
                                <span>₹{invoice.payment_status === 'paid' ? '0.00' : grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 5. Footer Section */}
                    <div className="mt-auto pt-6 border-t border-slate-300">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase text-slate-500 mb-1">Amount in Words</p>
                                <p className="italic font-medium text-slate-800 mb-6 bg-slate-50 p-2 rounded border border-slate-100">{amountInWords} RUPEES ONLY</p>

                                {invoice.notes && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">Notes</p>
                                        <p className="text-xs text-slate-600 whitespace-pre-line">{invoice.notes}</p>
                                    </div>
                                )}

                                <p className="text-xs font-bold uppercase text-slate-500 mb-2">Terms & Conditions</p>
                                {tenant.settings?.terms ? (
                                    <p className="text-xs text-slate-600 whitespace-pre-line">{tenant.settings.terms}</p>
                                ) : (
                                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                                        <li>Goods once sold will not be taken back.</li>
                                        <li>Interest @ 18% p.a. will be charged if payment is not made within the due date.</li>
                                        <li>Subject to local jurisdiction only.</li>
                                    </ol>
                                )}
                            </div>

                            <div className="text-center min-w-[200px]">
                                <div className="h-20 w-full mb-2 border-b-2 border-slate-300 flex items-end justify-center pb-2">
                                    {/* Digital Signature Placeholder */}
                                </div>
                                <p className="text-xs font-bold uppercase text-slate-700">Authorized Signature</p>
                            </div>
                        </div>

                        <div className="text-center mt-10 text-[10px] text-slate-400">
                            This is a computer generated invoice.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

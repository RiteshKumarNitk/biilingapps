
"use client"

import React, { useState, useEffect } from 'react'
import { InvoiceData } from '@/lib/invoice-engine/types'
import { INVOICE_THEMES } from '@/lib/invoice-engine/theme-registry'
import { InvoiceRenderer } from '@/components/invoice-engine/invoice-renderer'
import { cn } from '@/lib/utils'
import {
    Download,
    Printer,
    Share2,
    X,
    ZoomIn,
    ZoomOut,
    Settings,
    Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion'

interface InvoicePreviewProps {
    data: InvoiceData
    onClose?: () => void
}

export function InvoicePreview({ data, onClose }: InvoicePreviewProps) {
    const [selectedThemeId, setSelectedThemeId] = useState('classic-1')
    const [scale, setScale] = useState(0.8)

    const selectedTheme = INVOICE_THEMES.find(t => t.id === selectedThemeId) || INVOICE_THEMES[0]

    // Group themes
    const themesByGroup = INVOICE_THEMES.reduce((acc, theme) => {
        if (!acc[theme.group]) acc[theme.group] = []
        acc[theme.group].push(theme)
        return acc
    }, {} as Record<string, typeof INVOICE_THEMES>)

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#F5F7FA] flex flex-col h-screen w-screen overflow-hidden">
            {/* TOP BAR */}
            <div className="h-14 bg-white border-b px-4 flex items-center justify-between shrink-0 shadow-sm z-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Preview</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setScale(Math.max(0.4, scale - 0.1))}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs w-12 text-center font-medium">{Math.round(scale * 100)}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Do not show preview again
                        </label>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="ml-2 text-slate-600 border-slate-300 hover:bg-slate-50"
                        >
                            Wait, go back
                        </Button>
                        <Button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Save & Close
                        </Button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT Area (3 Panels) */}
            <div className="flex flex-1 overflow-hidden">

                {/* 1. LEFT PANEL - Theme Selector */}
                <div className="w-[280px] bg-white border-r flex flex-col shrink-0 z-40">
                    <div className="p-4 border-b font-semibold text-slate-700">Select Theme</div>
                    <ScrollArea className="flex-1">
                        <Accordion type="multiple" defaultValue={['Classic', 'Tally', 'GST']} className="p-4 space-y-2">
                            {Object.entries(themesByGroup).map(([group, themes]) => (
                                <AccordionItem key={group} value={group} className="border-none">
                                    <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline text-slate-500 hover:text-slate-800">
                                        {group} Themes
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-2 pl-2 space-y-1">
                                        {themes.map(theme => (
                                            <div
                                                key={theme.id}
                                                onClick={() => setSelectedThemeId(theme.id)}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors border border-transparent",
                                                    selectedThemeId === theme.id
                                                        ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                                        : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                                )}
                                            >
                                                {theme.name}
                                                {selectedThemeId === theme.id && <Check className="h-4 w-4 text-blue-600" />}
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </div>

                {/* 2. CENTER PANEL - Preview */}
                <div className="flex-1 bg-[#E2E8F0] overflow-auto relative flex justify-center p-8 print:p-0 print:bg-white print:overflow-visible">
                    {/* The Invoice Page */}
                    <div className="print:w-full print:h-full print:absolute print:top-0 print:left-0 print:m-0 print:transform-none">
                        <InvoiceRenderer
                            data={data}
                            theme={selectedTheme}
                            scale={scale}
                        />
                    </div>
                </div>

                {/* 3. RIGHT PANEL - Actions */}
                <div className="w-[300px] bg-white border-l flex flex-col shrink-0 z-40">
                    <div className="p-6 space-y-6">
                        {/* Payment Graphic Placeholder */}
                        <div className="bg-blue-50 rounded-xl p-6 text-center shadow-sm border border-blue-100">
                            <h3 className="font-bold text-slate-700 mb-2">Accept Online Payments</h3>
                            <p className="text-xs text-slate-500 mb-4">Allow customers to pay via UPI, Cards & Netbanking directly from invoice.</p>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-full">
                                Setup Payments
                            </Button>
                        </div>

                        {/* Share Actions */}
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-4 text-sm">Share Invoice</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 border-slate-200">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Share2 className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs">WhatsApp</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 border-slate-200">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <Share2 className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs">Email</span>
                                </Button>
                            </div>
                        </div>

                        {/* Primary Buttons */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <Button
                                className="w-full h-11 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                                onClick={handlePrint}
                            >
                                <Printer className="h-4 w-4" /> Print
                            </Button>
                            <Button className="w-full h-11 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    /* Hide everything except center panel content really */
                    /* But typically we just want to print the renderer content */
                    /* The renderer is inside a div. We need to hide all fixed headers/sidebars */
                    .fixed { position: static !important; }
                    .h-screen { height: auto !important; }
                    .overflow-hidden { overflow: visible !important; }
                    /* Hide sidebars and headers specifically */
                    /* We can use a print:hidden utility on them */
                }
             `}</style>
        </div>
    )
}

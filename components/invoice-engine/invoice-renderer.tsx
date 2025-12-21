
import React from 'react'
import { InvoiceData, InvoiceTheme } from '@/lib/invoice-engine/types'
import { cn } from '@/lib/utils'

interface InvoiceRendererProps {
    data: InvoiceData
    theme: InvoiceTheme
    scale?: number
}

/* 
 * This is the Core Invoice Engine.
 * It strictly uses the 'theme' prop to styling itself.
 * It is A4 size fixed (210mm x 297mm).
 */
export function InvoiceRenderer({ data, theme, scale = 1 }: InvoiceRendererProps) {

    // Derived styles based on theme
    const containerStyle = {
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
        fontSize: theme.typography.textSize,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    }

    const borderClass = theme.layout.borderStyle === 'double' ? 'border-4 border-double'
        : theme.layout.borderStyle === 'thick' ? 'border-2'
            : 'border'

    // Tally often uses specific border logic (grid)
    const isGrid = theme.layout.tableStyle === 'grid'

    return (
        <div
            className="bg-white shadow-lg mx-auto origin-top transition-transform duration-200"
            style={{
                width: '210mm',
                minHeight: '297mm', // Only min-height, let it grow if needed, or enforce A4 pagination later
                padding: '10mm',
                transform: `scale(${scale})`,
            }}
        >
            <div
                className={cn("h-full flex flex-col", borderClass)}
                style={{ borderColor: theme.colors.border }}
            >
                {/* --- HEADER --- */}
                <header
                    className={cn(
                        "p-6 flex justify-between items-start border-b",
                        theme.layout.headerStyle === 'centered' && "flex-col items-center text-center",
                        theme.layout.headerStyle === 'left-aligned' && "flex-row",
                    )}
                    style={{ borderColor: theme.colors.border }}
                >
                    <div className="flex flex-col gap-2 max-w-[60%]">
                        {/* Logo */}
                        {data.company.logoUrl ? (
                            <img src={data.company.logoUrl} alt="Logo" className="h-16 object-contain mb-2" />
                        ) : (
                            <div className="h-16 w-16 bg-slate-100 flex items-center justify-center text-xs text-slate-400 mb-2">LOGO</div>
                        )}

                        <h1
                            className="font-bold uppercase tracking-wide leading-tight"
                            style={{ fontSize: theme.typography.headingSize, color: theme.colors.primary }}
                        >
                            {data.company.name}
                        </h1>
                        <div className="text-sm opacity-90 whitespace-pre-line">
                            {data.company.address}
                        </div>
                        {data.company.phone && <div className="text-sm">Phone: {data.company.phone}</div>}
                        {data.company.email && <div className="text-sm">Email: {data.company.email}</div>}
                        {data.company.gstin && <div className="text-sm font-semibold mt-1">GSTIN: {data.company.gstin}</div>}
                    </div>

                    <div className={cn("text-right", theme.layout.headerStyle === 'centered' && "text-center mt-4 w-full")}>
                        <h2
                            className="font-bold uppercase mb-4"
                            style={{ fontSize: '18px', color: theme.colors.secondary }}
                        >
                            {data.documentTitle}
                        </h2>

                        <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm text-left justify-end">
                            <span className="text-slate-500">Number:</span>
                            <span className="font-semibold">{data.documentNumber}</span>

                            <span className="text-slate-500">Date:</span>
                            <span className="font-semibold">{data.date}</span>

                            {data.dueDate && (
                                <>
                                    <span className="text-slate-500">Due Date:</span>
                                    <span className="font-semibold">{data.dueDate}</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- BILL TO / PARTY DETAILS --- */}
                <div
                    className={cn(
                        "grid grid-cols-2",
                        // Usually separated by border
                        theme.layout.borderStyle !== 'none' && "divide-x"
                    )}
                    style={{ borderColor: theme.colors.border }}
                >
                    <div className="p-4">
                        <h3 className="text-xs font-bold uppercase mb-2 tracking-wider text-slate-500">Bill To</h3>
                        <div className="font-bold text-lg mb-1" style={{ color: theme.colors.primary }}>{data.billTo.name}</div>
                        <div className="text-sm whitespace-pre-line mb-2">{data.billTo.address}</div>
                        {data.billTo.gstin && (
                            <div className="text-sm font-medium">GSTIN: {data.billTo.gstin}</div>
                        )}
                        {data.billTo.phone && (
                            <div className="text-sm">Phone: {data.billTo.phone}</div>
                        )}
                    </div>
                    {data.shipTo ? (
                        <div className="p-4">
                            <h3 className="text-xs font-bold uppercase mb-2 tracking-wider text-slate-500">Ship To</h3>
                            <div className="font-bold text-lg mb-1" style={{ color: theme.colors.primary }}>{data.shipTo.name}</div>
                            <div className="text-sm whitespace-pre-line">{data.shipTo.address}</div>
                        </div>
                    ) : (
                        <div className="p-4">
                            {/* Empty or Notes if mostly empty */}
                        </div>
                    )}
                </div>

                {/* --- ITEMS TABLE --- */}
                <div className={cn("flex-1", theme.layout.tableStyle === 'grid' && "border-t border-b")} style={{ borderColor: theme.colors.border }}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: theme.colors.tableHeaderBg, color: theme.colors.tableHeaderText }}>
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>#</th>
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase w-[40%]", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>Item Description</th>
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>HSN</th>
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>Qty</th>
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>Rate</th>
                                {data.showGstColumns && (
                                    <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>GST</th>
                                )}
                                <th className={cn("py-2 px-3 border-y font-semibold text-xs uppercase text-right")} style={{ borderColor: theme.colors.border }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody className={cn("text-sm", theme.layout.tableStyle === 'striped' && "divide-y divide-slate-100")}>
                            {data.items.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className={cn(
                                        theme.layout.tableStyle === 'striped' && idx % 2 === 0 ? "bg-slate-50" : "",
                                        isGrid ? "border-b border-r-0" : "border-b"
                                    )}
                                    style={{ borderColor: theme.colors.border }}
                                >
                                    <td className={cn("py-2 px-3 align-top", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>{idx + 1}</td>
                                    <td className={cn("py-2 px-3 align-top", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>
                                        <div className="font-medium">{item.name}</div>
                                    </td>
                                    <td className={cn("py-2 px-3 align-top text-right text-slate-500", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>{item.hsn || '-'}</td>
                                    <td className={cn("py-2 px-3 align-top text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>{item.quantity} {item.unit}</td>
                                    <td className={cn("py-2 px-3 align-top text-right", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>{item.rate.toFixed(2)}</td>
                                    {data.showGstColumns && (
                                        <td className={cn("py-2 px-3 align-top text-right text-xs", isGrid && "border-r")} style={{ borderColor: theme.colors.border }}>
                                            {item.tax_amount ? (
                                                <>
                                                    <div>₹{item.tax_amount.toFixed(2)}</div>
                                                    <div className="text-[10px] text-slate-500">({item.gst_rate}%)</div>
                                                </>
                                            ) : '-'}
                                        </td>
                                    )}
                                    <td className="py-2 px-3 align-top text-right font-medium">{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                            {/* Empty rows filler if needed for specific print aesthetic? Not for now */}
                        </tbody>
                    </table>
                </div>

                {/* --- FOOTER / TOTALS --- */}
                <div
                    className="flex text-sm border-t"
                    style={{ borderColor: theme.colors.border }}
                >
                    {/* Left: T&C, Bank, Words */}
                    <div className={cn("flex-1 p-4 border-r", !isGrid && "border-r-0")} style={{ borderColor: theme.colors.border }}>
                        <div className="mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount In Words</span>
                            <div className="font-medium italic">{data.amountInWords || 'Zero only'}</div>
                        </div>

                        {data.bankDetails && (
                            <div className="mb-4 text-xs">
                                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Bank Details</span>
                                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                                    <span>Bank:</span> <span className="font-medium">{data.bankDetails.bankName}</span>
                                    <span>A/c No:</span> <span className="font-medium">{data.bankDetails.accountNumber}</span>
                                    <span>IFSC:</span> <span className="font-medium">{data.bankDetails.ifsc}</span>
                                </div>
                            </div>
                        )}

                        {(data.terms || data.notes) && (
                            <div className="text-xs mt-4">
                                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Terms & Conditions</span>
                                <div className="whitespace-pre-line text-slate-600">{data.terms || data.notes}</div>
                            </div>
                        )}
                    </div>

                    {/* Right: Totals */}
                    <div className="w-[35%]">
                        <div className="flex justify-between p-2 border-b" style={{ borderColor: theme.colors.border }}>
                            <span>Sub Total</span>
                            <span>₹ {data.subTotal.toFixed(2)}</span>
                        </div>
                        {data.showGstColumns && (
                            <div className="flex justify-between p-2 border-b text-slate-600 text-xs" style={{ borderColor: theme.colors.border }}>
                                <span>Tax (GST) Total</span>
                                <span>₹ {data.taxTotal.toFixed(2)}</span>
                            </div>
                        )}
                        {data.discountTotal > 0 && (
                            <div className="flex justify-between p-2 border-b text-emerald-600" style={{ borderColor: theme.colors.border }}>
                                <span>Discount</span>
                                <span>- ₹ {data.discountTotal.toFixed(2)}</span>
                            </div>
                        )}
                        {data.roundOff !== undefined && data.roundOff !== 0 && (
                            <div className="flex justify-between p-2 border-b text-xs text-slate-500" style={{ borderColor: theme.colors.border }}>
                                <span>Round Off</span>
                                <span>{data.roundOff > 0 ? '+' : ''} {data.roundOff.toFixed(2)}</span>
                            </div>
                        )}

                        <div
                            className="flex justify-between p-3 font-bold text-lg"
                            style={{ backgroundColor: theme.colors.tableHeaderBg, color: theme.colors.primary }}
                        >
                            <span>Total</span>
                            <span>₹ {data.grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Signature Area */}
                        <div className="p-4 pt-12 text-center">
                            {data.signature?.imageUrl ? (
                                <img src={data.signature.imageUrl} className="h-12 mx-auto mb-2" alt="Signature" />
                            ) : (
                                <div className="h-10"></div>
                            )}
                            <div className="border-t border-slate-300 w-3/4 mx-auto pt-1 text-xs font-medium">
                                {data.signature?.label || 'Authorized Signatory'}
                            </div>
                        </div>
                    </div>
                </div>

                {data.showGstColumns && (
                    <div className="p-4 border-t bg-slate-50/50 text-xs" style={{ borderColor: theme.colors.border }}>
                        <h4 className="font-bold mb-2">Tax Breakdown</h4>
                        {/* Simplified breakdown for visual proof */}
                        <div className="flex gap-4 text-slate-600">
                            <div>Total Taxable: ₹ {data.subTotal.toFixed(2)}</div>
                            <div>Total Tax: ₹ {data.taxTotal.toFixed(2)}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Footer Watermark or Powered By if free */}
            <div className="text-center text-[10px] text-slate-300 mt-2 print:hidden">
                Generated by BiilingApp
            </div>
        </div>
    )
}

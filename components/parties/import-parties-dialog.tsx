
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { exportToExcel } from "@/utils/export"
import { importPartiesBulk } from "@/actions/parties"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ImportPartiesDialog({ onImportSuccess }: { onImportSuccess: () => void }) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            parseFile(selectedFile)
        }
    }

    const parseFile = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet)
                setPreviewData(jsonData)
                setError(null)
            } catch (err) {
                console.error(err)
                setError("Failed to parse Excel file. Please use the template.")
            }
        }
        reader.readAsBinaryString(file)
    }

    const downloadTemplate = () => {
        const template = [
            {
                "Party ID": "For Update Only (Leave blank for new)",
                "Name": "John Doe Enterprises",
                "Phone": "9876543210",
                "Email": "john@example.com",
                "GSTIN": "29ABCDE1234F1Z5",
                "Type": "customer",
                "Opening Balance": 1000,
                "Credit Limit": 50000,
                "Billing Address": "123 Main St, City",
                "Shipping Address": "123 Main St, City",
                "Address": "Full Address",
                "State": "Karnataka",
                "GST Type": "Regular",
                "As of Date": "2024-01-01",
                "Description": "Notes"
            },
            {
                "Name": "Jane supplier",
                "Phone": "9876543211",
                "Type": "supplier",
                "Opening Balance": 0
            }
        ]
        exportToExcel(template, "Import_Parties_Template")
    }

    const handleImport = async () => {
        if (!previewData.length) return
        setLoading(true)
        try {
            // Map keys loosely (User might have 'Party Name' or 'Name')
            const normalizedData = previewData.map((row: any) => ({
                id: row['Party ID'] || row['id'],
                name: row['Name'] || row['Party Name'],
                phone: row['Phone'] ? String(row['Phone']) : undefined,
                email: row['Email'],
                gstin: row['GSTIN'],
                type: (row['Type'] || 'customer').toLowerCase(),
                opening_balance: parseFloat(row['Opening Balance'] || 0),
                credit_limit: parseFloat(row['Credit Limit'] || 0),
                billing_address: row['Billing Address'],
                shipping_address: row['Shipping Address'],
                address: row['Address'], // Generic address field
                state: row['State'],
                gst_type: row['GST Type'] || row['gst_type'],
                as_of_date: row['As of Date'] || row['as_of_date'],
                description: row['Description']
            })).filter(p => p.name) // Filter empty rows

            if (normalizedData.length === 0) {
                throw new Error("No valid data found. 'Name' is required.")
            }

            const result = await importPartiesBulk(normalizedData)

            if (result.success) {
                toast.success(`Imported ${result.count} parties successfully`)
                setOpen(false)
                setFile(null)
                setPreviewData([])
                onImportSuccess()
            } else {
                throw new Error(result.error)
            }
        } catch (err: any) {
            setError(err.message)
            toast.error("Import failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Upload className="h-4 w-4" /> Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Parties</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to bulk add parties. Download the template for the correct format.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download Template
                        </Button>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">Excel File</Label>
                        <Input id="file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {previewData.length > 0 && !error && (
                        <div className="rounded-md border bg-slate-50 p-4">
                            <div className="flex items-center gap-2 mb-2 text-sm text-green-700 font-medium">
                                <FileSpreadsheet className="h-4 w-4" />
                                {previewData.length} records found
                            </div>
                            <div className="max-h-[200px] overflow-auto text-xs">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="font-medium p-1">Name</th>
                                            <th className="font-medium p-1">Phone</th>
                                            <th className="font-medium p-1">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 5).map((row: any, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                <td className="p-1 truncate max-w-[150px]">{row['Name'] || row['Party Name']}</td>
                                                <td className="p-1">{row['Phone']}</td>
                                                <td className="p-1">{row['Type']}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 5 && (
                                    <p className="text-muted-foreground mt-2 italic">...and {previewData.length - 5} more</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || loading || !!error}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Parties
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

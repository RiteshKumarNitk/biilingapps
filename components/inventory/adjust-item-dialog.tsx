
"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Minus, Plus } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { adjustStock } from "@/actions/inventory"
import { toast } from "sonner"

interface AdjustItemDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: any
    onSuccess?: () => void
}

export function AdjustItemDialog({ open, onOpenChange, product, onSuccess }: AdjustItemDialogProps) {
    const [adjustmentType, setAdjustmentType] = useState<"ADD" | "REDUCE">("ADD")
    const [quantity, setQuantity] = useState<string>("")
    const [date, setDate] = useState<Date>(new Date())
    const [remarks, setRemarks] = useState("")
    const [loading, setLoading] = useState(false)

    // Reset when dialog opens/closes or product changes
    useEffect(() => {
        if (open) {
            setQuantity("")
            setRemarks("")
            setDate(new Date())
            setAdjustmentType("ADD")
        }
    }, [open, product])

    if (!product) return null

    const currentStock = product.stock_quantity || 0
    const qtyNum = parseFloat(quantity) || 0
    const newStock = adjustmentType === "ADD"
        ? currentStock + qtyNum
        : currentStock - qtyNum

    const handleSave = async () => {
        if (!qtyNum || qtyNum <= 0) {
            toast.error("Please enter a valid quantity")
            return
        }

        try {
            setLoading(true)
            await adjustStock(
                product.id,
                qtyNum,
                adjustmentType,
                "Manual Adjustment",
                remarks,
                date
            )
            toast.success("Stock adjusted successfully")
            onOpenChange(false)
            if (onSuccess) onSuccess()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adjust Item</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Current Stock</p>
                            <p className="text-xl font-bold text-slate-800">{currentStock} <span className="text-xs font-normal text-slate-400">{product.unit}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-500">New Stock</p>
                            <p className={cn("text-xl font-bold", adjustmentType === 'ADD' ? "text-green-600" : "text-amber-600")}>
                                {newStock} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Adjustment Type</Label>
                        <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="ADD" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add (+)
                                </TabsTrigger>
                                <TabsTrigger value="REDUCE" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
                                    <Minus className="mr-2 h-4 w-4" /> Reduce (-)
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Adjustment Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="text-right font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="remarks">Description / Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="e.g. Stock count correction, Damaged goods..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className={cn(adjustmentType === 'ADD' ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700")}>
                        {loading ? "Saving..." : "Save Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

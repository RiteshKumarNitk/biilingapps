"use client"

import { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Filter, ArrowRightLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { bulkUpdateCategory, renameCategory, deleteCategory } from '@/actions/inventory'
import { toast } from 'sonner'

interface CategoryManagerProps {
    categories: { name: string, count: number }[]
    products: any[] // All products, to show in right panel
    onRefresh?: () => void
}

export function CategoryManager({ categories, products, onRefresh }: CategoryManagerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categories[0]?.name || null)
    const [leftSearch, setLeftSearch] = useState('')
    const [rightSearch, setRightSearch] = useState('')

    // Selection & Actions
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
    const [moveDialogOpen, setMoveDialogOpen] = useState(false)
    const [targetCategory, setTargetCategory] = useState("")
    const [loading, setLoading] = useState(false)

    // Category Rename/Delete States
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")

    const openRenameDialog = () => {
        if (!selectedCategory) return
        setNewCategoryName(selectedCategory)
        setRenameDialogOpen(true)
    }

    const handleRename = async () => {
        if (!selectedCategory || !newCategoryName) return
        try {
            setLoading(true)
            await renameCategory(selectedCategory, newCategoryName)
            toast.success("Category renamed successfully")
            setRenameDialogOpen(false)
            setSelectedCategory(newCategoryName)
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedCategory) return
        try {
            setLoading(true)
            await deleteCategory(selectedCategory)
            toast.success("Category deleted successfully")
            setDeleteDialogOpen(false)
            setSelectedCategory(null)
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Filter categories (Left Panel)
    const filteredCategories = useMemo(() => {
        return categories.filter(c => c.name.toLowerCase().includes(leftSearch.toLowerCase()))
    }, [categories, leftSearch])

    // Get items in selected category (Right Panel)
    const categoryItems = useMemo(() => {
        if (!selectedCategory) return []
        const items = products.filter(p => (p.category === selectedCategory) || (selectedCategory === 'Uncategorized' && !p.category))

        // Apply Right Search
        if (!rightSearch) return items
        return items.filter(i => i.name.toLowerCase().includes(rightSearch.toLowerCase()))
    }, [products, selectedCategory, rightSearch])

    // Reset selection when category changes
    useEffect(() => {
        setSelectedItemIds([])
    }, [selectedCategory])

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedItemIds(categoryItems.map(i => i.id))
        else setSelectedItemIds([])
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) setSelectedItemIds(prev => [...prev, id])
        else setSelectedItemIds(prev => prev.filter(x => x !== id))
    }

    const handleMoveItems = async () => {
        if (!targetCategory) return toast.error("Please select a target category")

        try {
            setLoading(true)
            await bulkUpdateCategory(selectedItemIds, targetCategory)
            toast.success(`Moved ${selectedItemIds.length} items to ${targetCategory}`)
            setMoveDialogOpen(false)
            setSelectedItemIds([])
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to move items")
        } finally {
            setLoading(false)
        }
    }

    // Prepare category options for move dialog (exclude current)
    const moveOptions = categories.map(c => c.name).filter(n => n !== selectedCategory)

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* LEFT PANEL: CATEGORY LIST */}
            <aside className="w-[320px] flex flex-col border-r bg-white h-full shrink-0">
                <div className="p-3 border-b space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search Category..."
                                className="pl-9 h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                                value={leftSearch}
                                onChange={(e) => setLeftSearch(e.target.value)}
                            />
                        </div>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm h-10 px-4 whitespace-nowrap">
                            <Plus className="h-5 w-5 mr-1" /> Add Category
                        </Button>
                    </div>

                    {/* Column Headers */}
                    <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Category</span>
                        <span>Item</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {filteredCategories.map(cat => (
                        <div
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                                "flex items-center justify-between p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors group",
                                selectedCategory === cat.name ? "bg-blue-50/60 border-l-4 border-l-blue-600 border-b-blue-100" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <span className={cn("font-medium text-sm truncate", selectedCategory === cat.name ? "text-blue-700 font-semibold" : "text-slate-700")}>
                                {cat.name}
                            </span>
                            <span className={cn("text-xs font-semibold w-6 text-right", selectedCategory === cat.name ? "text-blue-600" : "text-slate-500")}>
                                {cat.count}
                            </span>
                        </div>
                    ))}
                </ScrollArea>
            </aside>

            {/* RIGHT PANEL: CATEGORY DETAILS */}
            <main className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
                {selectedCategory ? (
                    <div className="flex flex-col h-full p-4 gap-4 overflow-hidden">
                        {/* 1. Header Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{selectedCategory}</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">{categoryItems.length} Items</p>
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold disabled:opacity-50"
                                disabled={selectedItemIds.length === 0}
                                onClick={() => setMoveDialogOpen(true)}
                            >
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                {selectedItemIds.length > 0 ? `Move ${selectedItemIds.length} Items` : "Move Items"}
                            </Button>

                            <div className="flex items-center gap-1 ml-2 pl-2 border-l">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={openRenameDialog}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => setDeleteDialogOpen(true)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* 2. Items Table Card */}
                        <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
                            {/* Toolbar */}
                            <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                                    {selectedItemIds.length > 0 ? `${selectedItemIds.length} Selected` : "Items"}
                                </h3>
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        placeholder="Search Items..."
                                        className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                                        value={rightSearch}
                                        onChange={(e) => setRightSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="bg-[#F9FAFB] sticky top-0 z-10">
                                        <TableRow className="h-9 hover:bg-[#F9FAFB]">
                                            <TableHead className="w-[40px] pl-4">
                                                <Checkbox
                                                    checked={categoryItems.length > 0 && selectedItemIds.length === categoryItems.length}
                                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                                />
                                            </TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9">
                                                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                                                    NAME <Filter className="h-3 w-3" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9 text-right lg:w-40">
                                                <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-slate-700">
                                                    <Filter className="h-3 w-3" /> QUANTITY
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 h-9 text-right lg:w-40 pr-6">
                                                <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-slate-700">
                                                    <Filter className="h-3 w-3" /> STOCK VALUE
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categoryItems.map(item => (
                                            <TableRow key={item.id} className="hover:bg-blue-50/50 h-10 border-b-slate-50">
                                                <TableCell className="pl-4 py-2">
                                                    <Checkbox
                                                        checked={selectedItemIds.includes(item.id)}
                                                        onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium text-sm text-slate-700 py-2">{item.name}</TableCell>
                                                <TableCell className="text-right font-mono text-sm text-emerald-600 font-medium py-2">
                                                    {item.type === 'service' ? '-' : item.stock_quantity}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm text-slate-700 font-medium py-2 pr-6">
                                                    {item.type === 'service' ? '-' : `₹ ${(item.stock_quantity * (item.cost_price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {categoryItems.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-48 text-center text-slate-400 text-sm">
                                                    No items found in this category
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Select a category</div>
                )}
            </main>

            <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move Items</DialogTitle>
                        <DialogDescription>
                            Select a new category for the selected {selectedItemIds.length} items.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={targetCategory} onValueChange={setTargetCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {moveOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                                {moveOptions.length === 0 && <div className="p-2 text-xs text-slate-500">No other categories available</div>}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleMoveItems} disabled={loading || !targetCategory}>
                            {loading ? 'Moving...' : 'Move Items'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Category Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Category</DialogTitle>
                        <DialogDescription>Enter a new name for <b>{selectedCategory}</b>.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category Name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename} disabled={loading || !newCategoryName}>
                            {loading ? "Renaming..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <b>{selectedCategory}</b>?
                            <br />
                            Items in this category will be moved to <b>General</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Deleting..." : "Delete Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

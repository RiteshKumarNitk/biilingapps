
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { renameUnit, deleteUnit } from "@/actions/inventory"

interface UnitManagerProps {
    units: any[]
    onRefresh?: () => void
}

export function UnitManager({ units, onRefresh }: UnitManagerProps) {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedUnit, setSelectedUnit] = useState<any>(null)
    const [newName, setNewName] = useState("")
    const [loading, setLoading] = useState(false)

    const openRenameDialog = (unit: any) => {
        setSelectedUnit(unit)
        setNewName(unit.name)
        setRenameDialogOpen(true)
    }

    const openDeleteDialog = (unit: any) => {
        setSelectedUnit(unit)
        setDeleteDialogOpen(true)
    }

    const handleRename = async () => {
        if (!selectedUnit || !newName) return
        try {
            setLoading(true)
            await renameUnit(selectedUnit.name, newName)
            toast.success("Unit renamed successfully")
            setRenameDialogOpen(false)
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedUnit) return
        try {
            setLoading(true)
            await deleteUnit(selectedUnit.name)
            toast.success("Unit deleted successfully")
            setDeleteDialogOpen(false)
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#F5F7FA] p-6">
            <div className="bg-white rounded-lg shadow-sm border flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">UNITS</h2>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus className="h-4 w-4 mr-2" /> Add Unit
                    </Button>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0">
                            <TableRow>
                                <TableHead className="pl-6 w-[300px]">UNIT NAME</TableHead>
                                <TableHead>SYMBOL</TableHead>
                                <TableHead>DECIMAL ALLOWED</TableHead>
                                <TableHead className="text-right pr-6">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit, i) => (
                                <TableRow key={i} className="hover:bg-slate-50">
                                    <TableCell className="pl-6 font-medium text-slate-700 uppercase">{unit.name}</TableCell>
                                    <TableCell className="font-mono text-slate-500 uppercase">{unit.symbol}</TableCell>
                                    <TableCell className="text-slate-600">{unit.decimal ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                onClick={() => openRenameDialog(unit)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                onClick={() => openDeleteDialog(unit)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {units.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                        No units found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Unit</DialogTitle>
                        <DialogDescription>Enter a new name for this unit.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Unit Name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRename} disabled={loading || !newName}>
                            {loading ? "Renaming..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Unit</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <b>{selectedUnit?.name}</b>?
                            Items using this unit will be reset to default 'pcs'.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Deleting..." : "Delete Unit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

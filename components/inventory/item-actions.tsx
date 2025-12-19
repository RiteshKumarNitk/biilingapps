
"use client"

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2, Copy, BarChart2, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface ItemActionsProps {
    itemId: string
}

export function ItemActions({ itemId }: ItemActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/inventory/${itemId}`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Edit Item
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-blue-600">
                    <TrendingUp className="mr-2 h-4 w-4" /> Add Sale
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-green-600">
                    <TrendingDown className="mr-2 h-4 w-4" /> Add Purchase
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <BarChart2 className="mr-2 h-4 w-4" /> Stock History
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

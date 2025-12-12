
'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateOrderStatus } from '@/actions/store'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function OrderStatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
    const handleUpdate = async (val: string) => {
        try {
            await updateOrderStatus(id, val)
            toast.success('Status updated')
        } catch (e) {
            toast.error('Failed to update status')
        }
    }

    // Color mapping logic for badge if we weren't using select.
    // Using select for direct action.
    return (
        <Select defaultValue={currentStatus} onValueChange={handleUpdate}>
            <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
    )
}


"use client"

import { useState, useEffect } from 'react'
import { getUnits } from '@/actions/inventory'
import { UnitManager } from '@/components/inventory/unit-manager'
import { ModernLoader } from '@/components/ui/modern-loader'

export default function UnitsPage() {
    const [units, setUnits] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await getUnits()
            setUnits(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex-1 h-full flex items-center justify-center"><ModernLoader text="Loading Units..." /></div>

    return (
        <div className="flex-1 h-full">
            <UnitManager units={units} />
        </div>
    )
}

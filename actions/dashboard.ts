
'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Total Revenue (Sum of paid_amount from Invoices)
    const { data: revenueData } = await supabase
        .from('invoices')
        .select('paid_amount')

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0) || 0

    // 2. Sales Count (Total Invoices)
    const { count: salesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

    // 3. Parties Count (Customers/Suppliers)
    const { count: partiesCount } = await supabase
        .from('parties')
        .select('*', { count: 'exact', head: true })

    // 4. Products Count (Active Items)
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    // 5. Receivable & Payable (from Parties current_balance)
    const { data: partiesData } = await supabase
        .from('parties')
        .select('current_balance')

    let totalReceivable = 0
    let totalPayable = 0
    let receivablePartiesCount = 0
    let payablePartiesCount = 0

    if (partiesData) {
        partiesData.forEach(p => {
            const balance = p.current_balance || 0
            if (balance > 0) {
                totalReceivable += balance
                receivablePartiesCount++
            } else if (balance < 0) {
                totalPayable += Math.abs(balance)
                payablePartiesCount++
            }
        })
    }

    return {
        totalRevenue,
        salesCount: salesCount || 0,
        partiesCount: partiesCount || 0,
        productsCount: productsCount || 0,
        totalReceivable,
        totalPayable,
        receivablePartiesCount,
        payablePartiesCount
    }
}

export async function getRecentSales() {
    const supabase = await createClient()

    // Fetch last 5 invoices with party details
    const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, grand_total, party_name, created_at, party:parties(email)')
        .order('created_at', { ascending: false })
        .limit(5)

    return data || []
}

export async function getOverviewChartData() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('invoices')
        .select('grand_total, created_at')
        .order('created_at', { ascending: true })

    if (!data) return []

    // Group by Month
    const monthlyData: { [key: string]: number } = {}

    data.forEach(inv => {
        const date = new Date(inv.created_at)
        const month = date.toLocaleString('default', { month: 'short' }) // "Jan", "Feb"
        monthlyData[month] = (monthlyData[month] || 0) + (inv.grand_total || 0)
    })

    // Format for Recharts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map(m => ({
        name: m,
        total: monthlyData[m] || 0
    }))
}

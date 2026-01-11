"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface SalesChartProps {
    data: any[]
}

export function SalesChart({ data }: SalesChartProps) {
    const chartData = data && data.length > 0 ? data : [
        { name: "Jan", total: 1000 },
        { name: "Feb", total: 2400 },
        { name: "Mar", total: 1800 },
        { name: "Apr", total: 3200 },
        { name: "May", total: 2800 },
        { name: "Jun", total: 4500 },
        { name: "Jul", total: 3800 },
    ]

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ dy: 10 }}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                    itemStyle={{ color: '#111827', fontWeight: 600 }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

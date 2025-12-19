"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface SalesChartProps {
    data: any[]
}

export function SalesChart({ data }: SalesChartProps) {
    // If no real data, use a fallback to show the design
    const chartData = data && data.length > 0 ? data : [
        { name: "1", total: 1200 },
        { name: "5", total: 2400 },
        { name: "10", total: 1800 },
        { name: "15", total: 3200 },
        { name: "20", total: 2800 },
        { name: "25", total: 4500 },
        { name: "30", total: 3800 },
    ]

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value: number) => [`₹${value}`, "Sale"]}
                />
                <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

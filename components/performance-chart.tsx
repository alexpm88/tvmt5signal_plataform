"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { motion } from "framer-motion"

interface PerformanceChartProps {
  data: Array<{
    date: string
    pnl: number
    trades: number
  }>
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Calculate cumulative P&L
  const cumulativeData = data.reduce((acc: any[], current, index) => {
    const cumulative = index === 0 ? current.pnl : acc[index - 1].cumulativePnl + current.pnl
    acc.push({
      ...current,
      cumulativePnl: cumulative,
      date: new Date(current.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })
    return acc
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative P&L"]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativePnl"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

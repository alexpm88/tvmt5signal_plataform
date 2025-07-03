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

  // Define gradient colors for the card
  const gradientColor = "from-indigo-500 to-purple-600"

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative h-full w-full"
    >
      {/* Outer glow effect */}
      <div className={`absolute inset-1 rounded-lg bg-gradient-to-br opacity-75 blur-3xl -z-2 ${gradientColor}`} />

      {/* Background gradient */}
      <div className={`absolute rounded-xl blur-1xl -z-1 ${gradientColor}`} />

      {/* Content */}
      <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">Performance Overview</CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" fontSize={12} />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
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
                    stroke="#ffffff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPnl)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

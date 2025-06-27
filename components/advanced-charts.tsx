"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine,
} from "recharts"
import { motion } from "framer-motion"
import { TrendingUp, Target, BarChart3, PieChartIcon, LineChart } from "lucide-react"

interface AdvancedChartsProps {
  cumulativeData: Array<{
    date: string
    cumulativePnL: number
    dailyPnL: number
    trades: number
    winStreak: number
    lossStreak: number
  }>
  dailyStats: Array<{
    date: string
    pnl: number
    trades: number
    wins: number
    losses: number
  }>
  topSymbols: Array<{
    symbol: string
    trades: number
    pnl: number
    wins: number
    losses: number
    winRate: number
  }>
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#84cc16"]

export function AdvancedCharts({ cumulativeData, dailyStats, topSymbols }: AdvancedChartsProps) {
  // Prepare scatter plot data
  const scatterData = dailyStats.map((day, index) => ({
    x: index + 1,
    y: day.pnl,
    wins: day.wins,
    losses: day.losses,
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fill: day.pnl > 0 ? "#10b981" : "#ef4444",
  }))

  // Prepare drawdown data
  const drawdownData = cumulativeData.map((point, index) => {
    const peak = Math.max(...cumulativeData.slice(0, index + 1).map((p) => p.cumulativePnL))
    const drawdown = peak - point.cumulativePnL
    return {
      ...point,
      drawdown: -drawdown,
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }
  })

  // Prepare win/loss distribution
  const distributionData = [
    { name: "Winning Trades", value: topSymbols.reduce((sum, s) => sum + s.wins, 0), fill: "#10b981" },
    { name: "Losing Trades", value: topSymbols.reduce((sum, s) => sum + s.losses, 0), fill: "#ef4444" },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Equity Curve */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative P&L"]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativePnL"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Drawdown Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-red-500" />
              Drawdown Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData}>
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                    formatter={(value: number) => [`$${Math.abs(value).toFixed(2)}`, "Drawdown"]}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scatter Plot - Win/Loss Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Daily P&L Scatter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Day"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `Day ${value}`}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="P&L"
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "P&L") return [`$${value.toFixed(2)}`, "Daily P&L"]
                      return [value, name]
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload
                        return `${data.date} - Wins: ${data.wins}, Losses: ${data.losses}`
                      }
                      return label
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                  <Scatter dataKey="y" fill="#6366f1" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Symbol Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Top Symbols Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSymbols.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="symbol" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string, props: any) => {
                      const { payload } = props
                      return [
                        `$${value.toFixed(2)}`,
                        `P&L (${payload.trades} trades, ${payload.winRate.toFixed(1)}% win rate)`,
                      ]
                    }}
                  />
                  <Bar dataKey="pnl" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Win/Loss Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="lg:col-span-2"
      >
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              Win/Loss Distribution & Daily Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Volume */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar yAxisId="left" dataKey="trades" fill="#8b5cf6" name="Total Trades" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="pnl"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Daily P&L"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

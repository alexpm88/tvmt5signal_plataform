"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, BarChart3, Shield, Zap } from "lucide-react"

interface AdvancedStatsCardsProps {
  stats: {
    maxWinStreak: number
    maxLossStreak: number
    currentWinStreak: number
    currentLossStreak: number
    avgWin: number
    avgLoss: number
    profitFactor: number
    maxDrawdown: number
    successRate: number
    totalPnL: number
    winLossRatio: number
    totalSignals: number
  }
}

export function AdvancedStatsCards({ stats }: AdvancedStatsCardsProps) {
  const cards = [
    {
      title: "Max Win Streak",
      value: stats.maxWinStreak,
      subtitle: `Current: ${stats.currentWinStreak}`,
      icon: Zap,
      trend: "up" as const,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Max Loss Streak",
      value: stats.maxLossStreak,
      subtitle: `Current: ${stats.currentLossStreak}`,
      icon: AlertTriangle,
      trend: "down" as const,
      color: "from-red-500 to-rose-600",
    },
    {
      title: "Avg Win",
      value: `$${stats.avgWin.toFixed(2)}`,
      subtitle: "Per winning trade",
      icon: TrendingUp,
      trend: "up" as const,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Avg Loss",
      value: `$${stats.avgLoss.toFixed(2)}`,
      subtitle: "Per losing trade",
      icon: TrendingDown,
      trend: "down" as const,
      color: "from-orange-500 to-amber-600",
    },
    {
      title: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      subtitle: stats.profitFactor > 1 ? "Profitable" : "Needs improvement",
      icon: Target,
      trend: stats.profitFactor > 1 ? "up" : "down",
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "Max Drawdown",
      value: `$${stats.maxDrawdown.toFixed(2)}`,
      subtitle: "Peak to trough",
      icon: Shield,
      trend: "neutral" as const,
      color: "from-slate-500 to-gray-600",
    },
    {
      title: "Risk Reward",
      value: (stats.avgWin / (stats.avgLoss || 1)).toFixed(2),
      subtitle: "Win/Loss ratio",
      icon: BarChart3,
      trend: stats.avgWin / (stats.avgLoss || 1) > 1 ? "up" : "down",
      color: "from-cyan-500 to-teal-600",
    },
    {
      title: "Sharpe Ratio",
      value: (stats.totalPnL / Math.max(stats.maxDrawdown, 1)).toFixed(2),
      subtitle: "Risk-adjusted return",
      icon: Award,
      trend: stats.totalPnL / Math.max(stats.maxDrawdown, 1) > 1 ? "up" : "neutral",
      color: "from-pink-500 to-rose-600",
    },
  ]

  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-slate-400",
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    <p className={cn("text-sm font-medium", trendColors[card.trend])}>{card.subtitle}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl shadow-lg bg-gradient-to-br",
                    card.color,
                  )}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Progress indicator for some metrics */}
              {card.title === "Profit Factor" && (
                <div className="mt-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000 rounded-full",
                        stats.profitFactor > 1 ? "bg-emerald-500" : "bg-red-500",
                      )}
                      style={{ width: `${Math.min(stats.profitFactor * 50, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {card.title === "Max Win Streak" && stats.currentWinStreak > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 rounded-full"
                      style={{ width: `${(stats.currentWinStreak / stats.maxWinStreak) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

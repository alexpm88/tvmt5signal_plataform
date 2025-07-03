"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FlipWords } from "@/components/ui/flip-words"
import { StatsCard } from "@/components/stats-card"
import { AdvancedStatsCards } from "@/components/advanced-stats-cards"
import { RecentSignalsTable } from "@/components/recent-signals-table"
import { AdvancedCharts } from "@/components/advanced-charts"
import { EcosystemSection } from "@/components/ecosystem-section"
import { ChatExample } from "@/components/chat-example"
import { useStats } from "@/hooks/use-stats"
import { TrendingUp, Activity, DollarSign, Target, RefreshCw, Zap, BarChart3, LineChart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function Page() {
  const { stats, loading, error, lastUpdated } = useStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error fetching stats</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 text-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative px-6 py-24 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Zap className="mr-2 h-4 w-4" />
                Real-time Signal Processing
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              TVMT5 Signal
            </h1>

            <p className="mt-6 text-xl font-bold leading-8  max-w-2xl mx-auto">
              <FlipWords 
                words={[
                  "señales de trading", 
                  "Análisis con IA", 
                  "Gestión de Riesgo Avanzado",
                  "Operaciones en Tiempo Real", 
                  "Seguimiento Avanzado de Rendimiento"
                ]} 
                duration={3000} 
                className="items-center rounded-full text-white bg-gradient-to-r from-violet-700 via-pink-500 to-blue-600"
              />
            </p>

          </motion.div>
        </div>
      </div>

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* Stats Section */}
      <div className="px-6 py-12 sm:px-12 lg:px-16 relative">
        <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="mx-auto max-w-7xl space-y-12">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Basic Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                <StatsCard
                  title="Total Signals"
                  value={stats.totalSignals.toLocaleString()}
                  subtitle="All time"
                  icon={Activity}
                  trend="neutral"
                  color="from-blue-500 to-cyan-500"
                />

                <StatsCard
                  title="Success Rate"
                  value={`${stats.successRate}%`}
                  subtitle={`${stats.successfulSignals}/${stats.processedSignals} processed`}
                  icon={Target}
                  trend={stats.successRate >= 70 ? "up" : stats.successRate >= 50 ? "neutral" : "down"}
                  color="from-emerald-500 to-green-500"
                />

                <StatsCard
                  title="Total P&L"
                  value={`$${stats.totalPnL.toLocaleString()}`}
                  subtitle={`${stats.winningTrades}W / ${stats.losingTrades}L`}
                  icon={DollarSign}
                  trend={stats.totalPnL > 0 ? "up" : stats.totalPnL < 0 ? "down" : "neutral"}
                  color="from-amber-500 to-orange-500"
                />

                <StatsCard
                  title="Active Signals"
                  value={stats.activeSignals.toLocaleString()}
                  subtitle="Pending processing"
                  icon={TrendingUp}
                  trend="neutral"
                  color="from-rose-500 to-red-500"
                />
              </motion.div>

              {/* Advanced Stats */}
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"
                >
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                  Advanced Analytics
                </motion.h2>
                <AdvancedStatsCards stats={stats} />
              </div>

              {/* Charts */}
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"
                >
                  <LineChart className="h-6 w-6 text-purple-500" />
                  Performance Charts
                </motion.h2>
                <AdvancedCharts
                  cumulativeData={stats.cumulativeData}
                  dailyStats={stats.dailyStats}
                  topSymbols={stats.topSymbols}
                />
              </div>

              {/* Recent Signals */}
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"
                >
                  <Activity className="h-6 w-6 text-emerald-500" />
                  Recent Activity
                </motion.h2>
                <RecentSignalsTable signals={stats.recentSignals} />
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Chat Example Section */}
      <ChatExample />
      
      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-2 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Left side - Last updated */}
            <div className="text-sm text-slate-600 text-center md:text-left" suppressHydrationWarning>
              Last updated: {stats ? (
                mounted ? 
                  new Date(stats.lastUpdated).toLocaleString() : 
                  "Loading..." // Fallback estático para SSR
              ) : "Loading..."}
            </div>

            {/* Center - Logo */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-1">
                <img src="/logo-tvmt5-signal.svg" alt="TVMT5 Signal Logo" className="h-10 w-10 object-contain" />
                <div className="text-center">
                  <h3 className="font-bold text-slate-900 text-base">TVMT5 Signal</h3>
                  <p className="text-xs text-slate-600">Professional Trading Platform</p>
                </div>
              </div>
            </div>

            {/* Right side - System status */}
            <div className="flex items-center justify-center md:justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm text-slate-600">System Online</span>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-center text-sm text-slate-500">
              © 2024 TVMT5 Signal Platform. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

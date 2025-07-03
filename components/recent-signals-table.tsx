"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Signal } from "@/lib/supabase"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"

interface RecentSignalsTableProps {
  signals: Signal[]
}

export function RecentSignalsTable({ signals }: RecentSignalsTableProps) {
  const [mounted, setMounted] = useState(false)
  
  // Evitar hidratación renderizando fechas solo en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])
  const getStatusBadge = (signal: Signal) => {
    if (!signal.processed) {
      return (
        <Badge variant="secondary" className="bg-yellow-300 text-yellow-900 hover:bg-yellow-400 font-bold">
          Pending
        </Badge>
      )
    }

    if (signal.success) {
      return (
        <Badge variant="default" className="bg-emerald-400 text-emerald-950 hover:bg-emerald-500 font-bold">
          Success
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-500 text-red-950 hover:bg-red-600 font-bold">
        Failed
      </Badge>
    )
  }

  const getPnLColor = (pnl?: number) => {
    if (!pnl) return "text-slate-400"
    return pnl > 0 ? "text-emerald-700 font-bold" : "text-red-700 font-bold"
  }

  // Define gradient colors for the card
  const gradientColor = "from-cyan-500 to-blue-600"

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative h-full w-full"
    >
      {/* Outer glow effect */}
      <div className={`absolute inset-1 rounded-lg bg-gradient-to-br opacity-25 blur-3xl -z-2 ${gradientColor}`} />

      {/* Background gradient */}
      <div className={`absolute rounded-xl blur-1xl -z-1 ${gradientColor}`} />

      {/* Content */}
      <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-700 hover:text-cyan-900 transition-colors duration-200">Recent Signals</CardTitle>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signals.length === 0 ? (
                <div className="text-center py-8 text-slate-700 hover:text-black/70 transition-colors duration-200">No recent signals found</div>
              ) : (
                signals.map((signal, index) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/20 hover:bg-white/70 transition-colors duration-200 backdrop-blur-sm group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                                                    <span
                            className={`font-semibold ${
                              signal.action === "BUY"
                                ? "text-emerald-700 group-hover:text-emerald-500"
                                : "text-red-700 group-hover:text-red-500"
                            }`}
                          >
                            {signal.symbol}
                          </span>
                          <Badge
                            variant={signal.action === "BUY" ? "default" : "secondary"}
                            className={
                              signal.action === "BUY"
                                ? "bg-emerald-600 text-emerald-100 hover:bg-emerald-700 border-0 font-bold"
                                : "bg-red-600 text-red-100 hover:bg-red-700 border-0 font-bold"
                            }
                          >
                            {signal.action}
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-slate/10">
                          {mounted 
                            ? formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })
                            : new Date(signal.timestamp).toLocaleDateString() /* Fallback estático para SSR */
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {signal.entry_price && (
                        <div className="text-right">
                          <div className="text-sm text-slate/70 group-hover:text-black/70">Entry</div>
                          <div className="font-medium text-slate-800 group-hover:text-black">{signal.entry_price.toFixed(5)}</div>
                        </div>
                      )}

                      {signal.exit_price && (
                        <div className="text-right">
                          <div className="text-sm text-slate/70 group-hover:text-black/70">Exit</div>
                          <div className="font-medium text-slate-800 group-hover:text-black">{signal.exit_price.toFixed(5)}</div>
                        </div>
                      )}

                      {signal.pnl !== null && signal.pnl !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-slate/70 group-hover:text-black/70">P&L</div>
                          <div className={`font-medium ${getPnLColor(signal.pnl)}`}>${signal.pnl.toFixed(2)}</div>
                        </div>
                      )}

                      {getStatusBadge(signal)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

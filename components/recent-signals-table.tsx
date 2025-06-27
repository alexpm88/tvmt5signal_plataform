"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Signal } from "@/lib/supabase"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

interface RecentSignalsTableProps {
  signals: Signal[]
}

export function RecentSignalsTable({ signals }: RecentSignalsTableProps) {
  const getStatusBadge = (signal: Signal) => {
    if (!signal.processed) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Pending
        </Badge>
      )
    }

    if (signal.success) {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
          Success
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
        Failed
      </Badge>
    )
  }

  const getPnLColor = (pnl?: number) => {
    if (!pnl) return "text-slate-500"
    return pnl > 0 ? "text-emerald-600" : "text-red-600"
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">Recent Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No recent signals found</div>
          ) : (
            signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">{signal.symbol}</span>
                      <Badge
                        variant={signal.action === "BUY" ? "default" : "secondary"}
                        className={
                          signal.action === "BUY"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {signal.action}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {signal.entry_price && (
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Entry</div>
                      <div className="font-medium">{signal.entry_price.toFixed(5)}</div>
                    </div>
                  )}

                  {signal.exit_price && (
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Exit</div>
                      <div className="font-medium">{signal.exit_price.toFixed(5)}</div>
                    </div>
                  )}

                  {signal.pnl !== null && signal.pnl !== undefined && (
                    <div className="text-right">
                      <div className="text-sm text-slate-600">P&L</div>
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
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend = "neutral", className }: StatsCardProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-slate-400",
  }

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm",
          "shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)]",
          "transition-all duration-300 hover:-translate-y-1",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
          className,
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {subtitle && <p className={cn("text-sm font-medium", trendColors[trend])}>{subtitle}</p>}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

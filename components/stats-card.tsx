"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  className?: string
  color?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend = "neutral", className, color = "from-purple-500 to-violet-600" }: StatsCardProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-slate-500",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("relative h-full w-full", className)}
    >
      {/* Outer glow effect */}
      <div className={cn("absolute inset-1 rounded-lg bg-gradient-to-br opacity-75 blur-3xl -z-2", color)} />

      {/* Background gradient */}
      <div className={cn("absolute rounded-xl blur-1xl -z-1", color)} />

      {/* Content */}
      <div className="relative z-10 rounded-xl flex h-full flex-col justify-between p-6 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{value}</p>
              {subtitle && <p className={cn("text-sm font-medium", trendColors[trend])}>{subtitle}</p>}
            </div>
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm")}>
            <Icon className={cn("h-6 w-6", trendColors[trend])} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

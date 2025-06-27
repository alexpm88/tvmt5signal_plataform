"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Target,
  DollarSign,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export function TradingIconsSkeleton() {
  const icons = [
    { Icon: TrendingUp, color: "text-emerald-500", delay: 0 },
    { Icon: BarChart3, color: "text-blue-500", delay: 0.1 },
    { Icon: Activity, color: "text-purple-500", delay: 0.2 },
    { Icon: Zap, color: "text-yellow-500", delay: 0.3 },
    { Icon: Target, color: "text-red-500", delay: 0.4 },
    { Icon: DollarSign, color: "text-green-500", delay: 0.5 },
    { Icon: LineChart, color: "text-indigo-500", delay: 0.6 },
    { Icon: PieChart, color: "text-pink-500", delay: 0.7 },
    { Icon: ArrowUpRight, color: "text-cyan-500", delay: 0.8 },
    { Icon: ArrowDownRight, color: "text-orange-500", delay: 0.9 },
  ]

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50" />

      {/* Floating icons */}
      <div className="relative grid grid-cols-4 gap-4 p-8">
        {icons.map(({ Icon, color, delay }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: [0, 1, 0.7, 1],
              scale: [0, 1.2, 0.9, 1],
              rotate: [0, 360, 180, 0],
              y: [0, -10, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              delay: delay,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 ${color}`}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      {/* Animated lines connecting icons */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Animated connecting lines */}
        {[...Array(5)].map((_, i) => (
          <motion.path
            key={i}
            d={`M${20 + i * 30},${40 + i * 20} Q${100 + i * 20},${80 + i * 15} ${180 - i * 25},${120 + i * 10}`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
          initial={{
            x: Math.random() * 200,
            y: Math.random() * 150,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 200,
            y: Math.random() * 150,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

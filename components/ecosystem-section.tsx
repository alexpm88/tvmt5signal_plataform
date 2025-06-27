"use client"

import { motion } from "framer-motion"
import { ModernCard, ModernCardSkeletonContainer } from "@/components/ui/modern-card"
import { TradingIconsSkeleton } from "@/components/trading-icons-skeleton"
import { useStats } from "@/hooks/use-stats"
import { Activity, Target, BarChart3, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EcosystemSection() {
  const { stats, loading } = useStats()

  const ecosystemItems = [
    {
      name: "TradingView",
      description: "Señales",
      color: "cyan",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      textColor: "text-cyan-600",
      icon: Activity,
      value: loading ? "..." : stats?.totalSignals.toLocaleString() || "0",
    },
    {
      name: "MetaTrader 5",
      description: "Ejecución",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-600",
      icon: Target,
      value: loading ? "..." : `${stats?.successRate || 0}%`,
    },
    {
      name: "API REST",
      description: "Gestión",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      textColor: "text-purple-600",
      icon: BarChart3,
      value: loading ? "..." : stats?.processedSignals.toLocaleString() || "0",
    },
    {
      name: "Dashboard",
      description: "Monitoreo",
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      textColor: "text-orange-600",
      icon: TrendingUp,
      value: loading ? "..." : `$${stats?.totalPnL.toLocaleString() || "0"}`,
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Ecosistema Integrado
              </motion.div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Plataforma Completa de
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Trading Automatizado
                </span>
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed">
                Conecta TradingView, MetaTrader 5, y nuestro sistema de gestión en una sola plataforma automatizada.
                Desde la generación de señales hasta la ejecución y monitoreo, todo en tiempo real.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">Características principales:</h3>
              <div className="grid gap-4">
                {[
                  "Integración directa con TradingView webhooks",
                  "Ejecución automática en MetaTrader 5",
                  "API REST completa para gestión de señales",
                  "Dashboard en tiempo real con analytics avanzados",
                  "Gestión de riesgo y monitoreo de performance",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    <span className="text-slate-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group">
                  Explorar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Ver Documentación
              </Button>
            </motion.div>
          </motion.div>

          {/* Right side - Interactive card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end"
          >
            <ModernCard className="max-w-md w-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-2xl">
              <ModernCardSkeletonContainer className="bg-gradient-to-br from-slate-100 via-white to-slate-50">
                <TradingIconsSkeleton />
              </ModernCardSkeletonContainer>

              <div className="p-6 space-y-6">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">Ecosistema Completo</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Conecta TradingView, MetaTrader 5, y nuestro sistema de gestión en una sola plataforma automatizada.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {ecosystemItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className={`${item.bgColor} ${item.borderColor} border p-4 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <item.icon className={`h-5 w-5 ${item.textColor}`} />
                        <span className={`text-xs font-bold ${item.textColor}`}>{item.value}</span>
                      </div>
                      <div className={`${item.textColor} font-bold text-sm mb-1`}>{item.name}</div>
                      <div className="text-gray-500 text-xs">{item.description}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estado del sistema</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

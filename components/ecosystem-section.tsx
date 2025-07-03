"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ModernCard, ModernCardSkeletonContainer } from "@/components/ui/modern-card"
import { TradingIconsSkeleton } from "@/components/trading-icons-skeleton"
import { useStats } from "@/hooks/use-stats"
import { Activity, Target, BarChart3, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { memo, useMemo } from "react"

// Componente memoizado para el contenido estático del lado izquierdo
const LeftContent = memo(() => (
  <div className="space-y-8">
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
  </div>
));

// Componente memoizado para cada tarjeta de estadísticas
const StatCard = memo(({ item }: { item: any }) => {
  const Icon = item.icon;
  return (
    <div className="relative h-full w-full">
      {/* Outer glow effect */}
      <div className={cn("absolute inset-10 rounded-lg bg-gradient-to-br opacity-75 blur-3xl -z-1", item.color)} />

      {/* Background gradient */}
      <div className="absolute -inset-0 rounded-xl bg-gradient-to-br from-slate-200 via-white-300 to-white-100 opacity-90 -z-1 " />

      {/* Content */}
      <div className="relative z-10 rounded-xl flex h-full flex-col justify-between p-6 backdrop-blur-sm   ">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{item.name}</p>
            <div className="space-y-1">
              <p className={cn("text-2xl font-bold", item.valueColor || "text-slate-700")} suppressHydrationWarning>{item.value}</p>
              <p className={cn("text-sm font-medium", item.textColor)}>{item.description}</p>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wite-100 shadow-lg backdrop-blur-lm">
            <Icon className={cn("h-6 w-6", item.textColor)} />
          </div>
        </div>
      </div>
    </div>
  );
});

export function EcosystemSection() {
  const { stats, loading } = useStats()

  // Usar useMemo para evitar recálculos innecesarios de los datos
  const ecosystemItems = useMemo(() => {
    const pnl = stats?.totalPnL || 0;
    const successRate = stats?.successRate || 0;

    const getPnlColor = () => {
      if (pnl > 0) return "text-green-700";
      if (pnl < 0) return "text-red-700";
      return "text-orange-600";
    };

    const getSuccessRateColor = () => {
      if (successRate > 65) return "text-green-700";
      if (successRate >= 40) return "text-orange-600";
      return "text-red-700";
    };

    return [
      {
        name: "TradingView",
        description: "Señales",
        color: "cyan",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-100",
        textColor: "text-cyan-600",
        icon: Activity,
        value: loading ? "..." : stats?.totalSignals.toLocaleString() || "0",
        valueColor: "text-cyan-600",
      },
      {
        name: "MetaTrader 5",
        description: "Ejecución",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-100",
        textColor: "text-green-600",
        icon: Target,
        value: loading ? "..." : `${successRate}%`,
        valueColor: getSuccessRateColor(),
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
        valueColor: "text-purple-600",
      },
      {
        name: "Dashboard",
        description: "Monitoreo",
        color: "orange",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-100",
        textColor: getPnlColor(),
        icon: TrendingUp,
        value: loading ? "..." : `$${pnl.toLocaleString() || "0"}`,
        valueColor: getPnlColor(),
      },
    ]
  }, [stats, loading])

  // Componente memoizado para el estado del sistema
  const SystemStatus = memo(() => (
    <div className="pt-4 border-t border-slate-700/50">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Estado del sistema</span>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 font-medium">Online</span>
        </div>
      </div>
    </div>
  ));

  // Componente memoizado para el encabezado del ecosistema
  const EcosystemHeader = memo(() => (
    <div className="text-center space-y-3 relative z-10">
      <h3 className="text-xl font-bold text-slate-800">Ecosistema Completo</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">
        Conecta TradingView, MetaTrader 5, y nuestro sistema de gestión en una sola plataforma automatizada.
      </p>
    </div>
  ));

  // Componente memoizado para el botón de acceso al dashboard
  const DashboardButton = memo(() => (
    <div className="pt-4">
      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
        <Link href="/dashboard">
          <span>Acceder al Dashboard</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  ));

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
      <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center justify-items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm bg-white/20 max-w-xl w-full"
          >
            <LeftContent />
          </motion.div>

          {/* Right side - Interactive card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center space-y-8 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm bg-white/20 max-w-xl w-full"
          >
            <div className="w-full z-0">
              <div className="mb-6 relative z-10">
                <TradingIconsSkeleton />
              </div>

              <div className="space-y-6 relative z-10">
                <EcosystemHeader />

                <div className="grid grid-cols-2 gap-4">
                  {ecosystemItems.map((item) => (
                    <StatCard key={item.name} item={item} />
                  ))}
                </div>

                <SystemStatus />
                
                <DashboardButton />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

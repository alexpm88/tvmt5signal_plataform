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

import { Signal } from '@/lib/supabase';

interface AdvancedChartsProps {
  signals: Signal[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#84cc16"];

export function AdvancedCharts({ signals = [] }: AdvancedChartsProps) {
  const processedSignals = signals.filter(s => s.processed && s.pnl !== null);

  const dailyStats = Array.from(processedSignals.reduce((acc, signal) => {
    const date = new Date(signal.created_at).toISOString().split('T')[0];
    if (!acc.has(date)) {
      acc.set(date, { date, pnl: 0, trades: 0, wins: 0, losses: 0 });
    }
    const day = acc.get(date)!;
    day.pnl += signal.pnl || 0;
    day.trades += 1;
    if (signal.pnl !== null) {
      if (signal.pnl > 0) day.wins += 1;
      else if (signal.pnl < 0) day.losses += 1;
    }
    return acc;
  }, new Map<string, { date: string; pnl: number; trades: number; wins: number; losses: number; }>()).values());

  dailyStats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativePnL = 0;
  const cumulativeData = dailyStats.map(day => {
    cumulativePnL += day.pnl;
    return { ...day, cumulativePnL };
  });

  const topSymbols = Array.from(processedSignals.reduce((acc, signal) => {
    if (!acc.has(signal.symbol)) {
      acc.set(signal.symbol, { symbol: signal.symbol, trades: 0, pnl: 0, wins: 0, losses: 0 });
    }
    const sym = acc.get(signal.symbol)!;
    sym.trades += 1;
    sym.pnl += signal.pnl || 0;
    if (signal.pnl !== null) {
      if (signal.pnl > 0) sym.wins += 1;
      else if (signal.pnl < 0) sym.losses += 1;
    }
    return acc;
  }, new Map<string, { symbol: string; trades: number; pnl: number; wins: number; losses: number; }>()).values());

  topSymbols.forEach(s => (s as any).winRate = s.trades > 0 ? (s.wins / s.trades) * 100 : 0);

  const scatterData = dailyStats.map((day, index) => ({
    x: index + 1,
    y: day.pnl,
    wins: day.wins,
    losses: day.losses,
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fill: day.pnl > 0 ? "#006400" : "#8B0000",
  }));

  const drawdownData = cumulativeData.map((point, index) => {
    const peak = Math.max(...cumulativeData.slice(0, index + 1).map(p => p.cumulativePnL));
    const drawdown = peak - point.cumulativePnL;
    return {
      ...point,
      drawdown: -drawdown,
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  const distributionData = [
    { name: "Winning Trades", value: topSymbols.reduce((sum, s) => sum + s.wins, 0), fill: "#10b981" },
    { name: "Losing Trades", value: topSymbols.reduce((sum, s) => sum + s.losses, 0), fill: "#ef4444" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Equity Curve */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1, duration: 0.6 }}
        className="relative h-full w-full"
      >
        {/* Outer glow effect */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 opacity-25 blur-3xl -z-2" />

        {/* Background gradient */}
        <div className="absolute rounded-xl blur-1xl from-indigo-500 to-purple-600 -z-1" />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-700">Equity Curve</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                  <TrendingUp className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(36, 142, 0)"  stopOpacity={0.8} />
                      <stop offset="95%" stopColor="rgb(0, 255, 34)"  stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#334155"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#334155" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(14, 20, 43, 0.7)" ,
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
                    stroke="rgb(0, 65, 20)" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#equityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Drawdown Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative h-full w-full"
      >
        {/* Outer glow effect */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 opacity-25 blur-3xl -z-2" />

        {/* Background gradient */}
        <div className="absolute rounded-xl blur-1xl from-red-200 to-rose-500 -z-1" />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-700">Drawdown Analysis</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                  <LineChart className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownData}>
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255, 0, 64, 0.7)"  stopOpacity={0.1} />
                      <stop offset="95%" stopColor="rgb(85, 0, 0)"  stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#334155" fontSize={12} />
                  <YAxis stroke="#334155" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(14, 20, 43, 0.7)" ,
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`$${Math.abs(value).toFixed(2)}`, "Drawdown"]}
                  />
                  <ReferenceLine y={0} stroke="rgba(14, 20, 43, 0.7)"   strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey="drawdown"
                    stroke="rgba(116, 0, 8, 0.7)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#drawdownGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Scatter Plot - Win/Loss Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative h-full w-full"
      >
        {/* Outer glow effect */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 opacity-25 blur-3xl -z-2" />

        {/* Background gradient */}
        <div className="absolute rounded-xl blur-1xl from-purple-500 to-violet-600 -z-1" />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-700">Daily P&L Scatter</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={scatterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Day"
                    stroke="#334155"
                    fontSize={12}
                    tickFormatter={(value) => `Day ${value}`}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="P&L"
                    stroke="#334155"
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
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.5)" strokeDasharray="2 2" />
                  <Scatter dataKey="y">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Symbol Performance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative h-full w-full"
      >
        {/* Outer glow effect */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 opacity-25 blur-3xl -z-2" />

        {/* Background gradient */}
        <div className="absolute rounded-xl blur-1xl from-blue-500 to-indigo-600 -z-1" />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-700">Top Symbols Performance</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topSymbols.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="symbol" stroke="#334155" fontSize={12} />
                  <YAxis stroke="#334155" fontSize={12} tickFormatter={(value) => `$${value.toFixed(0)}`} />
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
                  <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.5)" />
                  {/* Línea que conecta los puntos */}
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="rgb(255, 255, 255)" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={false}
                  />
                  {/* Puntos para cada símbolo */}
                  <Scatter 
                    dataKey="pnl" 
                    fill="#8884d8"
                    shape={(props) => {
                      const { cx, cy, payload } = props;
                      // Determinar el color y tamaño basado en el valor de PnL
                      let fillColor;
                      let pointSize;
                      
                      if (payload.pnl < 0) {
                        fillColor = "#8B0000"; // Rojo oscuro
                        pointSize = 6;
                      } else if (payload.pnl > 0) {
                        fillColor = "#006400"; // Verde oscuro
                        pointSize = 6;
                      } else {
                        pointSize = 3;
                        fillColor = 'rgba(255, 255, 255, 0)';
                      }
                      
                      // Dibujar un círculo con el tamaño y color calculados
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={pointSize} 
                          fill={fillColor} 
                          stroke="rgba(255, 255, 255, 0.8)"
                          strokeWidth={1}
                        />
                      );
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Win/Loss Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="lg:col-span-2 relative h-full w-full"
      >
        {/* Outer glow effect */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 opacity-25 blur-3xl -z-2" />

        {/* Background gradient */}
        <div className="absolute rounded-xl blur-1xl from-cyan-500 to-teal-600 -z-1" />

        {/* Content */}
        <div className="relative z-10 rounded-xl flex h-full flex-col justify-between backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none relative overflow-hidden">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-700">Win/Loss Distribution & Daily Volume</CardTitle>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg backdrop-blur-lm">
                  <PieChartIcon className="h-6 w-6 text-cyan-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Donut Charts */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Outer Donut - Win Percentage */}
                    <Pie
                      data={[
                        { 
                          name: "Win %", 
                          value: (topSymbols.reduce((sum, s) => sum + s.wins, 0) / 
                                   (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100), 
                          fill: "rgb(3, 154, 56)"
                        },
                        {
                          name: "Empty Win",
                          value: 100 - (topSymbols.reduce((sum, s) => sum + s.wins, 0) / 
                                   (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100),
                          fill: "#ffffff"
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={120}
                      outerRadius={150}
                      startAngle={90}
                      endAngle={-270} // Círculo completo en sentido contrario a las manecillas
                      dataKey="value"
                      labelLine={false}
                      cornerRadius={12}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
                        // Eliminamos la etiqueta de porcentaje en la dona
                        return null;
                      }}
                    >
                      {({ name, value, fill }) => {
                        // Segmentos para el Win %
                        if (name === "Win %") {
                          const winPercentage = value.toFixed(1);
                          
                          return (
                            <Cell 
                              key={`cell-win`} 
                              fill={`url(#winGradient)`} 
                              stroke="rgb(46, 120, 31)" 
                              strokeWidth={2} 
                              cornerRadius={10}
                              opacity={value / 100} // Opacidad basada en el porcentaje real
                            />
                          );
                        } else if (name === "Empty Win") {
                          return (
                            <Cell 
                              key={`cell-empty-win`} 
                              fill="rgba(255, 255, 255, 0.2)" 
                              stroke="rgba(255, 255, 255, 0.3)" 
                              strokeWidth={1} 
                              opacity={0.2}
                              cornerRadius={10}
                            />
                          );
                        }
                      }}
                    </Pie>
                    
                    {/* Inner Donut - Loss Percentage */}
                    <Pie
                      data={[
                        { 
                          name: "Loss %", 
                          value: (topSymbols.reduce((sum, s) => sum + s.losses, 0) / 
                                  (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100), 
                          fill: "rgb(189, 1, 206)" 
                        },
                        {
                          name: "Empty Loss",
                          value: 100 - (topSymbols.reduce((sum, s) => sum + s.losses, 0) / 
                                  (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100),
                          fill: "#ffffff"
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={95}
                      outerRadius={115}
                      startAngle={90}
                      endAngle={450} // Círculo completo en sentido de las manecillas
                      dataKey="value"
                      labelLine={false}
                      cornerRadius={12}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
                        // Eliminamos la etiqueta de porcentaje en la dona
                        return null;
                      }}
                    >
                      {({ name, value, fill }) => {
                        // Segmentos para el Loss %
                        if (name === "Loss %") {
                          const lossPercentage = value.toFixed(1);
                          
                          return (
                            <Cell 
                              key={`cell-loss`} 
                              fill={`url(#lossGradient)`} 
                              stroke="rgba(236, 72, 153, 0.8)" 
                              strokeWidth={2} 
                              cornerRadius={10}
                              opacity={value / 100} // Opacidad basada en el porcentaje real
                            />
                          );
                        } else if (name === "Empty Loss") {
                          return (
                            <Cell 
                              key={`cell-empty-loss`} 
                              fill="rgba(255, 255, 255, 0.2)" 
                              stroke="rgba(255, 255, 255, 0.3)" 
                              strokeWidth={1} 
                              opacity={0.2}
                              cornerRadius={10}
                            />
                          );
                        }
                      }}
                    </Pie>
                    
                    {/* Definición de gradientes */}
                    <defs>
                      <linearGradient id="winGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(0, 255, 153, 0.9)" />
                        <stop offset="50%" stopColor="rgb(0, 112, 64)" />
                        <stop offset="100%" stopColor="rgba(0, 153, 146, 0.7)" />
                      </linearGradient>
                      <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 0, 128, 0.9)" />
                        <stop offset="50%" stopColor="rgba(236, 72, 153, 0.8)" />
                        <stop offset="100%" stopColor="rgba(217, 144, 178, 0.7)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Círculo central simplificado */}
                    <g>
                      <circle cx="50%" cy="50%" r="80" fill="rgb(238, 233, 255)" stroke="rgb(255, 255, 255)" strokeWidth="3" />
                    </g>
                    
                    {/* Etiquetas de Win y Loss eliminadas */}
                    {/* Porcentajes en el centro */}
                    <text 
                      x="50%" 
                      y="45%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="rgba(0, 95, 57, 0.9)"
                      fontSize={24}
                      fontWeight="bold"
                    >
                      {(topSymbols.reduce((sum, s) => sum + s.wins, 0) / 
                        (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100).toFixed(1)}%
                    </text>
                    
                    <text 
                      x="50%" 
                      y="55%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="rgba(147, 0, 74, 0.9)"
                      fontSize={24}
                      fontWeight="bold"
                    >
                      {(topSymbols.reduce((sum, s) => sum + s.losses, 0) / 
                        (topSymbols.reduce((sum, s) => sum + s.wins + s.losses, 0)) * 100).toFixed(1)}%
                    </text>
                    
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.43)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value, name) => {
                        if (name === "Win %") {
                          return [`Win: ${value.toFixed(1)}%`, "Win Rate"];
                        } else if (name === "Loss %") {
                          return [`Loss: ${value.toFixed(1)}%`, "Loss Rate"];
                        }
                        return [value, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Daily Volume */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyStats}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006400" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#006400" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#334155"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis yAxisId="left" stroke="#334155" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#334155" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="trades" fill="url(#barGradient)" name="Total Trades" radius={[10, 10, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pnl"
                    stroke="rgba(4, 66, 0, 0.95)"
                    strokeWidth={2}
                    name="Daily P&L"
                  />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

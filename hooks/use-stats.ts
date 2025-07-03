"use client"

import { useState, useEffect, useRef } from "react"

interface Stats {
  totalSignals: number
  processedSignals: number
  successfulSignals: number
  activeSignals: number
  successRate: number
  totalPnL: number
  winningTrades: number
  losingTrades: number
  winLossRatio: number
  maxWinStreak: number
  maxLossStreak: number
  currentWinStreak: number
  currentLossStreak: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
  recentSignals: any[]
  cumulativeData: Array<{
    date: string
    cumulativePnL: number
    dailyPnL: number
    trades: number
    winStreak: number
    lossStreak: number
  }>
  dailyStats: Array<{
    date: string
    pnl: number
    trades: number
    wins: number
    losses: number
  }>
  topSymbols: Array<{
    symbol: string
    trades: number
    pnl: number
    wins: number
    losses: number
    winRate: number
  }>
  lastUpdated: string
}

import { Signal } from "@/lib/supabase"

export function useStats(signals?: Signal[]) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(!signals)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const etagRef = useRef<string | null>(null)

  const fetchStats = async (showLoading = true) => {
    try {
      // Solo mostrar el indicador de carga en la carga inicial o cuando se solicita explícitamente
      if (showLoading && isInitialLoad) {
        setLoading(true)
      }
      setError(null)

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Añadir ETag si existe para aprovechar el mecanismo 304 Not Modified
      if (etagRef.current) {
        headers["If-None-Match"] = etagRef.current
      }

      const response = await fetch("/api/signals/stats", {
        method: "GET",
        headers,
        cache: "no-store",
      })

      // Guardar el nuevo ETag si está presente
      const newEtag = response.headers.get("ETag")
      if (newEtag) {
        etagRef.current = newEtag
      }

      // Si el servidor devuelve 304 Not Modified, no hay necesidad de actualizar los datos
      if (response.status === 304) {
        console.log("Stats not modified, using cached data")
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON Response:", responseText.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Stats fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stats")
    } finally {
      if (showLoading && isInitialLoad) {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
  }

  const calculateStats = (signals: Signal[]) => {
    const processedTrades = signals.filter(s => s.processed && s.pnl !== null);

    const totalSignals = signals.length;
    const processedSignals = processedTrades.length;
    const successfulSignals = processedTrades.filter(s => s.success).length;
    const winningTrades = processedTrades.filter(s => s.pnl !== null && s.pnl > 0).length;
    const losingTrades = processedTrades.filter(s => s.pnl !== null && s.pnl < 0).length;

    const totalPnL = processedTrades.reduce((sum, record) => sum + (record.pnl || 0), 0);
    const successRate = processedSignals > 0 ? (successfulSignals / processedSignals) * 100 : 0;
    const winLossRatio = losingTrades > 0 ? winningTrades / losingTrades : winningTrades;

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let cumulativePnL = 0;

    const cumulativeData: Stats['cumulativeData'] = [];

    for (let i = 0; i < processedTrades.length; i++) {
      const trade = processedTrades[i];
      const isWin = (trade.pnl || 0) > 0;

      if (isWin) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }

      cumulativePnL += trade.pnl || 0;

      cumulativeData.push({
        date: new Date(trade.created_at).toISOString().split("T")[0],
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
        dailyPnL: trade.pnl || 0,
        trades: i + 1,
        winStreak: currentWinStreak,
        lossStreak: currentLossStreak,
      });
    }

    const dailyStats = processedTrades.reduce((acc: any[], signal) => {
      const date = new Date(signal.created_at).toISOString().split("T")[0];
      const existing = acc.find(item => item.date === date);

      if (existing) {
        existing.pnl += signal.pnl || 0;
        existing.trades += 1;
        existing.wins += (signal.pnl || 0) > 0 ? 1 : 0;
        existing.losses += (signal.pnl || 0) < 0 ? 1 : 0;
      } else {
        acc.push({
          date,
          pnl: signal.pnl || 0,
          trades: 1,
          wins: (signal.pnl || 0) > 0 ? 1 : 0,
          losses: (signal.pnl || 0) < 0 ? 1 : 0,
        });
      }

      return acc;
    }, []);

    const avgWin = winningTrades
      ? processedTrades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades
      : 0;

    const avgLoss = losingTrades
      ? Math.abs(
          processedTrades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades,
        )
      : 0;

    const profitFactor = avgLoss > 0 && losingTrades > 0 ? (avgWin * winningTrades) / (avgLoss * losingTrades) : 0;

    let maxDrawdown = 0;
    let peak = 0;
    for (const point of cumulativeData) {
      if (point.cumulativePnL > peak) {
        peak = point.cumulativePnL;
      }
      const drawdown = peak - point.cumulativePnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const symbolStats = processedTrades.reduce((acc: any, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { trades: 0, pnl: 0, wins: 0, losses: 0 };
      }
      acc[trade.symbol].trades++;
      acc[trade.symbol].pnl += trade.pnl || 0;
      if ((trade.pnl || 0) > 0) acc[trade.symbol].wins++;
      else acc[trade.symbol].losses++;
      return acc;
    }, {});

    const topSymbols = Object.entries(symbolStats)
      .map(([symbol, stats]: [string, any]) => ({
        symbol,
        ...stats,
        winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10);

    setStats({
      totalSignals,
      processedSignals,
      successfulSignals,
      activeSignals: totalSignals - processedSignals,
      successRate: Math.round(successRate * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winningTrades,
      losingTrades,
      winLossRatio,
      maxWinStreak,
      maxLossStreak,
      currentWinStreak,
      currentLossStreak,
      avgWin,
      avgLoss,
      profitFactor,
      maxDrawdown,
      recentSignals: signals.slice(0, 10),
      cumulativeData,
      dailyStats,
      topSymbols,
      lastUpdated: new Date().toISOString(),
    });
    setLoading(false);
  };

  useEffect(() => {
    if (signals) {
      calculateStats(signals);
    } else {
      fetchStats(true);
      const interval = setInterval(() => fetchStats(false), 30000);
      return () => clearInterval(interval);
    }
  }, [signals]);

  return { stats, loading, error, refetch: () => fetchStats(true) }
}

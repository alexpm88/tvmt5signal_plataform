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

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchStats(true)

    // Auto-refresh every 30 seconds, pero sin mostrar indicador de carga
    const interval = setInterval(() => fetchStats(false), 30000)

    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, refetch: () => fetchStats(true) }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("Stats API called")

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days
    
    // Verificar si hay un ETag en la solicitud
    const ifNoneMatch = request.headers.get("If-None-Match")

    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - Number.parseInt(period))

    console.log("Fetching basic statistics...")

    // Get basic statistics with error handling
    const [
      totalSignalsResult,
      processedSignalsResult,
      successfulSignalsResult,
      recentSignalsResult,
      allSignalsResult,
      winningTradesResult,
      losingTradesResult,
    ] = await Promise.allSettled([
      supabase.from("signals").select("*", { count: "exact", head: true }),
      supabase.from("signals").select("*", { count: "exact", head: true }).eq("processed", true),
      supabase.from("signals").select("*", { count: "exact", head: true }).eq("processed", true).eq("success", true),
      supabase
        .from("signals")
        .select("*")
        .gte("timestamp", periodStart.toISOString())
        .order("timestamp", { ascending: false })
        .limit(10),
      supabase
        .from("signals")
        .select("*")
        .eq("processed", true)
        .not("pnl", "is", null)
        .order("timestamp", { ascending: true }),
      supabase
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("processed", true)
        .eq("success", true)
        .gt("pnl", 0),
      supabase
        .from("signals")
        .select("*", { count: "exact", head: true })
        .eq("processed", true)
        .eq("success", true)
        .lt("pnl", 0),
    ])

    // Extract results with fallbacks
    const totalSignals = totalSignalsResult.status === "fulfilled" ? totalSignalsResult.value.count || 0 : 0
    const processedSignals = processedSignalsResult.status === "fulfilled" ? processedSignalsResult.value.count || 0 : 0
    const successfulSignals =
      successfulSignalsResult.status === "fulfilled" ? successfulSignalsResult.value.count || 0 : 0
    const recentSignals = recentSignalsResult.status === "fulfilled" && recentSignalsResult.value.data ? recentSignalsResult.value.data : []
    const allSignals = allSignalsResult.status === "fulfilled" ? allSignalsResult.value.data || [] : []
    const winningTrades = winningTradesResult.status === "fulfilled" ? winningTradesResult.value.count || 0 : 0
    const losingTrades = losingTradesResult.status === "fulfilled" ? losingTradesResult.value.count || 0 : 0

    console.log("Basic stats fetched:", { totalSignals, processedSignals, successfulSignals })

    // Calculate total P&L and advanced metrics
    const totalPnL = allSignals.reduce((sum, record) => sum + (record.pnl || 0), 0)
    const successRate = processedSignals > 0 ? (successfulSignals / processedSignals) * 100 : 0
    const winLossRatio = losingTrades > 0 ? winningTrades / losingTrades : winningTrades

    // Calculate winning and losing streaks
    let currentWinStreak = 0
    let currentLossStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    let cumulativePnL = 0

    const processedTrades = allSignals.filter((s) => s.processed && s.pnl !== null)

    // Calculate streaks and cumulative data
    const cumulativeData: Array<{
      date: string
      cumulativePnL: number
      dailyPnL: number
      trades: number
      winStreak: number
      lossStreak: number
    }> = []

    for (let i = 0; i < processedTrades.length; i++) {
      const trade = processedTrades[i]
      const isWin = (trade.pnl || 0) > 0

      if (isWin) {
        currentWinStreak++
        currentLossStreak = 0
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
      } else {
        currentLossStreak++
        currentWinStreak = 0
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
      }

      cumulativePnL += trade.pnl || 0

      cumulativeData.push({
        date: new Date(trade.timestamp).toISOString().split("T")[0],
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
        dailyPnL: trade.pnl || 0,
        trades: i + 1,
        winStreak: currentWinStreak,
        lossStreak: currentLossStreak,
      })
    }

    // Group by date for daily statistics
    const dailyStats = processedTrades.reduce((acc: any[], signal) => {
      const date = new Date(signal.timestamp).toISOString().split("T")[0]
      const existing = acc.find((item) => item.date === date)

      if (existing) {
        existing.pnl += signal.pnl || 0
        existing.trades += 1
        existing.wins += (signal.pnl || 0) > 0 ? 1 : 0
        existing.losses += (signal.pnl || 0) < 0 ? 1 : 0
      } else {
        acc.push({
          date,
          pnl: signal.pnl || 0,
          trades: 1,
          wins: (signal.pnl || 0) > 0 ? 1 : 0,
          losses: (signal.pnl || 0) < 0 ? 1 : 0,
        })
      }

      return acc
    }, [])

    // Calculate additional metrics
    const avgWin = winningTrades
      ? processedTrades.filter((t) => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades
      : 0

    const avgLoss = losingTrades
      ? Math.abs(
          processedTrades.filter((t) => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades,
        )
      : 0

    const profitFactor = avgLoss > 0 && losingTrades > 0 ? (avgWin * winningTrades) / (avgLoss * losingTrades) : 0

    // Calculate drawdown
    let maxDrawdown = 0
    let peak = 0
    for (const point of cumulativeData) {
      if (point.cumulativePnL > peak) {
        peak = point.cumulativePnL
      }
      const drawdown = peak - point.cumulativePnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    // Symbol performance
    const symbolStats = processedTrades.reduce((acc: any, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { trades: 0, pnl: 0, wins: 0, losses: 0 }
      }
      acc[trade.symbol].trades++
      acc[trade.symbol].pnl += trade.pnl || 0
      if ((trade.pnl || 0) > 0) acc[trade.symbol].wins++
      else acc[trade.symbol].losses++
      return acc
    }, {})

    const topSymbols = Object.entries(symbolStats)
      .map(([symbol, stats]: [string, any]) => ({
        symbol,
        ...stats,
        winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10)

    const responseData = {
      // Basic stats
      totalSignals,
      processedSignals,
      successfulSignals,
      activeSignals: totalSignals - processedSignals,
      successRate: Math.round(successRate * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winningTrades,
      losingTrades,
      winLossRatio: Math.round(winLossRatio * 100) / 100,

      // Advanced metrics
      maxWinStreak,
      maxLossStreak,
      currentWinStreak,
      currentLossStreak,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,

      // Chart data
      recentSignals,
      cumulativeData,
      dailyStats,
      topSymbols,

      lastUpdated: new Date().toISOString(),
    }

    // Generar un ETag basado en los datos
    const etag = `W/"${Buffer.from(JSON.stringify(responseData)).toString('base64').substring(0, 27)}"`

    // Si el ETag coincide con el proporcionado en la solicitud, devolver 304 Not Modified
    if (ifNoneMatch && ifNoneMatch === etag) {
      console.log("Returning 304 Not Modified for stats")
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'max-age=0, must-revalidate',
        },
      })
    }

    console.log("Returning stats response with ETag")
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

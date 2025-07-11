import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MetaTraderSignalSchema, SignalQuerySchema } from "@/lib/validations"
import { z } from "zod"

// GET - Fetch signals for MetaTrader EA
export async function GET(request: NextRequest) {
  try {
    console.log("Signals API called")

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url)

    const query = SignalQuerySchema.parse({
      unprocessed: searchParams.get("unprocessed") || "",
      symbol: searchParams.get("symbol") || "",
      magic: searchParams.get("magic") || "",
      limit: searchParams.get("limit") || "50",
    })

    console.log("Query params:", query)

    // Build query
    let supabaseQuery = supabase.from("signals").select("*").order("timestamp", { ascending: false })

    if (query.unprocessed === "true") {
      supabaseQuery = supabaseQuery.eq("processed", false)
    }

    if (query.symbol) {
      supabaseQuery = supabaseQuery.eq("symbol", query.symbol)
    }

    if (query.magic) {
      supabaseQuery = supabaseQuery.eq("magic_number", Number.parseInt(query.magic))
    }

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(Number.parseInt(query.limit))
    } else {
      supabaseQuery = supabaseQuery.limit(50)
    }

    // Verificar si hay un ETag en la solicitud
    const ifNoneMatch = request.headers.get("If-None-Match")

    const { data: signals, error } = await supabaseQuery

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Fetched signals:", signals?.length || 0)

    // Get unprocessed count
    const { count: unprocessedCount, error: countError } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .eq("processed", false)

    if (countError) {
      console.error("Count error:", countError)
    }

    const responseData = {
      signals:
        signals?.map((signal) => ({
          id: signal.id,
          symbol: signal.symbol,
          action: signal.action,
          order: signal.order_type,
          stopLoss: signal.stop_loss,
          takeProfit: signal.take_profit,
          volume: signal.volume,
          comment: signal.comment,
          timestamp: signal.timestamp,
          processed: signal.processed,
          success: signal.success,
          entry_price: signal.entry_price,
          exit_price: signal.exit_price,
          pnl: signal.pnl,
          created_at: signal.created_at,
          updated_at: signal.updated_at,
        })) || [],
      count: signals?.length || 0,
      unprocessed_count: unprocessedCount || 0,
      lastUpdated: new Date().toISOString(),
    }

    // Generar un ETag basado en los datos
    const etag = `W/"${Buffer.from(JSON.stringify(responseData)).toString('base64').substring(0, 27)}"`

    // Si el ETag coincide con el proporcionado en la solicitud, devolver 304 Not Modified
    if (ifNoneMatch && ifNoneMatch === etag) {
      console.log("Returning 304 Not Modified for signals")
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'max-age=0, must-revalidate',
        },
      })
    }

    console.log("Returning signals response with ETag")
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error("Error fetching signals:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch signals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Mark signal as processed (from MetaTrader EA)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id, success, entryPrice, exitPrice, pnl } = MetaTraderSignalSchema.parse(body)

    const updateData: any = {
      processed: true,
      success,
      updated_at: new Date().toISOString(),
    }

    if (entryPrice) updateData.entry_price = entryPrice
    if (exitPrice) {
      updateData.exit_price = exitPrice
      updateData.closed_at = new Date().toISOString()
    }
    if (pnl !== undefined) updateData.pnl = pnl

    const { data: updatedSignal, error } = await supabase
      .from("signals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: "Signal marked as processed",
      signal: updatedSignal,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    console.error("Error updating signal:", error)
    return NextResponse.json({ error: "Failed to update signal" }, { status: 500 })
  }
}

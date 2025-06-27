import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// POST - Create manual signal
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: signal, error } = await supabase
      .from("signals")
      .insert({
        symbol: body.symbol,
        action: body.action,
        entry_price: body.entry_price,
        stop_loss: body.stop_loss,
        take_profit: body.take_profit,
        volume: body.volume || 0.01,
        comment: body.comment || "Manual signal",
        processed: false,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: "Signal created successfully",
      signal,
    })
  } catch (error) {
    console.error("Error creating signal:", error)
    return NextResponse.json({ error: "Failed to create signal" }, { status: 500 })
  }
}

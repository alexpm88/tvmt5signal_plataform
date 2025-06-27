import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { TradingViewWebhookSchema } from "@/lib/validations"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Verify webhook authenticity (optional)
    const webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get("x-webhook-signature")
      // Add signature verification logic here if needed
    }

    const body = await request.json()
    console.log("Received TradingView webhook:", body)

    const validatedData = TradingViewWebhookSchema.parse(body)

    // Create new signal in database
    const { data: signal, error } = await supabase
      .from("signals")
      .insert({
        symbol: validatedData.symbol,
        action: validatedData.action,
        stop_loss: validatedData.stopLoss,
        take_profit: validatedData.takeProfit,
        volume: validatedData.volume || 0.01,
        comment: validatedData.comment || "TradingView Alert",
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp).toISOString() : new Date().toISOString(),
        processed: false,
        entry_price: validatedData.price,
      })
      .select()
      .single()

    if (error) throw error

    console.log("Signal created:", signal)

    return NextResponse.json({
      message: "Signal received and stored",
      signalId: signal.id,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json({ error: "Invalid webhook data", details: error.errors }, { status: 400 })
    }

    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

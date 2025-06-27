import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// PUT - Update signal
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id } = params

    const { data: updatedSignal, error } = await supabase
      .from("signals")
      .update({
        symbol: body.symbol,
        action: body.action,
        entry_price: body.entry_price,
        exit_price: body.exit_price,
        stop_loss: body.stop_loss,
        take_profit: body.take_profit,
        volume: body.volume,
        pnl: body.pnl,
        comment: body.comment,
        processed: body.processed,
        success: body.success,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: "Signal updated successfully",
      signal: updatedSignal,
    })
  } catch (error) {
    console.error("Error updating signal:", error)
    return NextResponse.json({ error: "Failed to update signal" }, { status: 500 })
  }
}

// DELETE - Delete signal
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { error } = await supabase.from("signals").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({
      message: "Signal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting signal:", error)
    return NextResponse.json({ error: "Failed to delete signal" }, { status: 500 })
  }
}

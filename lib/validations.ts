import { z } from "zod"

export const TradingViewWebhookSchema = z.object({
  symbol: z.string().min(1),
  action: z.enum(["BUY", "SELL"]),
  price: z.number().optional(),
  volume: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  comment: z.string().optional(),
  timestamp: z.string().optional(),
  id: z.string().optional(),
})

export const MetaTraderSignalSchema = z.object({
  id: z.string(),
  success: z.boolean(),
  entryPrice: z.number().optional(),
  exitPrice: z.number().optional(),
  pnl: z.number().optional(),
})

export const SignalQuerySchema = z.object({
  unprocessed: z.string().optional(),
  symbol: z.string().optional(),
  magic: z.string().optional(),
  limit: z.string().optional(),
})

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { config, validateConfig, debugConfig } from "./config"

// Validate configuration on import
try {
  validateConfig()

  // Debug en desarrollo
  if (process.env.NODE_ENV === "development") {
    debugConfig()
  }
} catch (error) {
  console.error("Supabase configuration error:", error)
}

// Singleton pattern for client-side Supabase client
let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    try {
      console.log("🔌 Initializing Supabase client...")
      console.log("URL:", config.supabase.url)
      console.log("Key (first 20 chars):", config.supabase.anonKey?.substring(0, 20) + "...")

      supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })

      console.log("✅ Supabase client initialized successfully")
    } catch (error) {
      console.error("❌ Failed to create Supabase client:", error)
      throw new Error("Failed to initialize Supabase client")
    }
  }
  return supabaseInstance
}

// For backward compatibility
export const supabase = getSupabaseClient()

// Server-side client for API routes
export const createServerClient = () => {
  try {
    if (!config.supabase.serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
    }

    console.log("🔌 Creating server Supabase client...")

    const client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    console.log("✅ Server Supabase client created successfully")
    return client
  } catch (error) {
    console.error("❌ Failed to create server Supabase client:", error)
    throw new Error("Failed to initialize server Supabase client")
  }
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log("🧪 Testing Supabase connection...")

    const client = getSupabaseClient()
    const { data, error } = await client.from("signals").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Supabase connection test failed:", error)

      // Provide specific error messages
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return {
          success: false,
          error: "La tabla 'signals' no existe. Ejecuta el script SQL de configuración.",
        }
      } else if (error.message.includes("Invalid API key")) {
        return {
          success: false,
          error: "Clave API inválida. Verifica las credenciales de Supabase.",
        }
      } else {
        return { success: false, error: error.message }
      }
    }

    console.log("✅ Supabase connection test successful")
    return { success: true, message: "Connection successful" }
  } catch (error) {
    console.error("❌ Supabase connection test error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown connection error",
    }
  }
}

export type Signal = {
  id: string
  symbol: string
  action: "BUY" | "SELL"
  order_type?: string
  stop_loss?: number
  take_profit?: number
  volume?: number
  comment?: string
  timestamp: string
  processed: boolean
  success?: boolean
  magic_number?: number
  entry_price?: number
  exit_price?: number
  pnl?: number
  closed_at?: string
  created_at: string
  updated_at: string
}

// Configuration file to handle environment variables properly
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kuxqrpwnihyivwrpvjrc.supabase.co",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY || // Fallback para compatibilidad
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eHFycHduaWh5aXZ3cnB2anJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzU2NTcsImV4cCI6MjA2NjUxMTY1N30.hTJ00GgOQtxo369B8xA62y31KgvxVt47_NrFoLF-j-g",
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eHFycHduaWh5aXZ3cnB2anJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzNTY1NywiZXhwIjoyMDY2NTExNjU3fQ.YWWefvRCwHre0dgIZpWjDYjoBGoKul6wxZPti2kyzhg",
  },
  admin: {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "twmt5signal@gmail.com",
  },
}

// Validate configuration
export function validateConfig() {
  const errors: string[] = []

  if (!config.supabase.url) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is missing")
  }

  if (!config.supabase.anonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY is missing")
  }

  if (!config.supabase.serviceRoleKey) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is missing")
  }

  if (errors.length > 0) {
    console.warn("Configuration warnings:", errors.join(", "))
    console.log("Using fallback values...")
  }

  return true
}

// Debug function to check what values are being used
export function debugConfig() {
  console.log("🔧 Supabase Configuration Debug:")
  console.log("URL:", config.supabase.url)
  console.log("Anon Key (first 20 chars):", config.supabase.anonKey?.substring(0, 20) + "...")
  console.log("Service Role Key (first 20 chars):", config.supabase.serviceRoleKey?.substring(0, 20) + "...")
  console.log("Admin Email:", config.admin.email)

  // Check environment variables
  console.log("\n📋 Environment Variables:")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")
}

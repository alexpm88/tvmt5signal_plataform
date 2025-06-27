import { config } from "./config"
import { testSupabaseConnection } from "./supabase"

export async function runDiagnostics() {
  console.log("🔍 Running TVMT5 Signal Platform Diagnostics...")
  console.log("=".repeat(50))

  // 1. Check environment variables
  console.log("\n📋 Environment Variables:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")

  // 2. Check configuration
  console.log("\n⚙️ Configuration:")
  console.log("Supabase URL:", config.supabase.url)
  console.log("Anon Key (first 20):", config.supabase.anonKey?.substring(0, 20) + "...")
  console.log("Service Key (first 20):", config.supabase.serviceRoleKey?.substring(0, 20) + "...")
  console.log("Admin Email:", config.admin.email)

  // 3. Test connection
  console.log("\n🔌 Testing Database Connection:")
  const connectionResult = await testSupabaseConnection()
  if (connectionResult.success) {
    console.log("✅ Database connection successful")
  } else {
    console.log("❌ Database connection failed:", connectionResult.error)
  }

  console.log("\n" + "=".repeat(50))
  console.log("🏁 Diagnostics complete!")

  return {
    envVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseKey: !!process.env.SUPABASE_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    connection: connectionResult,
  }
}

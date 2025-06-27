import { createServerClient } from "./supabase"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "tu-email-admin@gmail.com"

export interface AdminUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  google_id?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export async function isAdminUser(email: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.rpc("is_admin_user", { user_email: email })

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return data === true
  } catch (error) {
    console.error("Error in isAdminUser:", error)
    return false
  }
}

export async function getAdminUser(email: string): Promise<AdminUser | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return null
    }

    return data as AdminUser
  } catch (error) {
    console.error("Error getting admin user:", error)
    return null
  }
}

export async function updateAdminLastLogin(email: string, googleId?: string): Promise<void> {
  try {
    const supabase = createServerClient()

    const updateData: any = {
      last_login: new Date().toISOString(),
    }

    if (googleId) {
      updateData.google_id = googleId
    }

    await supabase.from("admin_users").update(updateData).eq("email", email)
  } catch (error) {
    console.error("Error updating admin last login:", error)
  }
}

export function isValidAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL
}

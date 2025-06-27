import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { isValidAdminEmail } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/signin?error=auth_error`)
      }

      if (data.user?.email) {
        // Check if the email is the authorized admin email
        if (!isValidAdminEmail(data.user.email)) {
          // Sign out unauthorized user
          await supabase.auth.signOut()
          return NextResponse.redirect(`${requestUrl.origin}/signin?error=unauthorized`)
        }
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=unexpected`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`)
}

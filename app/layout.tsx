import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toaster"
import { TradingNavbar } from "@/components/ui/resizable-navbar"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradingView Signals Platform",
  description: "Professional trading signals management with real-time analytics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TradingNavbar />
          <div className="pt-20">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

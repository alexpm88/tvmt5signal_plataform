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
        {/* Grid background for entire page - nuevo diseño con gradientes lineales */}
        <div
          className="fixed inset-0 h-full w-full z-[-1] bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>
        <div className="fixed top-0 left-0 right-0 h-[20vh] w-full z-[-1] bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <AuthProvider>
          <TradingNavbar />
          <div className="pt-20">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

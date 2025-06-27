"use client"

import { useState, useEffect } from "react"
import type { Signal } from "@/lib/supabase"

export function useSignals() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSignals = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/signals?limit=100", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON Response:", responseText.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      setSignals(data.signals || [])
    } catch (err) {
      console.error("Signals fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch signals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [])

  return { signals, loading, error, refetch: fetchSignals }
}

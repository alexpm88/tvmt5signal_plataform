"use client"

import { useState, useEffect } from "react"
import { SignalsDashboard } from "@/components/signals-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { useSignals } from "@/hooks/use-signals"
import { ProtectedRoute } from "@/components/protected-route"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { signals, loading, error, refetch: fetchSignals } = useSignals()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Análisis Público
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {loading || !isClient ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <div className="text-red-500 text-xl font-semibold">Error loading signals</div>
                <p className="text-slate-600">{error}</p>
              </div>
            ) : (
              <SignalsDashboard signals={signals} onRefresh={fetchSignals} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

"use client"

import { SignalsDashboard } from "@/components/signals-dashboard"
import { useSignals } from "@/hooks/use-signals"
import { ProtectedRoute } from "@/components/protected-route"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { signals, loading, error, refetch } = useSignals()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            {loading ? (
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
              <SignalsDashboard signals={signals} onRefresh={refetch} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

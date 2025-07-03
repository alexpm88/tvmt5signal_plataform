"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getSupabaseClient, testSupabaseConnection } from "./supabase"

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  error: string | null
  clearError: () => void
  connectionStatus: "checking" | "connected" | "disconnected"
}

interface AdminUser {
  id: string
  email: string
  name?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "tvmt5_admin_user"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearUserData = useCallback(() => {
    setUser(null)
    setIsAdmin(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setUserData = useCallback((userData: AdminUser) => {
    setUser(userData)
    setIsAdmin(true)
    if (typeof window !== "undefined") {
      const sessionData = {
        user: userData,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
    }
  }, [])

  const isSessionValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < SESSION_DURATION
  }, [])

  // Test database connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus("checking")
        const result = await testSupabaseConnection()

        if (result.success) {
          setConnectionStatus("connected")
        } else {
          setConnectionStatus("disconnected")
          setError(`Error de conexión: ${result.error}`)
        }
      } catch (error) {
        setConnectionStatus("disconnected")
        setError("No se puede conectar a la base de datos")
        console.error("Connection test failed:", error)
      }
    }

    checkConnection()
  }, [])

  // Check stored authentication on mount
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false)
          return
        }

        const storedData = localStorage.getItem(STORAGE_KEY)
        if (!storedData) {
          setLoading(false)
          return
        }

        const sessionData = JSON.parse(storedData)
        if (!sessionData.user || !sessionData.timestamp) {
          localStorage.removeItem(STORAGE_KEY)
          setLoading(false)
          return
        }

        // Check if session is still valid
        if (!isSessionValid(sessionData.timestamp)) {
          localStorage.removeItem(STORAGE_KEY)
          setLoading(false)
          return
        }

        // Session is valid, restore user
        setUser(sessionData.user)
        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking stored auth:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY)
        }
      } finally {
        setLoading(false)
      }
    }

    // Only check stored auth if connection is successful
    if (connectionStatus === "connected") {
      checkStoredAuth()
    } else if (connectionStatus === "disconnected") {
      setLoading(false)
    }
  }, [isSessionValid, connectionStatus])

  // Add better error handling and fallback for missing functions
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true)
        setError(null)

        if (connectionStatus !== "connected") {
          throw new Error("No hay conexión con la base de datos. Verifica tu configuración.")
        }

        if (!email || !password) {
          throw new Error("Email y contraseña son requeridos")
        }

        const supabase = getSupabaseClient()

        // First check if the function exists by trying to call it
        const { data, error } = await supabase.rpc("authenticate_admin", {
          user_email: email.trim().toLowerCase(),
          user_password: password,
        })

        if (!data || data.length === 0) {
          throw new Error(
            "❌ Credenciales inválidas\n\n💡 Credenciales por defecto:\nEmail: twmt5signal@gmail.com\nContraseña: admin123!",
          )
        }

        const userData = data[0]
        if (!userData.user_id || !userData.user_email) {
          throw new Error("Respuesta de autenticación inválida")
        }

        const adminUser: AdminUser = {
          id: userData.user_id,
          email: userData.user_email,
          name: userData.user_name || "Admin User",
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Update last login in database
        try {
          await supabase
            .from("admin_users")
            .update({
              last_login: new Date().toISOString(),
            })
            .eq("email", email.trim().toLowerCase())
        } catch (updateError) {
          console.warn("Failed to update last login:", updateError)
          // Don't fail the login for this
        }

        setUserData(adminUser)
      } catch (error) {
        console.error("Sign in error:", error)
        const errorMessage = error instanceof Error ? error.message : "Error de autenticación"
        setError(errorMessage)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [connectionStatus, setUserData],
  )

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      clearUserData()
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Error al cerrar sesión")
    } finally {
      setLoading(false)
    }
  }, [clearUserData])

  // Auto sign out when session expires
  useEffect(() => {
    if (!user) return

    const checkSessionExpiry = () => {
      if (typeof window === "undefined") return

      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) {
        clearUserData()
        return
      }

      try {
        const sessionData = JSON.parse(storedData)
        if (!isSessionValid(sessionData.timestamp)) {
          clearUserData()
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        }
      } catch (error) {
        console.error("Error checking session expiry:", error)
        clearUserData()
      }
    }

    // Check session expiry every 5 minutes
    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, isSessionValid, clearUserData])

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
    error,
    clearError,
    connectionStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

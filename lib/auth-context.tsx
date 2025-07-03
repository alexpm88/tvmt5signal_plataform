"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  error: string | null
  clearError: () => void

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
  const supabase = createClient()

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



  // Check stored authentication on mount
  useEffect(() => {
    const checkStoredAuth = () => {
      setLoading(true)
      try {
        if (typeof window === "undefined") {
          return
        }

        const storedData = localStorage.getItem(STORAGE_KEY)
        if (!storedData) {
          return
        }

        const sessionData = JSON.parse(storedData)
        if (!sessionData.user || !sessionData.timestamp) {
          localStorage.removeItem(STORAGE_KEY)
          return
        }

        if (!isSessionValid(sessionData.timestamp)) {
          localStorage.removeItem(STORAGE_KEY)
          return
        }

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

    checkStoredAuth()
  }, [isSessionValid])

  // Add better error handling and fallback for missing functions
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true)
        setError(null)



        if (!email || !password) {
          throw new Error("Email y contraseña son requeridos")
        }



        // First check if the function exists by trying to call it
        const { data: users, error: userError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", email.trim().toLowerCase())

        if (userError) {
          throw new Error("Error al consultar el usuario")
        }

        if (!users || users.length === 0) {
          throw new Error(
            "❌ Credenciales inválidas\n\n💡 Credenciales por defecto:\nEmail: twmt5signal@gmail.com\nContraseña: admin123!",
          )
        }

        const user = users[0]

        // This is a placeholder for password hashing. 
        // In a real application, you should use a library like bcrypt to compare hashes.
        const passwordMatch = user.password_hash === password 

        if (!passwordMatch) {
          throw new Error(
            "❌ Credenciales inválidas\n\n💡 Credenciales por defecto:\nEmail: twmt5signal@gmail.com\nContraseña: admin123!",
          )
        }

        const userData = {
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
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
    [setUserData],
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

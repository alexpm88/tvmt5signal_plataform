"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import {
  Loader2,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  X,
  Database,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { signIn, user, isAdmin, error, clearError, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already authenticated and is admin
    if (isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  useEffect(() => {
    // Clear error when component mounts
    clearError()
    setLocalError(null)
  }, [clearError])
  
  // Sincronizar errores entre el contexto de autenticación y el estado local
  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setLocalError("Por favor, ingresa tu email y contraseña")
      return
    }

    try {
      clearError()
      setLocalError(null)
      await signIn(email, password)
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setLocalError(error.message)
      } else {
        setLocalError("Error al iniciar sesión")
      }
    }
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none"></div>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>




          {/* Sign In Card */}
          <Card className="border-0 bg-gradient-to-b from-white to-transparent backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-4">
                <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center mb-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg border border-slate-200">
                  <img src="/logo-tvmt5-signal.svg" alt="TVMT5 Signal Logo" className="h-16 w-16 object-contain" />
                </div>
              </motion.div>

              <h1 className="text-2xl font-bold text-slate-900 mb-2">TVMT5 Signal</h1>
              <p className="text-slate-600">bienvenido</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {(localError || error) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-start justify-between">
                      <div className="whitespace-pre-line text-sm flex-1">{localError || error}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          clearError();
                          setLocalError(null);
                        }} 
                        className="h-auto p-1 ml-2 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu-email@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !email || !password}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-3" />
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-3" />
                          Iniciar Sesión
                        </>
                      )}
                    </Button>
                  </form>

              {/* Session Info */}
              <div className="text-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                <p>La sesión permanecerá activa por 24 horas</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">© 2024 TVMT5 Signal Platform. Todos los derechos reservados.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

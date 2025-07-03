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
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { signIn, user, isAdmin, error, clearError, connectionStatus } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already authenticated and is admin
    if (user) {
      router.push("/dashboard")
    }
  }, [user, isAdmin, router])
  
  // Efecto para iniciar sesión automáticamente con credenciales por defecto
  useEffect(() => {
    const defaultEmail = "twmt5signal@gmail.com"
    const defaultPassword = "admin123!"
    
    // Si los campos coinciden con las credenciales por defecto, intentar iniciar sesión automáticamente
    if (
      email === defaultEmail && 
      password === defaultPassword && 
      !loading
    ) {
      const timer = setTimeout(async () => {
        try {
          setLoading(true)
          clearError()
          setLocalError(null)
          
          // Crear un usuario simulado para mantener la sesión
          const mockUser = {
            id: "default-admin",
            email: defaultEmail,
            name: "Admin User",
            is_active: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // Guardar en localStorage para mantener la sesión
          if (typeof window !== "undefined") {
            const sessionData = {
              user: mockUser,
              timestamp: Date.now(),
            }
            localStorage.setItem("tvmt5_admin_user", JSON.stringify(sessionData))
          }
          
          // Redirigir al dashboard
          router.push("/dashboard")
        } catch (error) {
          console.error("Login error:", error)
          if (error instanceof Error) {
            setLocalError(error.message)
          } else {
            setLocalError("Error al iniciar sesión")
          }
          setLoading(false)
        }
      }, 500) // Retraso de 500ms para evitar múltiples intentos
      
      return () => clearTimeout(timer)
    }
  }, [email, password, loading, router, clearError])

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
    
    // Validar que se hayan ingresado email y password
    if (!email || !password) {
      setLocalError("Por favor, ingresa tu email y contraseña")
      return
    }
    
    // Verificar si son las credenciales por defecto
    const defaultEmail = "twmt5signal@gmail.com"
    const defaultPassword = "admin123!"
    
    try {
      setLoading(true)
      clearError()
      setLocalError(null)
      
      // Si coinciden con las credenciales por defecto, permitir acceso directo sin verificar en Supabase
      if (email === defaultEmail && password === defaultPassword) {
        // Crear un usuario simulado para mantener la sesión
        const mockUser = {
          id: "default-admin",
          email: defaultEmail,
          name: "Admin User",
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Guardar en localStorage para mantener la sesión
        if (typeof window !== "undefined") {
          const sessionData = {
            user: mockUser,
            timestamp: Date.now(),
          }
          localStorage.setItem("tvmt5_admin_user", JSON.stringify(sessionData))
        }
        
        // Redirigir al dashboard
        router.push("/dashboard")
      } else {
        // Para credenciales no predeterminadas, intentar el proceso normal
        try {
          await signIn(email, password)
          router.push("/dashboard")
        } catch (error) {
          throw error
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setLocalError(error.message)
      } else {
        setLocalError("Error al iniciar sesión")
      }
      setLoading(false)
    }
  }

  const fillDefaultCredentials = async () => {
    const defaultEmail = "twmt5signal@gmail.com"
    const defaultPassword = "admin123!"
    
    setEmail(defaultEmail)
    setPassword(defaultPassword)
    
    // Iniciar sesión automáticamente con credenciales por defecto
    try {
      setLoading(true)
      clearError()
      setLocalError(null)
      
      // Crear un usuario simulado para mantener la sesión
      const mockUser = {
        id: "default-admin",
        email: defaultEmail,
        name: "Admin User",
        is_active: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Guardar en localStorage para mantener la sesión
      if (typeof window !== "undefined") {
        const sessionData = {
          user: mockUser,
          timestamp: Date.now(),
        }
        localStorage.setItem("tvmt5_admin_user", JSON.stringify(sessionData))
      }
      
      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setLocalError(error.message)
      } else {
        setLocalError("Error al iniciar sesión")
      }
      setLoading(false)
    }
  }

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "checking":
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verificando conexión...</span>
          </div>
        )
      case "connected":
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Base de datos conectada</span>
          </div>
        )
      case "disconnected":
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Sin conexión a la base de datos</span>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none"></div>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo and Title */}
          <div className="text-center mb-8">
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
            <p className="text-slate-600">Panel de Administración</p>
            
            {/* Botón de Análisis */}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href="/">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análisis
                </Link>
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <Card className="border-0 bg-gradient-to-b from-white to-transparent backdrop-blur-sm shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Estado de conexión</span>
                  </div>
                  {getConnectionStatusDisplay()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign In Card */}
          <Card className="border-0 bg-gradient-to-b from-white to-transparent backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription className="text-sm">
                Ingresa tus credenciales para acceder al panel administrativo
              </CardDescription>
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

              {connectionStatus === "disconnected" && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p className="font-medium text-red-700">⚠️ Sin conexión a la base de datos</p>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="font-medium text-red-900 mb-2">🔧 Para configurar:</p>
                        <ol className="list-decimal list-inside text-sm space-y-1 ml-4 text-red-800">
                          <li>
                            Ve a <strong>Supabase Dashboard</strong>
                          </li>
                          <li>
                            Abre el <strong>SQL Editor</strong>
                          </li>
                          <li>
                            Ejecuta el script <code>final-admin-setup.sql</code>
                          </li>
                          <li>Recarga esta página</li>
                        </ol>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "connected" && (
                <>
                  {/* Default Credentials Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm flex-1">
                        <p className="font-medium text-blue-900 mb-2">🔑 Credenciales por defecto:</p>
                        <div className="space-y-1 text-blue-700">
                          <p>
                            <strong>Email:</strong> twmt5signal@gmail.com
                          </p>
                          <p>
                            <strong>Contraseña:</strong> admin123!
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={fillDefaultCredentials}
                          className="mt-3 text-blue-700 border-blue-300 hover:bg-blue-100 bg-transparent"
                        >
                          Usar credenciales por defecto
                        </Button>
                      </div>
                    </div>
                  </div>

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
                          disabled={loading || connectionStatus !== "connected"}
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
                          disabled={loading || connectionStatus !== "connected"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                          disabled={loading || connectionStatus !== "connected"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !email || !password || connectionStatus !== "connected"}
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
                </>
              )}

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

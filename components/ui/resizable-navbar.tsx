"use client"

import { cn } from "@/lib/utils"
import { IconMenu2, IconX } from "@tabler/icons-react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import React, { useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useStats } from "@/hooks/use-stats"
import { useAuth } from "@/lib/auth-context"
import { TrendingUp, Activity, DollarSign, Target, User, LogOut, BarChart3 } from "lucide-react"

interface NavbarProps {
  children: React.ReactNode
  className?: string
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

interface MobileNavProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

interface MobileNavHeaderProps {
  children: React.ReactNode
  className?: string
}

interface MobileNavMenuProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const [visible, setVisible] = useState<boolean>(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  return (
    <motion.div ref={ref} className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child,
      )}
    </motion.div>
  )
}

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "95%" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-6 py-3 lg:flex",
        visible && "bg-white/90 backdrop-blur-md shadow-lg",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "95%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "1rem" : "0px",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-4 py-3 lg:hidden",
        visible && "bg-white/90 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>
}

export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white/95 backdrop-blur-md px-4 py-6 shadow-xl border border-slate-200",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean
  onClick: () => void
}) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="p-2">
      {isOpen ? <IconX className="h-5 w-5 text-slate-700" /> : <IconMenu2 className="h-5 w-5 text-slate-700" />}
    </Button>
  )
}

export const NavbarLogo = () => {
  return (
    <Link href="/" className="relative z-20 flex items-center space-x-3 px-2 py-1 text-sm font-semibold text-slate-900">
      <div className="flex h-10 w-10 items-center justify-center">
        <img src="/logo-tvmt5-signal.svg" alt="TVMT5 Signal Logo" className="h-8 w-8 object-contain" />
      </div>
      <span className="font-bold text-slate-900 hidden sm:block">TVMT5 Signal</span>
    </Link>
  )
}

export const NavbarStats = () => {
  const { stats, loading, error } = useStats()
  const pathname = usePathname()

  // Only show stats on home page
  if (pathname !== "/" || loading || error || !stats) return null

  const statsData = [
    {
      label: "Signals",
      value: stats.totalSignals.toLocaleString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: Target,
      color:
        stats.successRate >= 70 ? "text-emerald-600" : stats.successRate >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: stats.successRate >= 70 ? "bg-emerald-100" : stats.successRate >= 50 ? "bg-yellow-100" : "bg-red-100",
    },
    {
      label: "P&L",
      value: `$${stats.totalPnL.toLocaleString()}`,
      icon: DollarSign,
      color: stats.totalPnL > 0 ? "text-emerald-600" : stats.totalPnL < 0 ? "text-red-600" : "text-slate-600",
      bgColor: stats.totalPnL > 0 ? "bg-emerald-100" : stats.totalPnL < 0 ? "bg-red-100" : "bg-slate-100",
    },
    {
      label: "Active",
      value: stats.activeSignals.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="hidden lg:flex items-center space-x-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-2"
        >
          <div className={cn("p-2 rounded-lg", stat.bgColor)}>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="text-center">
            <div className={cn("text-sm font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export const NavbarActions = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
  }

  if (pathname === "/") {
    // Home page - show Sign In or user info
    if (user && isAdmin) {
      return (
        <div className="flex items-center space-x-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 hidden sm:block">{user.name || user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-3">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/signin">
          <Button size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  if (pathname === "/dashboard") {
    // Dashboard page - show user menu
    return (
      <div className="flex items-center space-x-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 hidden sm:block">{user?.name || user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}

export const NavbarMobileStats = () => {
  const { stats, loading, error } = useStats()
  const pathname = usePathname()

  if (pathname !== "/" || loading || error || !stats) return null

  return (
    <div className="grid grid-cols-2 gap-3 w-full mt-4">
      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
        <Activity className="h-4 w-4 text-blue-600" />
        <div>
          <div className="text-sm font-bold text-blue-600">{stats.totalSignals}</div>
          <div className="text-xs text-slate-500">Signals</div>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg">
        <Target className="h-4 w-4 text-emerald-600" />
        <div>
          <div className="text-sm font-bold text-emerald-600">{stats.successRate}%</div>
          <div className="text-xs text-slate-500">Success</div>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
        <DollarSign className="h-4 w-4 text-purple-600" />
        <div>
          <div className="text-sm font-bold text-purple-600">${stats.totalPnL}</div>
          <div className="text-xs text-slate-500">P&L</div>
        </div>
      </div>
      <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
        <TrendingUp className="h-4 w-4 text-orange-600" />
        <div>
          <div className="text-sm font-bold text-orange-600">{stats.activeSignals}</div>
          <div className="text-xs text-slate-500">Active</div>
        </div>
      </div>
    </div>
  )
}

// Main Navbar Component
export const TradingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
    setIsOpen(false)
  }

  return (
    <Navbar>
      {/* Desktop Navbar */}
      <NavBody>
        <NavbarLogo />
        <NavbarStats />
        <NavbarActions />
      </NavBody>

      {/* Mobile Navbar */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <NavbarMobileStats />

          <div className="flex flex-col space-y-3 w-full mt-4">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>

            {user && isAdmin ? (
              <Button onClick={handleSignOut} variant="outline" className="w-full justify-start bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            ) : (
              <Link href="/signin" onClick={() => setIsOpen(false)}>
                <Button className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}

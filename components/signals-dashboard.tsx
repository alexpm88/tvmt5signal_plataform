"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { Edit, Trash2, Plus, Search, Filter, Download, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { Signal } from "@/lib/supabase"
import { AdvancedCharts } from "./advanced-charts"

interface SignalsDashboardProps {
  signals: Signal[]
  onRefresh: () => void
  loading: boolean
}

export function SignalsDashboard({ signals, onRefresh, loading }: SignalsDashboardProps) {
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>(signals)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  // Filter signals based on search and status
  useEffect(() => {
    let filtered = signals

    if (searchTerm) {
      filtered = filtered.filter(
        (signal) =>
          signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          signal.comment?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((signal) => !signal.processed)
      } else if (statusFilter === "success") {
        filtered = filtered.filter((signal) => signal.processed && signal.success)
      } else if (statusFilter === "failed") {
        filtered = filtered.filter((signal) => signal.processed && !signal.success)
      }
    }

    setFilteredSignals(filtered)
  }, [signals, searchTerm, statusFilter])

  const getStatusBadge = (signal: Signal) => {
    if (!signal.processed) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Pending
        </Badge>
      )
    }

    if (signal.success) {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
          Success
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
        Failed
      </Badge>
    )
  }

  const getPnLColor = (pnl?: number) => {
    if (!pnl) return "text-slate-500"
    return pnl > 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"
  }

  const handleEdit = (signal: Signal) => {
    setEditingSignal(signal)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (signalId: string) => {
    try {
      const response = await fetch(`/api/signals/${signalId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete signal")

      toast({
        title: "Signal deleted",
        description: "The signal has been successfully deleted.",
      })

      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete signal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = async (formData: FormData) => {
    if (!editingSignal) return

    try {
      const response = await fetch(`/api/signals/${editingSignal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: formData.get("symbol"),
          action: formData.get("action"),
          entry_price: formData.get("entry_price") ? Number(formData.get("entry_price")) : null,
          exit_price: formData.get("exit_price") ? Number(formData.get("exit_price")) : null,
          stop_loss: formData.get("stop_loss") ? Number(formData.get("stop_loss")) : null,
          take_profit: formData.get("take_profit") ? Number(formData.get("take_profit")) : null,
          volume: formData.get("volume") ? Number(formData.get("volume")) : null,
          pnl: formData.get("pnl") ? Number(formData.get("pnl")) : null,
          comment: formData.get("comment"),
          processed: formData.get("processed") === "true",
          success: formData.get("success") === "true",
        }),
      })

      if (!response.ok) throw new Error("Failed to update signal")

      toast({
        title: "Signal updated",
        description: "The signal has been successfully updated.",
      })

      setIsEditDialogOpen(false)
      setEditingSignal(null)
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update signal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddSignal = async (formData: FormData) => {
    try {
      const response = await fetch("/api/signals/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: formData.get("symbol"),
          action: formData.get("action"),
          entry_price: formData.get("entry_price") ? Number(formData.get("entry_price")) : null,
          stop_loss: formData.get("stop_loss") ? Number(formData.get("stop_loss")) : null,
          take_profit: formData.get("take_profit") ? Number(formData.get("take_profit")) : null,
          volume: formData.get("volume") ? Number(formData.get("volume")) : 0.01,
          comment: formData.get("comment") || "Manual signal",
        }),
      })

      if (!response.ok) throw new Error("Failed to create signal")

      toast({
        title: "Signal created",
        description: "The signal has been successfully created.",
      })

      setIsAddDialogOpen(false)
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create signal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Symbol", "Action", "Entry Price", "Exit Price", "P&L", "Status", "Timestamp"].join(","),
      ...filteredSignals.map((signal) =>
        [
          signal.symbol,
          signal.action,
          signal.entry_price || "",
          signal.exit_price || "",
          signal.pnl || "",
          signal.processed ? (signal.success ? "Success" : "Failed") : "Pending",
          new Date(signal.timestamp).toLocaleString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `signals-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Advanced Charts */}
      <AdvancedCharts signals={filteredSignals} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Signals Management</h2>
          <p className="text-slate-600">Manage and monitor your trading signals</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Signal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form action={handleAddSignal}>
                <DialogHeader>
                  <DialogTitle>Add New Signal</DialogTitle>
                  <DialogDescription>Create a new trading signal manually.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="symbol" className="text-right">
                      Symbol
                    </Label>
                    <Input id="symbol" name="symbol" placeholder="EURUSD" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="action" className="text-right">
                      Action
                    </Label>
                    <Select name="action" required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="entry_price" className="text-right">
                      Entry Price
                    </Label>
                    <Input
                      id="entry_price"
                      name="entry_price"
                      type="number"
                      step="0.00001"
                      placeholder="1.08500"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stop_loss" className="text-right">
                      Stop Loss
                    </Label>
                    <Input
                      id="stop_loss"
                      name="stop_loss"
                      type="number"
                      step="0.00001"
                      placeholder="1.08000"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="take_profit" className="text-right">
                      Take Profit
                    </Label>
                    <Input
                      id="take_profit"
                      name="take_profit"
                      type="number"
                      step="0.00001"
                      placeholder="1.09000"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="volume" className="text-right">
                      Volume
                    </Label>
                    <Input
                      id="volume"
                      name="volume"
                      type="number"
                      step="0.01"
                      placeholder="0.10"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="comment" className="text-right">
                      Comment
                    </Label>
                    <Textarea id="comment" name="comment" placeholder="Manual signal" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Signal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by symbol or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle>Signals ({filteredSignals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Exit Price</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSignals.map((signal, index) => (
                  <motion.tr
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="font-medium">{signal.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant={signal.action === "BUY" ? "default" : "secondary"}
                        className={
                          signal.action === "BUY" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {signal.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{signal.entry_price ? signal.entry_price.toFixed(5) : "-"}</TableCell>
                    <TableCell>{signal.exit_price ? signal.exit_price.toFixed(5) : "-"}</TableCell>
                    <TableCell className={getPnLColor(signal.pnl)}>
                      {signal.pnl ? `$${signal.pnl.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(signal)}</TableCell>
                    <TableCell className="text-sm text-slate-600" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(signal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Signal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this signal? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(signal.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {editingSignal && (
            <form action={handleSaveEdit}>
              <DialogHeader>
                <DialogTitle>Edit Signal</DialogTitle>
                <DialogDescription>Update the signal information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-symbol" className="text-right">
                    Symbol
                  </Label>
                  <Input
                    id="edit-symbol"
                    name="symbol"
                    defaultValue={editingSignal.symbol}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-action" className="text-right">
                    Action
                  </Label>
                  <Select name="action" defaultValue={editingSignal.action}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-entry_price" className="text-right">
                    Entry Price
                  </Label>
                  <Input
                    id="edit-entry_price"
                    name="entry_price"
                    type="number"
                    step="0.00001"
                    defaultValue={editingSignal.entry_price || ""}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-exit_price" className="text-right">
                    Exit Price
                  </Label>
                  <Input
                    id="edit-exit_price"
                    name="exit_price"
                    type="number"
                    step="0.00001"
                    defaultValue={editingSignal.exit_price || ""}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-pnl" className="text-right">
                    P&L
                  </Label>
                  <Input
                    id="edit-pnl"
                    name="pnl"
                    type="number"
                    step="0.01"
                    defaultValue={editingSignal.pnl || ""}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-processed" className="text-right">
                    Status
                  </Label>
                  <Select name="processed" defaultValue={editingSignal.processed.toString()}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Pending</SelectItem>
                      <SelectItem value="true">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingSignal.processed && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-success" className="text-right">
                      Result
                    </Label>
                    <Select name="success" defaultValue={editingSignal.success?.toString() || "true"}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Success</SelectItem>
                        <SelectItem value="false">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-comment" className="text-right">
                    Comment
                  </Label>
                  <Textarea
                    id="edit-comment"
                    name="comment"
                    defaultValue={editingSignal.comment || ""}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

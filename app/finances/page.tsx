"use client"

import type React from "react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2, DollarSign, Wallet, CalendarDays, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const incomeCategories = [
  "Service Payment",
  "Parts Sale",
  "Painting Service",
  "Repair Service",
  "Consultation",
  "Other Income",
]

const expenseCategories = [
  "Parts Purchase",
  "Paint & Materials",
  "Equipment",
  "Rent",
  "Utilities",
  "Salaries",
  "Marketing",
  "Maintenance",
  "Other Expense",
]

export default function FinancesPage() {
  // --- Database State ---
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)

  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterMonth, setFilterMonth] = useState<string>("")

  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // --- API Actions ---

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category || formData.amount <= 0) return

    const method = editingTransactionId ? "PATCH" : "POST"
    const url = editingTransactionId ? `/api/transactions/${editingTransactionId}` : "/api/transactions"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchTransactions() // Refresh data from DB
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await fetch(`/api/transactions/${id}`, { method: "DELETE" })
        fetchTransactions() // Refresh data
      } catch (error) {
        console.error("Error deleting:", error)
      }
    }
  }

  // --- Logic & Memoization ---

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const typeMatch = filterType === "all" || t.type === filterType
        const monthMatch = !filterMonth || t.date.startsWith(filterMonth)
        return typeMatch && monthMatch
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filterType, filterMonth])

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const net = income - expense

    const monthlyData = transactions.reduce(
      (acc, t) => {
        const month = t.date.substring(0, 7)
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 }
        }
        acc[month][t.type] += t.amount
        return acc
      },
      {} as Record<string, { income: number; expense: number }>,
    )

    return { income, expense, net, monthlyData }
  }, [transactions])

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setEditingTransactionId(null)
  }

  const handleEdit = (transaction: any) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split("T")[0],
    })
    setEditingTransactionId(transaction.id)
    setIsDialogOpen(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Income & Expenses</h1>
            <p className="text-muted-foreground">Monitor your workshop's financial health</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingTransactionId ? "Edit Transaction" : "New Transaction"}</DialogTitle>
                <DialogDescription>
                  Enter the details of the {formData.type} below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value, category: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rs.</span>
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide context for this transaction..."
                    rows={3}
                    required
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">
                    {editingTransactionId ? "Save Changes" : "Record Transaction"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {stats.income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Cumulative earnings</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {stats.expense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Cumulative spending</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 ${stats.net >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.net < 0 ? "text-red-500" : "text-primary"}`}>
                Rs. {stats.net.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current profitability</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly Breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin h-6 w-6" /></div>
              ) : Object.keys(stats.monthlyData).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No data available</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(stats.monthlyData)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 5)
                    .map(([month, data]: [string, any]) => {
                      const net = data.income - data.expense
                      return (
                        <div key={month} className="group relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">
                              {new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                            <Badge variant={net >= 0 ? "outline" : "destructive"}>
                              Rs. {net.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex flex-col bg-green-50 dark:bg-green-950/30 p-2 rounded">
                              <span className="text-green-600 font-medium">Income</span>
                              <span>Rs. {data.income.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col bg-red-50 dark:bg-red-950/30 p-2 rounded">
                              <span className="text-red-600 font-medium">Expense</span>
                              <span>Rs. {data.expense.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Transactions</CardTitle>
              <Input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-[160px] h-8"
              />
            </CardHeader>
            <CardContent>
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
                  <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
                </TabsList>

                <div className="space-y-1">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12"><Loader2 className="animate-spin h-8 w-8 mb-2" /><p>Loading transactions...</p></div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <DollarSign className="h-12 w-12 opacity-20 mb-2" />
                      <p>No transactions found for this period.</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0"
                      >
                        <div className="flex gap-4 items-center">
                          <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{transaction.category}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{new Date(transaction.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{transaction.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {transaction.type === "income" ? "+" : "-"} {transaction.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(transaction)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(transaction.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
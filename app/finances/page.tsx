"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2, DollarSign } from "lucide-react"
import { useState, useMemo } from "react"
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
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const typeMatch = filterType === "all" || t.type === filterType
      const monthMatch = !filterMonth || t.date.startsWith(filterMonth)
      return typeMatch && monthMatch
    })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTransaction) {
      updateTransaction(editingTransaction, formData)
    } else {
      addTransaction(formData)
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      type: "income",
      category: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: (typeof transactions)[0]) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split("T")[0],
    })
    setEditingTransaction(transaction.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Income & Expenses</h1>
            <p className="text-muted-foreground">Track your financial transactions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? "Update transaction details" : "Record a new income or expense transaction"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
                      required
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
                    <Label htmlFor="category">Category *</Label>
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
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Rs.) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingTransaction ? "Update" : "Add"} Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs. {stats.income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rs. {stats.expense.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.net >= 0 ? "text-primary" : "text-red-600"}`}>
                Rs. {stats.net.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Income - Expenses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.monthlyData).length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.monthlyData)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, data]) => {
                    const net = data.income - data.expense
                    return (
                      <div key={month} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </span>
                          <span className={`font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                            Rs. {net.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Income: </span>
                            <span className="font-medium text-green-600">Rs. {data.income.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expenses: </span>
                            <span className="font-medium text-red-600">Rs. {data.expense.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transactions</CardTitle>
              <div className="flex gap-2">
                <Input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value={filterType} className="space-y-4 mt-4">
                {filteredTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                                {transaction.type}
                              </Badge>
                              <span className="text-sm font-medium">{transaction.category}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.type === "income" ? "+" : "-"}Rs. {transaction.amount.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(transaction)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(transaction.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

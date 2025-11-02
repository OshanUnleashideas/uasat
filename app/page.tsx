"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Users, Car, FileText, Receipt, TrendingUp, Wrench, DollarSign, AlertCircle, Plus } from "lucide-react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { customers, vehicles, quotations, bills, transactions, jobs } = useStore()

  const stats = useMemo(() => {
    const totalRevenue = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const pendingBills = bills.filter((b) => b.status !== "paid").length

    const activeJobs = jobs.filter((j) => j.status === "in-progress").length

    const pendingQuotations = quotations.filter((q) => q.status === "sent").length

    const outstandingAmount = bills.filter((b) => b.status !== "paid").reduce((sum, b) => sum + b.balance, 0)

    return {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingBills,
      activeJobs,
      pendingQuotations,
      outstandingAmount,
    }
  }, [transactions, bills, jobs, quotations])

  const recentJobs = useMemo(() => {
    return jobs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5)
  }, [jobs])

  const recentBills = useMemo(() => {
    return bills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [bills])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to U Asha Super Auto Tech Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-muted-foreground">Vehicles in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Jobs in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBills}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs. {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total income received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rs. {stats.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total expenses paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Rs. {stats.netIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding & Pending */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Rs. {stats.outstandingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {stats.pendingBills} pending bills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingQuotations}</div>
              <p className="text-xs text-muted-foreground">Awaiting customer response</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs yet</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => {
                    const customer = customers.find((c) => c.id === job.customerId)
                    const vehicle = vehicles.find((v) => v.id === job.vehicleId)
                    return (
                      <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{job.jobNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer?.name} - {vehicle?.registrationNumber}
                          </p>
                        </div>
                        <Badge
                          variant={
                            job.status === "completed"
                              ? "default"
                              : job.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {job.status}
                        </Badge>
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
                <CardTitle>Recent Bills</CardTitle>
                <Link href="/bills/new">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills yet</p>
              ) : (
                <div className="space-y-4">
                  {recentBills.map((bill) => {
                    const customer = customers.find((c) => c.id === bill.customerId)
                    return (
                      <div key={bill.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{bill.billNumber}</p>
                          <p className="text-sm text-muted-foreground">{customer?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Rs. {bill.total.toLocaleString()}</p>
                          <Badge
                            variant={
                              bill.status === "paid"
                                ? "default"
                                : bill.status === "partial"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

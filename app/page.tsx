"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, FileText, Receipt, TrendingUp, Wrench, DollarSign, AlertCircle, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-medium">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AppLayout>
    );
  }

  const { counts, financials, recentJobs, recentBills } = data;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to U Asha Super Auto Tech Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.customers}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.vehicles}</div>
              <p className="text-xs text-muted-foreground">Vehicles in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.activeJobsCount}</div>
              <p className="text-xs text-muted-foreground">Jobs in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.pendingBillsCount}</div>
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
              <div className="text-2xl font-bold text-green-600">Rs. {financials.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total income received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rs. {financials.expenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total expenses paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Rs. {financials.net.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-orange-600">Rs. {financials.outstanding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From {counts.pendingBillsCount} pending bills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.pendingQuotations}</div>
              <p className="text-xs text-muted-foreground">Awaiting customer response</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bills</CardTitle>
                <Link href="/bills/">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="h-80 overflow-x-auto">
              {recentBills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills yet</p>
              ) : (
                <div className="space-y-4">
                  {recentBills.map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{bill.bill_no}</p>
                        <p className="text-sm text-muted-foreground">{bill.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Rs. {Number(bill.total_amount).toLocaleString()}</p>
                        <Badge
                          variant={
                            bill.payment_status === "Paid"
                              ? "default"
                              : bill.payment_status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {bill.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent className="h-80 overflow-x-auto">
              {recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs yet</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Job #{job.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.quotation?.customer?.name} - {job.quotation?.vehicle?.vehicle_no}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === "Completed"
                            ? "default"
                            : job.status === "In_Progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
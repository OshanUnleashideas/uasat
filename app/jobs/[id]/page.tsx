"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { ArrowLeft, Wrench } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ViewJobPage() {
  const params = useParams()
  const { jobs, customers, vehicles, quotations, bills } = useStore()
  const job = jobs.find((j) => j.id === params.id)

  if (!job) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Job not found</p>
          <Link href="/jobs">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const customer = customers.find((c) => c.id === job.customerId)
  const vehicle = vehicles.find((v) => v.id === job.vehicleId)
  const quotation = job.quotationId ? quotations.find((q) => q.id === job.quotationId) : null
  const bill = job.billId ? bills.find((b) => b.id === job.billId) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in-progress":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.jobNumber}</h1>
              <p className="text-muted-foreground">Job details</p>
            </div>
          </div>
          <Link href={`/jobs/${job.id}/edit`}>
            <Button>Edit Job</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer?.phone}</p>
              </div>
              {customer?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-medium">{vehicle?.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-medium">
                  {vehicle?.make} {vehicle?.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year & Color</p>
                <p className="font-medium">
                  {vehicle?.year} | {vehicle?.color}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
              <Badge variant={getPriorityColor(job.priority)}>{job.priority} priority</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-sm">{job.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{new Date(job.startDate).toLocaleDateString()}</p>
              </div>
              {job.estimatedCompletion && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Completion</p>
                  <p className="font-medium">{new Date(job.estimatedCompletion).toLocaleDateString()}</p>
                </div>
              )}
              {job.completedDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Completed Date</p>
                  <p className="font-medium">{new Date(job.completedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {job.assignedTo && (
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{job.assignedTo}</p>
              </div>
            )}
            {job.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {(quotation || bill) && (
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quotation && (
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-sm font-medium">Quotation</p>
                    <p className="text-sm text-muted-foreground">{quotation.quotationNumber}</p>
                  </div>
                  <Link href={`/quotations/${quotation.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}
              {bill && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Bill</p>
                    <p className="text-sm text-muted-foreground">{bill.billNumber}</p>
                  </div>
                  <Link href={`/bills/${bill.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

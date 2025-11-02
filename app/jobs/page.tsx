"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { Plus, Search, Eye, Pencil, Trash2, Wrench } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type React from "react"

export default function JobsPage() {
  const { jobs, customers, vehicles, quotations, bills, addJob, deleteJob } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isOpen, setIsOpen] = useState(false)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [quotationId, setQuotationId] = useState("")
  const [billId, setBillId] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed" | "cancelled">("pending")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [estimatedCompletion, setEstimatedCompletion] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [notes, setNotes] = useState("")

  const filteredJobs = jobs.filter((job) => {
    const customer = customers.find((c) => c.id === job.customerId)
    const vehicle = vehicles.find((v) => v.id === job.vehicleId)
    const searchMatch =
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const statusMatch = statusFilter === "all" || job.status === statusFilter
    return searchMatch && statusMatch
  })

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJob(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addJob({
      customerId,
      vehicleId,
      quotationId: quotationId || undefined,
      billId: billId || undefined,
      description,
      status,
      priority,
      startDate,
      estimatedCompletion: estimatedCompletion || undefined,
      assignedTo: assignedTo || undefined,
      notes: notes || undefined,
    })
    // Reset form
    setCustomerId("")
    setVehicleId("")
    setQuotationId("")
    setBillId("")
    setDescription("")
    setStatus("pending")
    setPriority("medium")
    setStartDate(new Date().toISOString().split("T")[0])
    setEstimatedCompletion("")
    setAssignedTo("")
    setNotes("")
    setIsOpen(false)
  }

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "Unknown"
  }

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}` : "Unknown"
  }

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

  const customerVehicles = vehicles.filter((v) => v.customerId === customerId)
  const customerQuotations = quotations.filter((q) => q.customerId === customerId)
  const customerBills = bills.filter((b) => b.customerId === customerId)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Jobs</h1>
            <p className="text-muted-foreground">Manage and track repair jobs</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>Create a new repair job for a customer</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select value={customerId} onValueChange={setCustomerId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle *</Label>
                      <Select value={vehicleId} onValueChange={setVehicleId} required disabled={!customerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quotation">Related Quotation (Optional)</Label>
                      <Select value={quotationId} onValueChange={setQuotationId} disabled={!customerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quotation" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerQuotations.map((quotation) => (
                            <SelectItem key={quotation.id} value={quotation.id}>
                              {quotation.quotationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bill">Related Bill (Optional)</Label>
                      <Select value={billId} onValueChange={setBillId} disabled={!customerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bill" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerBills.map((bill) => (
                            <SelectItem key={bill.id} value={bill.id}>
                              {bill.billNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the work to be done..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={status} onValueChange={(v: typeof status) => setStatus(v)} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={priority} onValueChange={(v: typeof priority) => setPriority(v)} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="Technician name"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCompletion">Estimated Completion</Label>
                      <Input
                        id="estimatedCompletion"
                        type="date"
                        value={estimatedCompletion}
                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes or instructions..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Job</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs by number, customer, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No jobs found matching your filters"
                  : "No jobs yet. Create your first job to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {job.jobNumber}
                          <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                          <Badge variant={getPriorityColor(job.priority)}>{job.priority}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{getCustomerName(job.customerId)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Button size="icon" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        <p className="text-sm font-medium">{getVehicleInfo(job.vehicleId)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="text-sm font-medium">{new Date(job.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {job.status === "completed" ? "Completed" : "Est. Completion"}
                        </p>
                        <p className="text-sm font-medium">
                          {job.completedDate
                            ? new Date(job.completedDate).toLocaleDateString()
                            : job.estimatedCompletion
                              ? new Date(job.estimatedCompletion).toLocaleDateString()
                              : "Not set"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

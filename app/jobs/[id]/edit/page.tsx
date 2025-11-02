"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { jobs, customers, vehicles, quotations, bills, updateJob } = useStore()
  const job = jobs.find((j) => j.id === params.id)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [quotationId, setQuotationId] = useState("")
  const [billId, setBillId] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed" | "cancelled">("pending")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [startDate, setStartDate] = useState("")
  const [estimatedCompletion, setEstimatedCompletion] = useState("")
  const [completedDate, setCompletedDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (job) {
      setCustomerId(job.customerId)
      setVehicleId(job.vehicleId)
      setQuotationId(job.quotationId || "")
      setBillId(job.billId || "")
      setDescription(job.description)
      setStatus(job.status)
      setPriority(job.priority)
      setStartDate(job.startDate.split("T")[0])
      setEstimatedCompletion(job.estimatedCompletion?.split("T")[0] || "")
      setCompletedDate(job.completedDate?.split("T")[0] || "")
      setAssignedTo(job.assignedTo || "")
      setNotes(job.notes || "")
    }
  }, [job])

  if (!job) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Job not found</p>
        </div>
      </AppLayout>
    )
  }

  const customerVehicles = vehicles.filter((v) => v.customerId === customerId)
  const customerQuotations = quotations.filter((q) => q.customerId === customerId)
  const customerBills = bills.filter((b) => b.customerId === customerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateJob(job.id, {
      customerId,
      vehicleId,
      quotationId: quotationId || undefined,
      billId: billId || undefined,
      description,
      status,
      priority,
      startDate,
      estimatedCompletion: estimatedCompletion || undefined,
      completedDate: completedDate || undefined,
      assignedTo: assignedTo || undefined,
      notes: notes || undefined,
    })
    router.push(`/jobs/${job.id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/jobs/${job.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Job</h1>
            <p className="text-muted-foreground">{job.jobNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Select value={vehicleId} onValueChange={setVehicleId} required>
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
                  <Select value={quotationId} onValueChange={setQuotationId}>
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
                  <Select value={billId} onValueChange={setBillId}>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the work to be done..."
                  rows={4}
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
              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <Label htmlFor="completedDate">Completed Date</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
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
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/jobs/${job.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Update Job</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

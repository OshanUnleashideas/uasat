"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useStore, type QuotationItem } from "@/lib/store"
import { Plus, Search, Eye, Pencil, Trash2, Receipt } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function BillsPage() {
  const { bills, customers, vehicles, deleteBill, addBill, addTransaction, quotations } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [quotationId, setQuotationId] = useState("")
  const [jobType, setJobType] = useState<"accident-repair" | "normal-painting" | "custom-work">("normal-painting")
  const [remarks, setRemarks] = useState("")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0])
  const [taxRate, setTaxRate] = useState(0)
  const [paid, setPaid] = useState(0)
  const [items, setItems] = useState<QuotationItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const filteredBills = bills.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customers
        .find((c) => c.id === bill.customerId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      deleteBill(id)
    }
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
      case "paid":
        return "default"
      case "partial":
        return "secondary"
      case "unpaid":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const customerVehicles = vehicles.filter((v) => v.customerId === customerId)
  const acceptedQuotations = quotations.filter((q) => q.customerId === customerId && q.status === "accepted")

  const loadFromQuotation = (qId: string) => {
    const quotation = quotations.find((q) => q.id === qId)
    if (quotation) {
      setVehicleId(quotation.vehicleId)
      setItems(quotation.items)
      setTaxRate(quotation.subtotal > 0 ? (quotation.tax / quotation.subtotal) * 100 : 0)
      setJobType(quotation.jobType)
    }
  }

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax
  const balance = total - paid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId || !vehicleId || items.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    const status = balance === 0 ? "paid" : paid > 0 ? "partial" : "unpaid"

    const newBill = {
      customerId,
      vehicleId,
      quotationId: quotationId || undefined,
      items,
      subtotal,
      tax,
      total,
      paid,
      balance,
      status,
      jobType,
      remarks,
      dueDate,
    }

    addBill(newBill);

    // Add income transaction if payment received
    if (paid > 0) {
      addTransaction({
        type: "income",
        category: "Service Payment",
        amount: paid,
        description: `Payment received for bill`,
        date: new Date().toISOString(),
      })
    }

    // Reset form and close dialog
    setCustomerId("")
    setVehicleId("")
    setQuotationId("")
    setJobType("normal-painting")
    setRemarks("")
    setDueDate(new Date().toISOString().split("T")[0])
    setTaxRate(0)
    setPaid(0)
    setItems([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }])
    setIsDialogOpen(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bills</h1>
            <p className="text-muted-foreground">Create and manage invoices</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl min-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Bill</DialogTitle>
                <DialogDescription>Generate a professional invoice for your customer</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer & Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer & Vehicle Information</h3>
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
                      <Label htmlFor="quotation">Load from Quotation (Optional)</Label>
                      <Select
                        value={quotationId}
                        onValueChange={(value) => {
                          setQuotationId(value)
                          loadFromQuotation(value)
                        }}
                        disabled={!customerId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quotation" />
                        </SelectTrigger>
                        <SelectContent>
                          {acceptedQuotations.map((quotation) => (
                            <SelectItem key={quotation.id} value={quotation.id}>
                              {quotation.quotationNumber} - Rs. {quotation.total.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
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
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={jobType} onValueChange={(value: any) => setJobType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident-repair">Accident Repair</SelectItem>
                          <SelectItem value="normal-painting">Normal Painting</SelectItem>
                          <SelectItem value="custom-work">Custom Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Items & Services */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Items & Services</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-2 items-start border-b pb-3 last:border-0">
                        <div className="flex-1 grid gap-2 md:grid-cols-4">
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs">Description *</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Service or part"
                              className="text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Qty *</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Unit Price (Rs.) *</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-6">
                          <p className="text-xs font-medium">Rs. {item.total.toLocaleString()}</p>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charges & Payment */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Charges & Payment</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Service Charge / VAT (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paid">Amount Paid (Rs.)</Label>
                      <Input
                        id="paid"
                        type="number"
                        value={paid}
                        onChange={(e) => setPaid(Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        max={total}
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Charge ({taxRate}%):</span>
                      <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Grand Total:</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Additional Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any additional notes..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Bill</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bills by number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No bills found matching your search"
                  : "No bills yet. Create your first bill to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <Card key={bill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {bill.billNumber}
                        <Badge variant={getStatusColor(bill.status)}>{bill.status}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{getCustomerName(bill.customerId)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/bills/${bill.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/bills/${bill.id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(bill.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="text-sm font-medium">{getVehicleInfo(bill.vehicleId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-medium">Rs. {bill.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-sm font-medium text-green-600">Rs. {bill.paid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-sm font-medium text-orange-600">Rs. {bill.balance.toLocaleString()}</p>
                    </div>
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

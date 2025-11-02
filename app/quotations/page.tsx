"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, type QuotationItem } from "@/lib/store"
import { Plus, Search, Eye, Pencil, Trash2, FileText, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function QuotationsPage() {
  const { quotations, customers, vehicles, deleteQuotation, addQuotation } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [jobType, setJobType] = useState<"accident-repair" | "normal-painting" | "custom">("normal-painting")
  const [items, setItems] = useState<QuotationItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customers
        .find((c) => c.id === quotation.customerId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      deleteQuotation(id)
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
      case "draft":
        return "secondary"
      case "sent":
        return "default"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const customerVehicles = vehicles.filter((v) => v.customerId === customerId)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addQuotation({
      customerId,
      vehicleId,
      items,
      subtotal,
      tax,
      total,
      status: "draft",
      validUntil,
      jobType,
    })
    // Reset form
    setCustomerId("")
    setVehicleId("")
    setValidUntil("")
    setTaxRate(0)
    setJobType("normal-painting")
    setItems([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }])
    setIsModalOpen(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Quotations</h1>
            <p className="text-muted-foreground">Create and manage quotations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quotations by number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredQuotations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No quotations found matching your search"
                  : "No quotations yet. Create your first quotation to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {quotation.quotationNumber}
                        <Badge variant={getStatusColor(quotation.status)}>{quotation.status}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{getCustomerName(quotation.customerId)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/quotations/${quotation.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/quotations/${quotation.id}/edit`}>
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(quotation.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="text-sm font-medium">{getVehicleInfo(quotation.vehicleId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-medium">Rs. {quotation.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="text-sm font-medium">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b sticky top-0 bg-background">
              <CardTitle>New Quotation</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={jobType} onValueChange={(value: any) => setJobType(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident-repair">Accident Repair</SelectItem>
                          <SelectItem value="normal-painting">Normal Painting</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Valid Until *</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start border-b pb-4 last:border-0">
                        <div className="flex-1 grid gap-4 md:grid-cols-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Description *</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              placeholder="Service or part description"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price (Rs.) *</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-8">
                          <p className="text-sm font-medium">Rs. {item.total.toLocaleString()}</p>
                          {items.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 bg-muted p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                    <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Quotation</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}

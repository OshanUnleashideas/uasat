"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore, type QuotationItem } from "@/lib/store"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const { quotations, customers, vehicles, updateQuotation } = useStore()
  const quotation = quotations.find((q) => q.id === params.id)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [jobType, setJobType] = useState<"accident-repair" | "normal-painting" | "custom">("normal-painting")
  const [items, setItems] = useState<QuotationItem[]>([])

  useEffect(() => {
    if (quotation) {
      setCustomerId(quotation.customerId)
      setVehicleId(quotation.vehicleId)
      setValidUntil(quotation.validUntil.split("T")[0])
      setTaxRate(quotation.subtotal > 0 ? (quotation.tax / quotation.subtotal) * 100 : 0)
      setJobType(quotation.jobType)
      setItems(quotation.items)
    }
  }, [quotation])

  if (!quotation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Quotation not found</p>
        </div>
      </AppLayout>
    )
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
    updateQuotation(quotation.id, {
      customerId,
      vehicleId,
      items,
      subtotal,
      tax,
      total,
      validUntil,
      jobType,
    })
    router.push(`/quotations/${quotation.id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/quotations/${quotation.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Quotation</h1>
            <p className="text-muted-foreground">{quotation.quotationNumber}</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/quotations/${quotation.id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit">Update Quotation</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

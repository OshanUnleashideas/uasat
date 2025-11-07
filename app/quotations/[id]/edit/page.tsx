"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

interface Customer {
  id: number
  name: string
  vehicles: Vehicle[]
}

interface Vehicle {
  id: number
  vehicle_no: string
  brand: string | null
  model: string | null
}

interface QuotationItem {
  id?: number
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotation, setQuotation] = useState<any>(null)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [jobType, setJobType] = useState("Normal Painting")
  const [items, setItems] = useState<QuotationItem[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [qRes, metaRes] = await Promise.all([
          fetch(`/api/quotations/${params.id}`),
          fetch(`/api/quotations/meta`),
        ])
        const quotationData = await qRes.json()
        const metaData = await metaRes.json()

        setQuotation(quotationData)
        setCustomers(metaData.customers || [])

        setCustomerId(String(quotationData.customerId))
        setVehicleId(String(quotationData.vehicleId))
        setValidUntil(quotationData.validUntil?.split("T")[0] || "")
        setTaxRate(Number(quotationData.taxRate) || 0)
        setJobType(quotationData.jobType)
        setItems(
          quotationData.items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          }))
        )
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">Loading...</div>
      </AppLayout>
    )
  }

  if (!quotation) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">Quotation not found</div>
      </AppLayout>
    )
  }

  const customerVehicles =
    customers.find((c) => String(c.id) === String(customerId))?.vehicles || []

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }])

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...items]
    const item = { ...newItems[index], [field]: value }
    if (field === "quantity" || field === "unitPrice") {
      item.total = item.quantity * item.unitPrice
    }
    newItems[index] = item
    setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      customerId,
      vehicleId,
      validUntil,
      taxRate,
      jobType,
      items,
      total,
    }
    const res = await fetch(`/api/quotations/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) router.push(`/quotations/${params.id}`)
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
          {/* ✅ Same layout as your original code */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle *</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerVehicles.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.vehicle_no} - {v.brand} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Job Type *</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accident Repair">Accident Repair</SelectItem>
                      <SelectItem value="Normal Painting">Normal Painting</SelectItem>
                      <SelectItem value="Custom Work">Custom Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valid Until *</Label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start border-b pb-4">
                  <div className="flex-1 grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price (Rs.) *</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-8">
                    <p className="text-sm font-medium">Rs. {item.total.toLocaleString()}</p>
                    {items.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
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
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>Rs. {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/quotations/${quotation.id}`}>
              <Button variant="outline" type="button">
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
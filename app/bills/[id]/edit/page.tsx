"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditBillPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [billNo, setBillNo] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [billDate, setBillDate] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [taxRate, setTaxRate] = useState(0)
  const [paid, setPaid] = useState(0)

  useEffect(() => {
    const fetchBill = async () => {
      const res = await fetch(`/api/bills/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setBillNo(data.bill_no)
        setCustomerId(data.customerId.toString())
        setVehicleId(data.vehicleId.toString())
        setBillDate(new Date(data.bill_date).toISOString().split('T')[0])
        setItems(data.items.map((i: any) => ({ ...i, tempId: crypto.randomUUID() })))
        setPaid(Number(data.paid_amount))
        // Calculate tax rate based on subtotal/vat ratio
        setTaxRate(data.subtotal > 0 ? (Number(data.vat) / Number(data.subtotal)) * 100 : 0)
      }
      setLoading(false)
    }
    fetchBill()
  }, [params.id])

  const updateItem = (tempId: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.tempId === tempId) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice)
        }
        return updated
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0)
  const vat = subtotal * (taxRate / 100)
  const total = subtotal + vat
  const balance = total - paid

  const handleSave = async () => {
    const res = await fetch(`/api/bills/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: parseInt(customerId),
        vehicleId: parseInt(vehicleId),
        bill_date: billDate,
        subtotal,
        vat,
        total_amount: total,
        paid_amount: paid,
        balance_amount: balance,
        payment_status: balance <= 0 ? "Paid" : paid > 0 ? "Pending" : "Unpaid",
        items: items.map(({ description, quantity, unitPrice, total }) => ({
          description, quantity, unitPrice, total
        }))
      })
    })

    if (res.ok) {
      router.push(`/bills/${params.id}`)
    } else {
      alert("Failed to update bill")
    }
  }

  if (loading) return <AppLayout><div>Loading...</div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/bills/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
            <h1 className="text-2xl font-bold">Edit Bill: {billNo}</h1>
          </div>
          <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bill Date</Label>
                <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label className="text-lg font-bold">Items</Label>
              {items.map((item) => (
                <div key={item.tempId} className="flex gap-2 items-end border-b pb-4">
                  <div className="flex-1">
                    <Label>Description</Label>
                    <Input value={item.description} onChange={(e) => updateItem(item.tempId, "description", e.target.value)} />
                  </div>
                  <div className="w-24">
                    <Label>Qty</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.tempId, "quantity", e.target.value)} />
                  </div>
                  <div className="w-32">
                    <Label>Price</Label>
                    <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.tempId, "unitPrice", e.target.value)} />
                  </div>
                  <div className="w-32 text-right font-bold py-2">
                    Rs. {Number(item.total).toLocaleString()}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setItems(items.filter(i => i.tempId !== item.tempId))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setItems([...items, { tempId: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }])}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
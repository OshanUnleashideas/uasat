"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Receipt, DollarSign, Download, Loader2, Edit2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ViewBillPage() {
  const params = useParams()
  const [bill, setBill] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)

  // Fetch the specific bill from the DB
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/bills/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setBill(data)
        }
      } catch (error) {
        console.error("Error fetching bill:", error)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchBill()
  }, [params.id])

  const handlePrint = () => {
    // Optional: Add a tiny delay to ensure all state is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePayment = async () => {
    if (paymentAmount > 0 && paymentAmount <= Number(bill.balance_amount)) {
      const newPaid = Number(bill.paid_amount) + paymentAmount
      const newBalance = Number(bill.total_amount) - newPaid
      const newStatus = newBalance === 0 ? "Paid" : "Pending"

      try {
        const res = await fetch(`/api/bills/${bill.id}`, {
          method: "PATCH", // You'll need a PATCH method in your route
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paid_amount: newPaid,
            balance_amount: newBalance,
            payment_status: newStatus,
          }),
        })

        if (res.ok) {
          const updated = await res.json()
          setBill(updated)
          setIsPaymentDialogOpen(false)
          setPaymentAmount(0)
        }
      } catch (error) {
        alert("Payment update failed")
      }
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading Invoice...</p>
        </div>
      </AppLayout>
    )
  }

  if (!bill) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Bill not found (ID: {params.id})</p>
          <Link href="/bills">
            <Button className="mt-4">Back to Bills</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="md:flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/bills">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{bill.bill_no}</h1>
              <p className="text-muted-foreground">Invoice details</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3 md:mt-0">

            <Link className="border rounded-md" href={`/bills/${bill.id}/edit`}>
              <Button size="icon" variant="ghost">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>

            {Number(bill.balance_amount) > 0 && (
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>Enter the amount received from {bill.customer?.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment">Payment Amount (Rs.)</Label>
                      <Input
                        id="payment"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        max={Number(bill.balance_amount)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Outstanding: Rs. {Number(bill.balance_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handlePayment}>Record Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="outline" className="bg-primary text-white" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </div>

        {/* INVOICE DESIGN */}
        <div className="bg-white shadow-lg max-w-[210mm] mx-auto border m-0 overflow-hidden rounded-lg">
          <div className="flex justify-between items-start p-8 bg-[#2b6777] text-white">
            <div>
              <h1 className="text-2xl font-bold">U Asha Super Auto Tech</h1>
              <p className="text-xs opacity-80 mt-1">Professional Vehicle Painting & Repair</p>
              <div className="mt-4 text-xs opacity-90 leading-relaxed">
                <p>Sri Lanka | +94 777 975 532</p>
                <p>info@uasha.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black tracking-tighter">INVOICE</h2>
              <p className="mt-2 text-sm font-mono opacity-90">{bill.bill_no}</p>
              <p className="text-xs mt-2 italic">Date: {new Date(bill.bill_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Invoice To</h3>
                <div className="text-gray-800">
                  <p className="font-bold text-lg">{bill.customer?.name}</p>
                  <p className="text-sm">{bill.customer?.phone}</p>
                  <p className="text-sm mt-1">{bill.customer?.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Vehicle Detail</h3>
                <div className="bg-gray-50 p-3 rounded-md border text-sm">
                  <p><span className="text-gray-500">Reg No:</span> <span className="font-semibold">{bill.vehicle?.vehicle_no}</span></p>
                  <p><span className="text-gray-500">Model:</span> {bill.vehicle?.brand} {bill.vehicle?.model}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="border-b-2 border-[#2b6777]">
                <tr>
                  <th className="text-left py-3 px-2">Description</th>
                  <th className="text-right py-3 px-2">Qty</th>
                  <th className="text-right py-3 px-2">Unit Price</th>
                  <th className="text-right py-3 px-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bill.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 px-2 text-gray-700">{item.description}</td>
                    <td className="py-4 px-2 text-right">{item.quantity}</td>
                    <td className="py-4 px-2 text-right">{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-4 px-2 text-right font-semibold">{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>Rs. {Number(bill.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">VAT ({((bill.vat / bill.subtotal) * 100).toFixed(0)}%)</span>
                  <span>Rs. {Number(bill.vat).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-900 pt-2 font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-[#2b6777]">Rs. {Number(bill.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Paid Amount</span>
                  <span>Rs. {Number(bill.paid_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-red-50 p-2 rounded text-red-700 font-bold">
                  <span>Balance Due</span>
                  <span>Rs. {Number(bill.balance_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 text-center border-t">
            <p className="text-sm font-semibold text-gray-800">Thank you for your business!</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">U Asha Super Auto Tech © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
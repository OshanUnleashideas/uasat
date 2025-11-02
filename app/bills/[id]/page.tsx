"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { ArrowLeft, Printer, Receipt, DollarSign, Download } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"
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
  const router = useRouter()
  const { bills, customers, vehicles, updateBill, addTransaction } = useStore()
  const bill = bills.find((b) => b.id === params.id)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)

  if (!bill) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Bill not found</p>
          <Link href="/bills">
            <Button className="mt-4">Back to Bills</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const customer = customers.find((c) => c.id === bill.customerId)
  const vehicle = vehicles.find((v) => v.id === bill.vehicleId)

const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handlePayment = () => {
    if (paymentAmount > 0 && paymentAmount <= bill.balance) {
      const newPaid = bill.paid + paymentAmount
      const newBalance = bill.total - newPaid
      const newStatus = newBalance === 0 ? "paid" : "partial"

      updateBill(bill.id, {
        paid: newPaid,
        balance: newBalance,
        status: newStatus,
      })

      addTransaction({
        type: "income",
        category: "Service Payment",
        amount: paymentAmount,
        description: `Payment received for ${bill.billNumber}`,
        date: new Date().toISOString(),
        billId: bill.id,
      })

      setIsPaymentDialogOpen(false)
      setPaymentAmount(0)
    }
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
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{bill.billNumber}</h1>
              <p className="text-muted-foreground">Invoice details</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
            {bill.balance > 0 && (
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
                    <DialogDescription>Enter the payment amount received from the customer</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment">Payment Amount (Rs.)</Label>
                      <Input
                        id="payment"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        max={bill.balance}
                        step="0.01"
                      />
                      <p className="text-sm text-muted-foreground">
                        Outstanding balance: Rs. {bill.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePayment}>Record Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Link href={`/bills/${bill.id}/edit`}>
              <Button>Edit</Button>
            </Link>
          </div>
        </div>

        {/* INVOICE DESIGN (Blue Variant) */}
        <div id="printArea" className="invoice-container bg-white">
          <div
            ref={printRef}
            className="bg-white shadow-md max-w-[210mm] mx-auto border border-gray-200 m-0"
          >
            {/* Header */}
            <div className="flex justify-between items-start p-8 py-5 bg-[#2b6777] text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2b6777] font-bold">
                    U
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">U Asha Super Auto Tech</h1>
                    <p className="text-xs opacity-90">Professional Vehicle Painting & Repair</p>
                  </div>
                </div>
                <div className="text-xs leading-5 opacity-90">
                  <p>Sri Lanka</p>
                  <p>+94 (0) 777 975 532</p>
                  <p>info@uasha.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold tracking-wide">INVOICE</h2>
                <p className="text-sm mt-2 bg-white/20 bg-opacity-20 px-3 py-1 rounded font-semibold">
                  {bill.billNumber}
                </p>
                <div className="mt-4 text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Invoice Date:</span>{" "}
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Due Date:</span>{" "}
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* To / From */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Invoice To</h3>
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="font-bold text-gray-900">{customer?.name}</p>
                    <p className="text-sm text-gray-700">{customer?.phone}</p>
                    {customer?.email && <p className="text-sm text-gray-700">{customer.email}</p>}
                    {customer?.address && <p className="text-sm text-gray-700">{customer.address}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Invoice From</h3>
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="font-bold text-gray-900">U Asha Super Auto Tech</p>
                    <p className="text-sm text-gray-700">Sri Lanka</p>
                    <p className="text-sm text-gray-700">info@uasha.com</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Vehicle Information</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="border border-gray-200 bg-gray-50 p-3 rounded">
                    <p className="text-gray-600 text-xs">Registration No</p>
                    <p className="font-semibold text-gray-900">{vehicle?.registrationNumber}</p>
                  </div>
                  <div className="border border-gray-200 bg-gray-50 p-3 rounded">
                    <p className="text-gray-600 text-xs">Model</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle?.make} {vehicle?.model}
                    </p>
                  </div>
                  <div className="border border-gray-200 bg-gray-50 p-3 rounded">
                    <p className="text-gray-600 text-xs">Year / Color</p>
                    <p className="font-semibold text-gray-900">
                      {vehicle?.year} / {vehicle?.color}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div>
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-[#2b6777] text-white">
                    <tr>
                      <th className="text-left p-3 font-semibold">Description</th>
                      <th className="text-right p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Unit Price</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="p-3 text-gray-800">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">Rs. {item.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-semibold">
                          Rs. {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-80 border border-gray-200 rounded-md overflow-hidden text-sm">
                  <div className="flex justify-between p-3 border-b bg-gray-50">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">Rs. {bill.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 border-b bg-gray-50">
                    <span className="text-gray-600">VAT / Service Charge</span>
                    <span className="font-semibold">Rs. {bill.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#2b6777] text-white font-bold">
                    <span>Total</span>
                    <span>Rs. {bill.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 border-t bg-gray-50">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-semibold text-green-600">Rs. {bill.paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 font-bold text-red-400">
                    <span>Balance Due</span>
                    <span>Rs. {bill.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-600 border-t border-gray-200 pt-6 space-y-1">
                <p className="font-semibold text-gray-900">Thank you for your business!</p>
                <p>Please make payment within 30 days of the invoice date.</p>
                <p className="text-gray-400">U Asha Super Auto Tech © {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

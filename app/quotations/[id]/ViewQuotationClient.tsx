"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRef, useState } from "react"

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quotation {
  status: string | undefined;
  createdAt: string | number | Date | null;
  validUntil: string | number | Date | null;
  jobType: string;
  id: number;
  quotationNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  customer: {
    address: string | null;
    name: string;
    phone: string | null;
    email: string | null;
  };
  vehicle: {
    year: string | number | null;
    color: string | null;
    vehicle_no: string;
    brand: string | null;
    model: string | null;
  };
  items: QuotationItem[];
}

export default function ViewQuotationClient({ quotation }: { quotation: Quotation }) {
  const printRef = useRef<HTMLDivElement>(null)
  const [currentStatus, setCurrentStatus] = useState(quotation.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/quotations/${quotation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setCurrentStatus(newStatus)
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "Accident Repair": "Accident Repair",
      "Normal Painting": "Normal Painting",
      "Custom Work": "Custom Work",
    }
    return labels[type] || type
  }

  const customer = quotation.customer
  const vehicle = quotation.vehicle

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Actions Bar - Hidden during print */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {quotation.quotationNumber}
              </h1>
              <p className="text-muted-foreground">Quotation details</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Link href={`/quotations/${quotation.id}/edit`}>
              <Button>Edit</Button>
            </Link>
          </div>
        </div>

        {/* QUOTATION DESIGN */}
        <div id="printArea" className="invoice-container">
          <div
            ref={printRef}
            className="bg-white shadow-md max-w-[210mm] min-h-[297mm] mx-auto print:shadow-none print:border-none print:bg-white print:p-0 print:m-0 border-gray-200 flex flex-col"
          >
            {/* Header Section - Fixed for Print Colors */}
            <div className="bg-[#52ab98] text-white p-8 py-5 flex justify-between items-start [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#52ab98] font-bold">
                    U
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">U Asha Super Auto Tech (PVT) LTD</h1>
                    <p className="text-xs">Professional Vehicle Painting & Repair</p>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <p>Reg no : PV 00323380</p>
                  <p>+94 (0) 777 975 532</p>
                  <p>uashasuper@gmail.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white mb-2">QUOTATION</div>
                <div className="bg-white/20 px-4 py-2 rounded text-sm font-semibold">
                  {quotation.quotationNumber}
                </div>
              </div>
            </div>

            <div className="h-1 bg-[#c8d8e4] [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"></div>

            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-[#2b6777] uppercase tracking-wider mb-3">
                      Customer Information
                    </p>
                    <div className="p-4 rounded border-l-4 border-[#52ab98] bg-slate-50">
                      <p className="font-bold text-gray-900 mb-1">{customer?.name}</p>
                      <p className="text-sm text-gray-700">{customer?.phone}</p>
                      {customer?.email && <p className="text-sm text-gray-700">{customer.email}</p>}
                      {customer?.address && <p className="text-sm text-gray-700">{customer.address}</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2b6777] uppercase tracking-wider mb-3">
                      Vehicle Information
                    </p>
                    <div className="bg-slate-50 p-4 rounded border-l-4 border-[#52ab98]">
                      <p className="font-bold text-gray-900 mb-1">{vehicle?.vehicle_no}</p>
                      <p className="text-sm text-gray-700">{vehicle?.brand} {vehicle?.model}</p>
                      <p className="text-sm text-gray-700">Year: {vehicle?.year} | Color: {vehicle?.color}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">Valid Until</p>
                    <p className="text-sm font-bold text-gray-900">
                      {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">Job Type</p>
                    <p className="text-sm font-bold text-gray-900">{getJobTypeLabel(quotation.jobType)}</p>
                  </div>
                </div>

                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#52ab98] [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
                        <th className="text-left p-3 text-sm font-bold text-white">Description</th>
                        <th className="text-right p-3 text-sm font-bold text-white">Qty</th>
                        <th className="text-right p-3 text-sm font-bold text-white">Unit Price</th>
                        <th className="text-right p-3 text-sm font-bold text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="p-3 text-sm text-gray-900">{item.description}</td>
                          <td className="p-3 text-sm text-right text-gray-900">{item.quantity}</td>
                          <td className="p-3 text-sm text-right text-gray-900">{item.unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-sm text-right font-semibold text-gray-900">{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-80 border border-gray-300 rounded overflow-hidden">
                    <div className="flex justify-between p-3 border-b border-gray-200 bg-slate-50">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-semibold text-gray-900">Rs. {quotation.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-gray-200 bg-slate-50">
                      <span className="text-sm text-gray-600">Service Charge:</span>
                      <span className="text-sm font-semibold text-gray-900">Rs. {quotation.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#52ab98] font-bold text-white [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
                      <span>GRAND TOTAL</span>
                      <span>Rs. {quotation.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6 text-center text-xs text-gray-600 space-y-2 mt-auto">
                <p className="font-bold text-gray-900">Thank you for choosing U Asha Super Auto Tech</p>
                <p>This quotation is valid for 30 days from the date of issue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
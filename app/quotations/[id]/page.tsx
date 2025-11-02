"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { ArrowLeft, Printer, FileText, Download, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRef } from "react"

export default function ViewQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const { quotations, customers, vehicles, updateQuotation, addBill } = useStore()
  const quotation = quotations.find((q) => q.id === params.id)
  const printRef = useRef<HTMLDivElement>(null)

  if (!quotation) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Quotation not found</p>
          <Link href="/quotations">
            <Button className="mt-4">Back to Quotations</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const customer = customers.find((c) => c.id === quotation.customerId)
  const vehicle = vehicles.find((v) => v.id === quotation.vehicleId)

  const handleStatusChange = (status: "draft" | "sent" | "accepted" | "rejected") => {
    updateQuotation(quotation.id, { status })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleConvertToBill = () => {
    if (quotation.status !== "accepted") {
      alert("Only accepted quotations can be converted to bills")
      return
    }

    const newBill = {
      customerId: quotation.customerId,
      vehicleId: quotation.vehicleId,
      quotationId: quotation.id,
      items: quotation.items,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      paid: 0,
      balance: quotation.total,
      status: "unpaid" as const,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    addBill(newBill)
    router.push("/bills")
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "accident-repair": "Accident Repair",
      "normal-painting": "Normal Painting",
      custom: "Custom",
    }
    return labels[type] || type
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{quotation.quotationNumber}</h1>
              <p className="text-muted-foreground">Quotation details</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={quotation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {quotation.status === "accepted" && (
              <Button onClick={handleConvertToBill} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Convert to Bill
              </Button>
            )}
            <Button variant="outline" onClick={handleDownloadPDF}>
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
            className="bg-white shadow-md max-w-[210mm] h-[297mm] mx-auto print:shadow-none print:border-none print:bg-white print:p-0 print:m-0 border-gray-200 flex flex-col"
          >
            {/* Header Section */}
            <div className="bg-[#52ab98] text-white p-8 py-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2b6777] font-bold">
                    U
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">U Asha Super Auto Tech</h1>
                    <p className="text-xs opacity-90">
                      Professional Vehicle Painting & Repair
                    </p>
                  </div>
                </div>
                <div className="text-xs opacity-85 space-y-1">
                  <p>Sri Lanka</p>
                  <p>+94 (0) 777 975 532</p>
                  <p>info@uasha.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white mb-2">
                  QUOTATION
                </div>
                <div className="bg-white/20 bg-opacity-20 px-4 py-2 rounded text-sm font-semibold">
                  {quotation.quotationNumber}
                </div>
              </div>
            </div>

            {/* Bar */}
            <div className="h-1 bg-[#c8d8e4]"></div>

            {/* Content (Footer is pushed to bottom) */}
            <div className="p-8 flex-1 flex flex-col justify-between">
              {/* Main Content Wrapper */}
              <div className="space-y-6">
                {/* Customer and Vehicle Info */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                      Customer Information
                    </p>
                    <div className="bg-slate-50 p-4 rounded border-l-4 border-[#52ab98]">
                      <p className="font-bold text-gray-900 mb-1">
                        {customer?.name}
                      </p>
                      <p className="text-sm text-gray-700">
                        {customer?.phone}
                      </p>
                      {customer?.email && (
                        <p className="text-sm text-gray-700">
                          {customer.email}
                        </p>
                      )}
                      {customer?.address && (
                        <p className="text-sm text-gray-700">
                          {customer.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                      Vehicle Information
                    </p>
                    <div className="bg-slate-50 p-4 rounded border-l-4 border-[#52ab98]">
                      <p className="font-bold text-gray-900 mb-1">
                        {vehicle?.registrationNumber}
                      </p>
                      <p className="text-sm text-gray-700">
                        {vehicle?.make} {vehicle?.model}
                      </p>
                      <p className="text-sm text-gray-700">
                        Year: {vehicle?.year} | Color: {vehicle?.color}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quotation Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">
                      Quotation Date
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">
                      Valid Until
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(quotation.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold">
                      Job Type
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {getJobTypeLabel(quotation.jobType)}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
                    Itemized Services
                  </p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#52ab98]">
                        <th className="text-left p-3 text-sm font-bold text-white">
                          Description
                        </th>
                        <th className="text-right p-3 text-sm font-bold text-white">
                          Qty
                        </th>
                        <th className="text-right p-3 text-sm font-bold text-white">
                          Unit Price (Rs.)
                        </th>
                        <th className="text-right p-3 text-sm font-bold text-white">
                          Total (Rs.)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="p-3 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="p-3 text-sm text-right text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-sm text-right text-gray-900">
                            {item.unitPrice.toLocaleString()}
                          </td>
                          <td className="p-3 text-sm text-right font-semibold text-gray-900">
                            {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-0 border border-gray-300 rounded overflow-hidden">
                    <div className="flex justify-between p-3 border-b border-gray-200 bg-slate-50">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        Rs. {quotation.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-gray-200 bg-slate-50">
                      <span className="text-sm text-gray-600">
                        Service Charge:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        Rs. {quotation.tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#52ab98] font-bold text-white">
                      <span>GRAND TOTAL</span>
                      <span>Rs. {quotation.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-300 pt-6 text-center text-xs text-gray-600 space-y-2">
                <p className="font-bold text-gray-900">
                  Thank you for choosing U Asha Super Auto Tech
                </p>
                <p>We appreciate your business and look forward to serving you!</p>
                <p className="text-gray-500">
                  This quotation is valid for 30 days from the date of issue
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

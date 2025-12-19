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
import { Plus, Search, Eye, Trash2, Receipt, Edit2 } from "lucide-react"
import { useEffect, useState } from "react"
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
import { toast } from "react-toastify"

// Aligning with Prisma types
export type Bill = {
  id: string
  bill_no: string
  customerId: string
  vehicleId: string
  quotation_id?: string | null
  subtotal: number
  vat: number
  total_amount: number
  paid_amount: number
  balance_amount: number
  payment_status: "Paid" | "Unpaid" | "Pending"
  bill_date: string
}

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [dbQuotations, setDbQuotations] = useState<any[]>([]); // To ensure quotes load from DB
  const { deleteBill, addTransaction } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [customerId, setCustomerId] = useState("")
  const [vehicleId, setVehicleId] = useState("")
  const [quotationId, setQuotationId] = useState<string>('')
  const [jobType, setJobType] = useState<string>("normal-painting")
  const [remarks, setRemarks] = useState("")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0])
  const [taxRate, setTaxRate] = useState(0)
  const [paid, setPaid] = useState(0)
  const [items, setItems] = useState<QuotationItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 },
  ])

  useEffect(() => {
    fetchBills();
    fetchCustomer();
    fetchVehicles();
    fetchQuotations(); // Fetch quotations explicitly
  }, []);

  // useEffect(() => {
  //   setQuotationId('')
  // }, [customerId])

  // 1. Add this useEffect to watch the customerId
  useEffect(() => {
    // When the customer changes, we must clear the specific data 
    // tied to the PREVIOUS customer.
    setQuotationId('');
    setVehicleId('');

    // Reset items to a single empty row
    setItems([
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);

    // Reset financials
    setPaid(0);
    setTaxRate(0);

  }, [customerId]); // This trigger runs every time customerId changes

  const fetchBills = async () => {
    const res = await fetch("/api/bills");
    if (res.ok) setBills(await res.json());
  }

  const fetchCustomer = async () => {
    const res = await fetch("/api/customers");
    if (res.ok) setCustomers(await res.json());
  }

  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles");
    if (res.ok) setVehicles(await res.json());
  };

  const fetchQuotations = async () => {
    const res = await fetch("/api/quotations");
    if (res.ok) setDbQuotations(await res.json());
  };

  const filteredBills = bills.filter((bill) => {
    const bNumMatch = bill.bill_no?.toLowerCase().includes(searchQuery.toLowerCase());
    const customer = customers.find((c) => String(c.id) === String(bill.customerId));
    const customerName = customer?.name ?? "";
    const custMatch = customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return bNumMatch || custMatch;
  })

  const getCustomerName = (cId: any) => {
    return customers.find((c) => String(c.id) === String(cId))?.name || "Unknown"
  };

  const getVehicleInfo = (vId: any) => {
    const vehicle = vehicles.find((v) => String(v.id) === String(vId));
    return vehicle ? `${vehicle.vehicle_no} - ${vehicle.brand ?? ""} ${vehicle.model ?? ""}` : "Unknown";
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "default"
      case "unpaid": return "destructive"
      default: return "secondary"
    }
  }

  const customerVehicles = vehicles.filter(
    (v) => String(v.customer_id) === String(customerId)
  )

  // Logic Fix: Filter approved quotations correctly
  const acceptedQuotations = dbQuotations.filter(
    (q) => String(q.customerId) === String(customerId) &&
      (q.status?.toLowerCase() === "accepted" || q.status?.toLowerCase() === "approved")
  )

  const loadFromQuotation = (qId: string) => {
    const quotation = dbQuotations.find((q) => String(q.id) === String(qId))

    if (!quotation) return

    setVehicleId(String(quotation.vehicleId))

    // Fix: Check if items exist before mapping. If undefined, use empty array [].
    const safeItems = quotation.items || []

    setItems(
      safeItems.map((item: any) => ({
        id: crypto.randomUUID(),
        description: item.description || "",
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
      }))
    )

    setTaxRate(Number(quotation.taxRate) || 0)
    // Ensure jobType matches your Select component's values
    if (quotation.jobType) {
      setJobType(quotation.jobType.toLowerCase().replace(/\s+/g, '-'))
    }
  }

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice)
        }
        return updated
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax
  const balance = total - paid

  // 1. Ensure 'async' is present before (e: React.FormEvent)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !vehicleId || items.length === 0) {
      toast.info("Please fill in all required fields")
      // alert("Please fill in all required fields");
      return;
    }

    const status = balance <= 0 ? "Paid" : paid > 0 ? "Pending" : "Unpaid";

    const newBill = {
      customerId: parseInt(customerId),
      vehicleId: parseInt(vehicleId),
      quotation_id: quotationId ? parseInt(quotationId) : null,
      subtotal,
      vat: tax,
      total_amount: total,
      paid_amount: paid,
      balance_amount: balance,
      payment_status: status,
      bill_date: new Date().toISOString(),
      items: items.map(({ description, quantity, unitPrice, total }) => ({
        description,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        total: Number(total),
      })),
    };

    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBill),
      });

      if (res.ok) {
        toast.success("Bill create successfully")
        setIsDialogOpen(false);
        fetchBills();
        fetchQuotations();
        // Reset form
        setCustomerId("");
        setVehicleId("");
        setQuotationId("");
        setPaid(0);
        setItems([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
      }
    } catch (error) {
      toast.error("Failed to create bill")
      console.error("Submission failed:", error);
    }
  }; // 2. Ensure this closing brace is present before the main 'return' of the component


  const handleDelete = async (id: string) => {
    // 1. Ask for confirmation
    if (!confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 2. Refresh the list after successful deletion
        fetchBills();
        toast.success("Bill deleted successfully")
        // alert("Bill deleted successfully");
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`)
        // alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      // console.error("Delete request failed:", error);
      toast.error("Could not connect to the server to delete the bill.")
      // alert("Could not connect to the server to delete the bill.");
    }
  };


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
            <DialogContent className="w-full md:min-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Bill</DialogTitle>
                <DialogDescription>Generate a professional invoice for your customer</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer & Vehicle Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer *</Label>
                      <Select value={customerId} onValueChange={setCustomerId} required>
                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quotation">Approved Quotation (Optional)</Label>
                      <Select
                        value={quotationId}
                        onValueChange={(value) => { setQuotationId(value); loadFromQuotation(value); }}
                        disabled={!customerId}
                      >
                        <SelectTrigger><SelectValue placeholder="Select quotation" /></SelectTrigger>
                        <SelectContent>
                          {acceptedQuotations.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground">No accepted quotations found</div>
                          ) : (
                            acceptedQuotations.map((q) => (
                              <SelectItem key={q.id} value={String(q.id)}>
                                {q.quotationNumber} - Rs. {Number(q.total).toLocaleString()}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle">Vehicle *</Label>
                      <Select value={vehicleId} onValueChange={setVehicleId} required disabled={!customerId}>
                        <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                        <SelectContent>
                          {customerVehicles.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>{v.vehicle_no} - {v.brand} {v.model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={jobType} onValueChange={(value: any) => setJobType(value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident-repair">Accident Repair</SelectItem>
                          <SelectItem value="normal-painting">Normal Painting</SelectItem>
                          <SelectItem value="custom-work">Custom Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Items & Services</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-2 items-start border-b pb-3 last:border-0">
                        <div className="flex-1 grid gap-2 md:grid-cols-4">
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs">Description *</Label>
                            <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Qty *</Label>
                            <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} required />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Unit Price *</Label>
                            <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} required />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-6">
                          <p className="text-xs font-medium">Rs. {item.total.toLocaleString()}</p>
                          {items.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-6 w-6 p-0">✕</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Charges & Payment</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>VAT / Tax (%)</Label>
                      <Input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount Paid (Rs.)</Label>
                      <Input type="number" value={paid} onChange={(e) => setPaid(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm"><span>Subtotal:</span><span className="font-medium">Rs. {subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span>Tax ({taxRate}%):</span><span className="font-medium">Rs. {tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold border-t pt-2"><span>Grand Total:</span><span>Rs. {total.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Bill</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search bills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><Receipt className="h-12 w-12 text-muted-foreground mb-4" /><p>No bills found</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <Card key={bill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {bill.bill_no}
                        <Badge variant={getStatusColor(bill.payment_status)}>{bill.payment_status}</Badge>
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
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(bill.id)} // Pass the bill ID here
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div><p className="text-sm text-muted-foreground">Vehicle</p><p className="text-sm font-medium">{getVehicleInfo(bill.vehicleId)}</p></div>
                    <div><p className="text-sm text-muted-foreground">Total</p><p className="text-sm font-medium">Rs. {Number(bill.total_amount).toLocaleString()}</p></div>
                    <div><p className="text-sm text-muted-foreground">Paid</p><p className="text-sm font-medium text-green-600">Rs. {Number(bill.paid_amount).toLocaleString()}</p></div>
                    <div><p className="text-sm text-muted-foreground">Balance</p><p className="text-sm font-medium text-orange-600">Rs. {Number(bill.balance_amount).toLocaleString()}</p></div>
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
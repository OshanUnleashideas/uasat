"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye, Pencil, Trash2, FileText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "react-toastify";

type Vehicle = {
  id: number;
  vehicle_no: string;
  customer_id?: number | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  year?: number | null;
};

type Customer = {
  id: number;
  name: string;
};

type Quotation = {
  id: string;
  quotationNumber: string;
  customerId: string;
  vehicleId: string;
  total: number;
  status: string;
  createdAt?: string | Date | null;
};

type QuotationItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [customerId, setCustomerId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [jobType, setJobType] = useState<"Accident Repair" | "Normal Painting" | "Custom Work">(
    "Normal Painting",
  );

  const [items, setItems] = useState<QuotationItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
    fetchQuotations();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch("/api/customers");
    if (!res.ok) return;
    const data = await res.json();
    setCustomers(data);
  };

  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles");
    if (!res.ok) return;
    const data = await res.json();
    setVehicles(data);
  };

  const fetchQuotations = async () => {
    const res = await fetch("/api/quotations");
    if (!res.ok) return;
    const data = await res.json();
    setQuotations(data);
  };

  // Serach Quo
  const filteredQuotations = quotations.filter((quotation) => {
    const qNumMatch = quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const customer = customers.find((c) => String(c.id) === String(quotation.customerId));
    const customerName = customer?.name ?? "";
    const custMatch = customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return qNumMatch || custMatch;
  });
  // Serach Quo

  // Delete quo
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    const res = await fetch(`/api/quotations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } else {
      alert("Failed to delete quotation");
    }
  };
  // Delete quo

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => String(c.id) === String(customerId))?.name || "Unknown";
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => String(v.id) === String(vehicleId));
    return vehicle ? `${vehicle.vehicle_no} - ${vehicle.brand ?? ""} ${vehicle.model ?? ""}` : "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (String(status)) {
      case "Pending":
        return "secondary";
      case "Approved":
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const customerVehicles = vehicles.filter((v) => String(v.customer_id) === String(customerId));

  const addItem = () => {
    setItems((s) => [...s, { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((s) => s.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value } as QuotationItem;
        const qty = Number(updated.quantity) || 0;
        const unit = Number(updated.unitPrice) || 0;
        updated.total = Math.round((qty * unit + Number.EPSILON) * 100) / 100;
        return updated;
      }),
    );
  };

  const subtotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
  const tax = Math.round((subtotal * (taxRate / 100) + Number.EPSILON) * 100) / 100;
  const total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic field validation
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!vehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

    // Validate each item
    for (const item of items) {
      if (!item.description.trim()) {
        toast.error("Each item must have a description");
        return;
      }
      if (item.quantity <= 0) {
        toast.error("Quantity must be greater than 0");
        return;
      }
      if (item.unitPrice < 0) {
        toast.error("Unit price cannot be negative");
        return;
      }
    }

    if (taxRate < 0) {
      toast.error("Tax rate cannot be negative");
      return;
    }

    // Optional: date validation (cannot select past date)
    if (validUntil && new Date(validUntil) < new Date()) {
      toast.error("Valid until date cannot be in the past");
      return;
    }

    const body = {
      customerId: customerId || null,
      vehicleId: vehicleId || null,
      items: items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
      jobType,
      validUntil: validUntil || null,
      taxRate,
      status: "Pending",
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      toast.error("Failed to create quotation")
      return;
    } else {
      toast.success("Quotation create successfully")
    }

    const created = await res.json();
    setQuotations((prev) => [created, ...prev]);

    // reset form
    setCustomerId("");
    setVehicleId("");
    setValidUntil("");
    setTaxRate(0);
    setJobType("Normal Painting");
    setItems([{ id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setIsModalOpen(false);
  };

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
                {searchQuery ? "No quotations found matching your search" : "No quotations yet. Create your first quotation to get started."}
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
                      <p className="text-sm font-medium">Rs. {Number(quotation.total).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : "-"}</p>
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
                            <SelectItem key={customer.id} value={String(customer.id)}>
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
                            <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                              {vehicle.vehicle_no} - {vehicle.brand} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={jobType} onValueChange={(v: any) => setJobType(v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accident Repair">Accident Repair</SelectItem>
                          <SelectItem value="Normal Painting">Normal Painting</SelectItem>
                          <SelectItem value="Custom Work">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)} min="0" step="0.01" />
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
                            <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Service or part description" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)} min="0" step="0.01" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price (Rs.) *</Label>
                            <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} min="0" step="0.01" required />
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
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Phone, Mail, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteAlert } from "@/components/Customers/DeleteAlert";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vehicles?: { id: string; name: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Load customers from database
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )


  // Add new customer and update customer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let res: Response;
      let data: any;

      if (editingCustomer) {
        res = await fetch(`/api/customers`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        data = await res.json();

        if (res.ok) {
          toast.success("Customer updated successfully");
          setCustomers((prev) =>
            prev.map((c) => (c.id === data.id ? data : c))
          );
        } else {
          toast.error(data.error || "Failed to update customer");
        }

      } else {
        // Create new customer
        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        data = await res.json();

        if (res.ok) {
          toast.success("Customer added successfully");
          setCustomers((prev) => [data, ...prev]);
        } else {
          toast.error(data.error || "Failed to add customer");
        }
      }

      if (res.ok) {
        setIsDialogOpen(false);
        resetForm();
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
    }
  };
  // Add new customer and update customer


  const resetForm = () => {
    setFormData({ id: "", name: "", phone: "", email: "", address: "" });
    setEditingCustomer(null);
  };


  // Set data to popup
  const handleEdit = (customer: Customer) => {
    setFormData({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setEditingCustomer(customer.id);
    setIsDialogOpen(true);
  };
  // Set data to popup

  // Delete Customer
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/customers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Customer Deleted successfully");
        await fetchCustomers();
      } else {
        const error = await res.json();
        toast.error("Failed to delete customer");
      }

    } catch (error) {
      toast.error("Something went wrong!");
    }
  };
  // Delete Customer

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? "Update customer information" : "Enter customer details to add them to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCustomer ? "Update" : "Add"} Customer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No customers found." : "No customers yet. Add your first customer to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{customer.name}</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(customer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* <Button size="icon" variant="ghost" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button> */}
                      <DeleteAlert id={customer.id} onDelete={handleDelete} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {customer.vehicles?.length || 0}{" "}
                      {(customer.vehicles?.length || 0) === 1 ? "vehicle" : "vehicles"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Plus, Search, Pencil, Trash2, Car } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"

interface Vehicle {
  id: number
  customer_id: number
  vehicle_no: string
  brand: string
  model: string
  year: number
  color: string
}

interface Customer {
  id: number
  name: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    customer_id: 0,
    vehicle_no: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
  })

  // Fetch vehicles
  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles")
    const data = await res.json()
    setVehicles(data)
  }

  // Fetch customers
  const fetchCustomers = async () => {
    const res = await fetch("/api/customers")
    const data = await res.json()
    setCustomers(data)
  }

  useEffect(() => {
    fetchVehicles()
    fetchCustomers()
  }, [])

  // Add / Update Vehicle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingVehicle ? "PUT" : "POST"
      const res = await fetch("/api/vehicles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVehicle ? { ...formData, id: editingVehicle } : formData),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to save vehicle")

      toast.success(editingVehicle ? "Vehicle updated!" : "Vehicle added!")
      setIsDialogOpen(false)
      resetForm()
      fetchVehicles()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Delete Vehicle
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return
    try {
      const res = await fetch("/api/vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Vehicle deleted!")
        fetchVehicles()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete")
      }
    } catch {
      toast.error("Error deleting vehicle")
    }
  }

  const resetForm = () => {
    setFormData({
      customer_id: 0,
      vehicle_no: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    })
    setEditingVehicle(null)
  }

  const handleEdit = (v: Vehicle) => {
    setFormData({
      customer_id: v.customer_id,
      vehicle_no: v.vehicle_no,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
    })
    setEditingVehicle(v.id)
    setIsDialogOpen(true)
  }

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicle_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCustomerName = (id: number) =>
    customers.find((c) => c.id === id)?.name || "Unknown"

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vehicles</h1>
            <p className="text-muted-foreground">Manage vehicle records</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle information" : "Enter new vehicle details"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Customer *</Label>
                    <Select
                      value={formData.customer_id ? formData.customer_id.toString() : ""}
                      onValueChange={(v) => setFormData({ ...formData, customer_id: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Registration Number *</Label>
                    <Input
                      value={formData.vehicle_no}
                      onChange={(e) => setFormData({ ...formData, vehicle_no: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Make *</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Model *</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year *</Label>
                      <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: parseInt(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Color *</Label>
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingVehicle ? "Update" : "Add"} Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No vehicles found"
                  : "No vehicles yet. Add one to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((v) => (
              <Card key={v.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <span>{v.vehicle_no}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(v.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {v.brand} {v.model}
                  </p>
                  <p className="text-sm text-muted-foreground">Year: {v.year}</p>
                  <Badge variant="secondary">{v.color}</Badge>
                  <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                    Owner: {getCustomerName(v.customer_id)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

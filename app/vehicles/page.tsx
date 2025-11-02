"use client"

import type React from "react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { Plus, Search, Pencil, Trash2, Car } from "lucide-react"
import { useState } from "react"
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

export default function VehiclesPage() {
  const { vehicles, customers, addVehicle, updateVehicle, deleteVehicle } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerId: "",
    registrationNumber: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
  })

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVehicle) {
      updateVehicle(editingVehicle, formData)
    } else {
      addVehicle(formData)
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerId: "",
      registrationNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    })
    setEditingVehicle(null)
  }

  const handleEdit = (vehicle: (typeof vehicles)[0]) => {
    setFormData({
      customerId: vehicle.customerId,
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
    })
    setEditingVehicle(vehicle.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle(id)
    }
  }

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "Unknown"
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Vehicles</h1>
            <p className="text-muted-foreground">Manage vehicle records</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle information" : "Enter vehicle details to add it to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        placeholder="Toyota"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Corolla"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="White"
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

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles by registration, make, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No vehicles found matching your search"
                  : "No vehicles yet. Add your first vehicle to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <span className="text-lg">{vehicle.registrationNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(vehicle)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(vehicle.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{vehicle.color}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Owner: {getCustomerName(vehicle.customerId)}</p>
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

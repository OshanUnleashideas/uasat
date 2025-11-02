"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  createdAt: string
}

export interface Vehicle {
  id: string
  customerId: string
  registrationNumber: string
  make: string
  model: string
  year: number
  color: string
  createdAt: string
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  vehicleId: string
  items: QuotationItem[]
  subtotal: number
  tax: number
  total: number
  status: "draft" | "sent" | "accepted" | "rejected"
  jobType: "accident-repair" | "normal-painting" | "custom"
  createdAt: string
  validUntil: string
}

export interface Bill {
  id: string
  billNumber: string
  customerId: string
  vehicleId: string
  quotationId?: string
  items: QuotationItem[]
  subtotal: number
  tax: number
  total: number
  paid: number
  balance: number
  status: "unpaid" | "partial" | "paid"
  jobType?: "accident-repair" | "normal-painting" | "custom-work"
  remarks?: string
  createdAt: string
  dueDate: string
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  date: string
  billId?: string
}

export interface Job {
  id: string
  jobNumber: string
  customerId: string
  vehicleId: string
  quotationId?: string
  billId?: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  startDate: string
  estimatedCompletion?: string
  completedDate?: string
  assignedTo?: string
  notes?: string
}

interface StoreState {
  customers: Customer[]
  vehicles: Vehicle[]
  quotations: Quotation[]
  bills: Bill[]
  transactions: Transaction[]
  jobs: Job[]

  // Customer actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void

  // Vehicle actions
  addVehicle: (vehicle: Omit<Vehicle, "id" | "createdAt">) => void
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void

  // Quotation actions
  addQuotation: (quotation: Omit<Quotation, "id" | "quotationNumber" | "createdAt">) => void
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void

  // Bill actions
  addBill: (bill: Omit<Bill, "id" | "billNumber" | "createdAt">) => void
  updateBill: (id: string, bill: Partial<Bill>) => void
  deleteBill: (id: string) => void

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Job actions
  addJob: (job: Omit<Job, "id" | "jobNumber">) => void
  updateJob: (id: string, job: Partial<Job>) => void
  deleteJob: (id: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      customers: [],
      vehicles: [],
      quotations: [],
      bills: [],
      transactions: [],
      jobs: [],

      // Customer actions
      addCustomer: (customer) =>
        set((state) => ({
          customers: [
            ...state.customers,
            {
              ...customer,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateCustomer: (id, customer) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customer } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      // Vehicle actions
      addVehicle: (vehicle) =>
        set((state) => ({
          vehicles: [
            ...state.vehicles,
            {
              ...vehicle,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateVehicle: (id, vehicle) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...vehicle } : v)),
        })),
      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),

      // Quotation actions
      addQuotation: (quotation) =>
        set((state) => {
          const quotationNumber = `QT-${String(state.quotations.length + 1).padStart(4, "0")}`
          return {
            quotations: [
              ...state.quotations,
              {
                ...quotation,
                id: crypto.randomUUID(),
                quotationNumber,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),
      updateQuotation: (id, quotation) =>
        set((state) => ({
          quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...quotation } : q)),
        })),
      deleteQuotation: (id) =>
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        })),

      // Bill actions
      addBill: (bill) =>
        set((state) => {
          const billNumber = `INV-${String(state.bills.length + 1).padStart(4, "0")}`
          return {
            bills: [
              ...state.bills,
              {
                ...bill,
                id: crypto.randomUUID(),
                billNumber,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),
      updateBill: (id, bill) =>
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, ...bill } : b)),
        })),
      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        })),

      // Transaction actions
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: crypto.randomUUID(),
            },
          ],
        })),
      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...transaction } : t)),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // Job actions
      addJob: (job) =>
        set((state) => {
          const jobNumber = `JOB-${String(state.jobs.length + 1).padStart(4, "0")}`
          return {
            jobs: [
              ...state.jobs,
              {
                ...job,
                id: crypto.randomUUID(),
                jobNumber,
              },
            ],
          }
        }),
      updateJob: (id, job) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
        })),
      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),
    }),
    {
      name: "garage-storage",
    },
  ),
)

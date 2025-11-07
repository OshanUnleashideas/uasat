import { NextResponse } from "next/server"
import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

// ✅ GET /api/quotations/[id] → Get single quotation with relations
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const quotation = await prisma.quotations.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    })
    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }
    return NextResponse.json(quotation)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PUT /api/quotations/[id] → Update quotation + items
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const data = await request.json()

    // Update quotation
    const updated = await prisma.quotations.update({
      where: { id },
      data: {
        customerId: Number(data.customerId),
        vehicleId: Number(data.vehicleId),
        validUntil: new Date(data.validUntil),
        jobType: data.jobType,
        taxRate: new Prisma.Decimal(data.taxRate || 0),
        total: new Prisma.Decimal(data.total || 0),
        items: {
          deleteMany: {}, // remove old items
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.total),
          })),
        },
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET all vehicles
export async function GET() {
  const vehicles = await prisma.vehicles.findMany({
    include: { customers: true },
    orderBy: { id: "desc" },
  })
  return NextResponse.json(vehicles)
}

// CREATE
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newVehicle = await prisma.vehicles.create({
      data: {
        customer_id: body.customer_id,
        vehicle_no: body.vehicle_no,
        brand: body.brand,
        model: body.model,
        year: body.year,
        color: body.color,
      },
    })
    return NextResponse.json(newVehicle)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// UPDATE
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const updated = await prisma.vehicles.update({
      where: { id: body.id },
      data: {
        customer_id: body.customer_id,
        vehicle_no: body.vehicle_no,
        brand: body.brand,
        model: body.model,
        year: body.year,
        color: body.color,
      },
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await prisma.vehicles.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

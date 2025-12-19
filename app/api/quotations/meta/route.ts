import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        vehicles: true,
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ customers })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to load metadata" }, { status: 500 })
  }
}

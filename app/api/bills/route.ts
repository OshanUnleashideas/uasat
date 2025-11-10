import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bills = await prisma.bills.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error("GET /bills error:", error);
    return NextResponse.json(
      { error: "Faild to fetch bills" },
      { status: 500 }
    );
  }
}

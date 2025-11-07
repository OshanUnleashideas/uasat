import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// type QuotationItemInput = {
//   description: string;
//   quantity: number;
//   unitPrice: number;
// };
// type QuotationInput = {
//   customerId: number;
//   vehicleId: number;
//   jobType?: "Accident Repair" | "Normal Painting" | "Custom Work";
//   validUntil?: string | null;
//   taxRate?: number;
//   items: QuotationItemInput[];
//   status?: "Pending" | "Approved" | "Rejected";
// };

// GET all quotations
export async function GET() {
  try {
    const quotations = await prisma.quotations.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(quotations, { status: 200 });
  } catch (error) {
    console.error("GET /quotations error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🟡 Incoming quotation data:", body);

    const {
      customerId,
      vehicleId,
      jobType,
      validUntil,
      taxRate,
      status,
      items,
    } = body;

    // Auto-generate quotation number
    const count = await prisma.quotations.count();
    const quotationNumber = `Q-${String(count + 1).padStart(4, "0")}`;

    // Compute item totals using Prisma.Decimal
    const itemTotals = items.map((item: any) => {
      const qty = new Prisma.Decimal(item.quantity ?? 0);
      const price = new Prisma.Decimal(item.unitPrice ?? 0);
      return qty.mul(price);
    });

    // Subtotal
    const subtotal = itemTotals.reduce((acc: { add: (arg0: any) => any; }, curr: any) => acc.add(curr), new Prisma.Decimal(0));

    // Tax
    const tax = subtotal.mul(new Prisma.Decimal(taxRate ?? 0).div(new Prisma.Decimal(100)));

    // Final total
    const quotationTotal = subtotal.add(tax);

    // Create quotation
    const quotation = await prisma.quotations.create({
      data: {
        quotationNumber,
        customerId: Number(customerId),
        vehicleId: Number(vehicleId),
        jobType: jobType || "Normal Painting",
        validUntil: validUntil ? new Date(validUntil) : null,
        taxRate: taxRate ? new Prisma.Decimal(taxRate) : new Prisma.Decimal(0),
        total: quotationTotal,
        status: status || "Pending",
        items: {
          create: items.map((item: any) => {
            const qty = new Prisma.Decimal(item.quantity ?? 0);
            const price = new Prisma.Decimal(item.unitPrice ?? 0);
            return {
              description: item.description || "",
              quantity: qty,
              unitPrice: price,
              total: qty.mul(price),
            };
          }),
        },
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    });

    console.log("✅ Created quotation:", quotation);
    return NextResponse.json(quotation);
  } catch (error: any) {
    console.error("❌ Prisma error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create quotation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Quotation ID required" },
        { status: 400 }
      );
    }

    // Delete all related data in one transaction
    await prisma.$transaction([
      prisma.quotation_items.deleteMany({
        where: { quotationId: Number(id) },
      }),
      prisma.bills.deleteMany({
        where: { quotation_id: Number(id) },
      }),
      prisma.jobs.deleteMany({
        where: { quotation_id: Number(id) },
      }),
      prisma.quotations.delete({
        where: { id: Number(id) },
      }),
    ]);

    return NextResponse.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}

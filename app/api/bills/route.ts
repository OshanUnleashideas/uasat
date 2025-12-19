import { prisma } from "@/lib/prisma"; // Use the same name everywhere
import { NextResponse } from "next/server";

// ✅ GET all bills
export async function GET() {
  try {
    const bills = await prisma.bills.findMany({
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error("GET /bills error:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

// ✅ POST - Create a new bill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customerId, 
      vehicleId, 
      quotation_id, 
      subtotal, 
      vat, 
      total_amount, 
      paid_amount, 
      balance_amount, 
      payment_status, 
      items 
    } = body;

    // FIX: Change 'db.$transaction' to 'prisma.$transaction' to match your import
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Bill
      const newBill = await tx.bills.create({
        data: {
          // Ensure IDs are Integers for MySQL
          customerId: Number(customerId),
          vehicleId: Number(vehicleId),
          quotation_id: quotation_id ? Number(quotation_id) : null,
          subtotal: Number(subtotal),
          vat: Number(vat),
          total_amount: Number(total_amount),
          paid_amount: Number(paid_amount),
          balance_amount: Number(balance_amount),
          payment_status: payment_status,
          bill_no: `INV-${Date.now()}`, 
          items: {
            create: items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              total: Number(item.total),
            })),
          },
        },
      });

      // 2. Update Quotation Status to "Billed"
      if (quotation_id) {
        await tx.quotations.update({
          where: { id: Number(quotation_id) },
          data: { status: "Billed" },
        });
      }

      // 3. Optional: Add to Income table if payment was made
      if (Number(paid_amount) > 0) {
        await tx.income.create({
          data: {
            bill_id: newBill.id,
            amount: Number(paid_amount),
            description: `Payment for Bill ${newBill.bill_no}`,
            date: new Date(),
          }
        });
      }

      return newBill;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("BILL_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to create bill. Check server logs." }, { status: 500 });
  }
}
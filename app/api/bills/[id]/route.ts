export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await prisma.bills.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    });

    if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(bill);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// Add to your existing app/api/bills/[id]/route.ts

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Update the bill and its items using a transaction
    const updatedBill = await prisma.bills.update({
      where: { id: parseInt(id) },
      data: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        subtotal: data.subtotal,
        vat: data.vat,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount,
        balance_amount: data.balance_amount,
        payment_status: data.payment_status,
        bill_date: new Date(data.bill_date),
        // Delete old items and create new ones to ensure sync
        items: {
          deleteMany: {}, 
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}



export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // The frontend sends paid_amount, balance_amount, and payment_status
    const updatedBill = await prisma.bills.update({
      where: { id: parseInt(id) },
      data: {
        paid_amount: body.paid_amount,
        balance_amount: body.balance_amount,
        payment_status: body.payment_status,
      },
      include: {
        customer: true,
        vehicle: true,
        items: true,
      },
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Define params as a Promise
) {
  try {
    // 1. Await params to fix the Next.js 15 error
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // 2. Fix the Prisma field name from bill_id to billId
    // Delete related items first to avoid foreign key errors
    await prisma.bill_items.deleteMany({
      where: { billId: id }, 
    });

    // 3. Delete the main bill
    await prisma.bills.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete bill" }, 
      { status: 500 }
    );
  }
}
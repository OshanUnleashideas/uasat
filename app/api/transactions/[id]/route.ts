import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params if using Next.js 15
    const { id } = await params; 
    await db.transaction.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await db.transaction.update({
      where: { id: id },
      data: {
        type: body.type,
        category: body.category,
        amount: Number(body.amount),
        description: body.description,
        date: new Date(body.date),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
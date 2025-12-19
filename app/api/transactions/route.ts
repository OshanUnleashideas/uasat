import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transaction = await db.transaction.create({
      data: {
        type: body.type,
        category: body.category,
        amount: Number(body.amount),
        description: body.description,
        date: new Date(body.date),
      },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
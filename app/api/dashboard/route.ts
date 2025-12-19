import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Fetch data using your specific pluralized model names
    const [
      customersCount,
      vehiclesCount,
      recentJobs,
      recentBills,
      allTransactions,
      pendingQuotationsCount,
    ] = await Promise.all([
      db.customers.count(),
      db.vehicles.count(),
      db.jobs.findMany({
        take: 5,
        orderBy: { start_date: "desc" },
        include: {
          quotation: {
            include: { customer: true, vehicle: true },
          },
        },
      }),
      db.bills.findMany({
        take: 5,
        orderBy: { bill_date: "desc" },
        include: { customer: true },
      }),
      db.transaction.findMany(),
      db.quotations.count({ where: { status: "Pending" } }),
    ]);

    // 2. Financial Calculations
    const revenue = allTransactions
      .filter((t: { type: string }) => t.type === "income")
      // Add (sum: number, t: any) to define the types
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    const expenses = allTransactions
      .filter((t: { type: string }) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

    // Outstanding amount from bills
    const unpaidBills = await db.bills.findMany({
      where: { payment_status: "Unpaid" },
    });

    // Update this sum as well
    const outstanding = unpaidBills.reduce(
      (sum: number, b: any) => sum + Number(b.balance_amount || 0),
      0
    );

    return NextResponse.json({
      counts: {
        customers: customersCount,
        vehicles: vehiclesCount,
        activeJobsCount: recentJobs.filter(
          (j: { status: string }) => j.status === "In_Progress"
        ).length,
        pendingBillsCount: unpaidBills.length,
        pendingQuotations: pendingQuotationsCount,
      },
      financials: {
        revenue,
        expenses,
        net: revenue - expenses,
        outstanding,
      },
      recentJobs,
      recentBills,
    });
  } catch (error) {
    console.error("DASHBOARD_ERROR:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}

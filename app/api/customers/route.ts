import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";

// View customers
export async function GET() {
  try {
    const customers = await prisma.customers.findMany({
      include: { vehicles: true },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// Add a new customers
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, email } = data;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 }
      );
    }

    const phoneRegex = /^(?:\+94|0)?[1-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existingCustomer = await prisma.customers.findFirst({
      where: {
        OR: [{ email: email || "" }, { phone }],
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer already exists with this email or phone number" },
        { status: 409 }
      );
    }

    const newCustomer = await prisma.customers.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
      },
    });

    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error("Error adding customer:", error);
    return NextResponse.json(
      { error: "Failed to add customer" },
      { status: 500 }
    );
  }
}

// Update customer
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "Customer Id required" },
        { status: 400 }
      );
    }

    const updateCustomer = await prisma.customers.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
      },
    });

    return NextResponse.json(updateCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// Delete customer
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    await prisma.customers.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Customer Deleted Successfully" });
  } catch (error) {
    console.error("Error Deleting Customer:", error);
    return NextResponse.json(
      { error: "Failed to delete Customer" },
      { status: 500 }
    );
  }
}

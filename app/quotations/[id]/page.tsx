
import { PrismaClient } from "@prisma/client";
import ViewQuotationPage from "./ViewQuotationClient";

const prisma = new PrismaClient();

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  const quotation = await prisma.quotations.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      items: true,
    },
  });

  if (!quotation) return <div>Quotation not found</div>;

  // Convert Decimals to numbers
  const items = quotation.items.map((item) => ({
    ...item,
    quantity: Number(item.quantity ?? 0),
    unitPrice: Number(item.unitPrice ?? 0),
    total: Number(item.total ?? 0),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = Number(quotation.taxRate ?? 0);
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  const safeQuotation = {
    ...quotation,
    taxRate,
    total,
    subtotal,
    tax,
    customer: quotation.customer,
    vehicle: quotation.vehicle,
    items,
  };

  return <ViewQuotationPage quotation={safeQuotation} />;
}
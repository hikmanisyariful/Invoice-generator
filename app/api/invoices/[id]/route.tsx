export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, invoiceItems } from '@/drizzle/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  // header + totalAmount (SUM)
  const header = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: invoices.clientName,
      clientAddress: invoices.clientAddress,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      status: invoices.status,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      totalAmount: sql<number>`
        COALESCE(SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice}), 0)
      `,
    })
    .from(invoices)
    .leftJoin(invoiceItems, sql`${invoiceItems.invoiceId} = ${invoices.id}`)
    .where(eq(invoices.id, id))
    .groupBy(
      invoices.id,
      invoices.invoiceNumber,
      invoices.clientName,
      invoices.clientAddress,
      invoices.issueDate,
      invoices.dueDate,
      invoices.status,
      invoices.createdAt,
      invoices.updatedAt
    );

  if (header.length === 0)
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  const inv = header[0];

  // items
  const items = await db
    .select({
      id: invoiceItems.id,
      description: invoiceItems.description,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      lineTotal: sql<number>`
        (${invoiceItems.quantity} * ${invoiceItems.unitPrice})
      `,
      createdAt: invoiceItems.createdAt,
      updatedAt: invoiceItems.updatedAt,
    })
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id))
    .orderBy(invoiceItems.id);

  return NextResponse.json({ ...inv, items });
}

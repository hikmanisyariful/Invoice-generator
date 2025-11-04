export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, invoiceItems } from '@/drizzle/schema';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export async function GET() {
  try {
    const results = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientName: invoices.clientName,
        clientAddress: invoices.clientAddress,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        status: invoices.status,
        totalAmount: sql<number>`
          COALESCE(SUM(${invoiceItems.quantity} * ${invoiceItems.unitPrice}), 0)
        `,
      })
      .from(invoices)
      .leftJoin(invoiceItems, sql`${invoiceItems.invoiceId} = ${invoices.id}`)
      .groupBy(
        invoices.id,
        invoices.invoiceNumber,
        invoices.clientName,
        invoices.clientAddress,
        invoices.issueDate,
        invoices.dueDate,
        invoices.status
      )
      .orderBy(sql`${invoices.createdAt} DESC`);

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// --- payload validation ---
const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1), // if you want auto, you can relax this and generate in code
  clientName: z.string().min(1),
  clientAddress: z.string().min(1),
  issueDate: z.coerce.date(), // parse string -> Date
  dueDate: z.coerce.date(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Cancelled']).default('Draft'),
  items: z.array(itemSchema).min(1), // at least one item
});

type NewInvoice = typeof invoices.$inferInsert;
const toPgDate = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const payload = invoiceSchema.parse(json);

    if (new Date(payload.dueDate) < new Date(payload.issueDate)) {
      return NextResponse.json(
        { error: 'dueDate must be >= issueDate' },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // 1) insert invoice header
      const data: NewInvoice = {
        invoiceNumber: payload.invoiceNumber,
        clientName: payload.clientName,
        clientAddress: payload.clientAddress,
        issueDate: toPgDate(payload.issueDate),
        dueDate: toPgDate(payload.dueDate),
        status: payload.status,
      };

      const [createdInv] = await tx
        .insert<typeof invoices>(invoices)
        .values(data)
        .returning();

      // 2) insert items (compute lineTotal here)
      const itemsToInsert = payload.items.map((it) => ({
        invoiceId: createdInv.id,
        description: it.description,
        quantity: it.quantity,
        unitPrice: String(it.unitPrice),
        lineTotal: String(it.quantity * it.unitPrice),
      }));

      const createdItems = await tx
        .insert(invoiceItems)
        .values(itemsToInsert)
        .returning();

      const totalAmount = createdItems.reduce(
        (sum, it) => sum + Number(it.quantity) * Number(it.unitPrice),
        0
      );

      return {
        invoice: createdInv,
        items: createdItems.map((it) => ({
          ...it,
          lineTotal: Number(it.quantity) * Number(it.unitPrice),
        })),
        totalAmount,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

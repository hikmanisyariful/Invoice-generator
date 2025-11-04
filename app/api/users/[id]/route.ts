export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(50).optional(),
});

// GET /api/users/:id
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const [row] = await db.select().from(users).where(eq(users.id, id));
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/users/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const body = await req.json();
    const data = updateUserSchema.parse(body);
    if (!data.name && !data.role) {
      return NextResponse.json({ error: "no fields to update" }, { status: 400 });
    }

    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

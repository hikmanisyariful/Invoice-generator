import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '@/drizzle/schema';

const createUserSchema = z.object({
  name: z.string().min(1, 'name required').max(100),
  role: z.string().min(1, 'role required').max(50),
});

export async function GET() {
  try {
    const { rows } = await db.execute(
      sql`SELECT * FROM users ORDER BY id ASC;`
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.parse(body);

    const [inserted] = await db.insert(users).values(parsed).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

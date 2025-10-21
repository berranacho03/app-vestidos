import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET: lista items desde DB
export async function GET() {
  try {
    console.log('[api/items] GET handler');
    const rows = await query("SELECT id, name, price, created_at FROM items ORDER BY id DESC");
    const items = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      pricePerDay: Number(r.price || 0),
      createdAt: r.created_at,
    }));
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// POST: crear item mínimo compatible con init.sql (name, price)
export async function POST(req: Request) {
  try {
    console.log('[api/items] POST handler start');
    const body = await req.json();
    console.log('[api/items] POST body:', body);
    const name = (body.name || "").trim();
    const price = Number(body.price || 0);
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const res = await query("INSERT INTO items (name, price) VALUES (?, ?)", [name, price]);
    const insertId = (res && (res as any).insertId) || undefined;
    if (!insertId) return NextResponse.json({ error: "insert failed" }, { status: 500 });

    const inserted = await query("SELECT id, name, price, created_at FROM items WHERE id = ?", [insertId]);
    return NextResponse.json({ item: (inserted && inserted[0]) || null }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

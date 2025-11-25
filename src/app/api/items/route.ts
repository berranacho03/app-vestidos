import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET: lista items desde DB
export async function GET() {
  try {
    console.log('[api/items] GET handler');
    const rows = await query("SELECT id, name, pricePerDay, category, sizes, createdAt FROM Items ORDER BY id DESC");
    const items = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      pricePerDay: Number(r.pricePerDay || 0),
      category: r.category,
      sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : r.sizes,
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// POST: crear item
export async function POST(req: Request) {
  try {
    console.log('[api/items] POST handler start');
    const body = await req.json();
    console.log('[api/items] POST body:', body);
    const name = (body.name || "").trim();
    const pricePerDay = Number(body.price || 0);
    const category = (body.category || "dress").trim();
    const description = (body.description || "").trim() || name;
    const color = (body.color || "").trim() || "N/A";
    const alt = (body.alt || "").trim() || name;
    const style = (body.style || "").trim() || null;
    const sizes = body.sizes && body.sizes.length > 0 ? JSON.stringify(body.sizes) : null;
    const imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    const images = imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify(["/images/dresses/default.jpg"]);
    
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const res = await query(
      "INSERT INTO Items (name, pricePerDay, category, description, color, alt, style, sizes, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [name, pricePerDay, category, description, color, alt, style, sizes, images]
    );
    const insertId = (res && (res as any).insertId) || undefined;
    if (!insertId) return NextResponse.json({ error: "insert failed" }, { status: 500 });

    const inserted = await query("SELECT id, name, pricePerDay, category, sizes, style, description, color, alt, images, createdAt FROM Items WHERE id = ?", [insertId]);
    return NextResponse.json({ item: (inserted && inserted[0]) || null }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

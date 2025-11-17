import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET: lista items desde DB
export async function GET() {
  try {
    console.log('[api/items] GET handler');
    const rows = await query("SELECT id, name, pricePerDay, category, sizes FROM Items ORDER BY id DESC");
    const items = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      pricePerDay: Number(r.pricePerDay || 0),
      category: r.category || "uncategorized",
      sizes: r.sizes ? (typeof r.sizes === 'string' ? r.sizes.split(',').map((s: string) => s.trim()) : [String(r.sizes)]) : [],
      createdAt: r.createdAt || r.created_at,
    }));
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// POST: crear item mínimo compatible con init.sql
export async function POST(req: Request) {
  try {
    console.log('[api/items] POST handler start');
    const body = await req.json();
    console.log('[api/items] POST body:', body);
    const name = (body.name || "").trim();
    const price = Number(body.price || 0);
    const category = body.category || "dress";
    
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    // Build sizes value - handle array or string
    let sizesValue = 0.0;
    if (Array.isArray(body.sizes) && body.sizes.length > 0) {
      sizesValue = parseFloat(body.sizes[0]) || 0.0;
    } else if (typeof body.sizes === 'string' && body.sizes.trim()) {
      const firstSize = body.sizes.split(',')[0].trim();
      sizesValue = parseFloat(firstSize) || 0.0;
    }

    const res = await query(
      "INSERT INTO Items (name, pricePerDay, sizes, category, style, description, color, alt, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        name,
        price,
        sizesValue,
        category,
        body.style || null,
        body.description || `${name} description`,
        body.color || 'black',
        body.alt || `${name} image`,
        JSON.stringify(body.images || [])
      ]
    );
    
    const insertId = (res && (res as any).insertId) || undefined;
    if (!insertId) return NextResponse.json({ error: "insert failed" }, { status: 500 });

    const inserted = await query("SELECT id, name, pricePerDay, category, sizes FROM Items WHERE id = ?", [insertId]);
    const item = inserted && inserted[0];
    return NextResponse.json({ 
      item: item ? {
        ...item,
        pricePerDay: Number(item.pricePerDay || 0),
        sizes: item.sizes ? [String(item.sizes)] : []
      } : null 
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

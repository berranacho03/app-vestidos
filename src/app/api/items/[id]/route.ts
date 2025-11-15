import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

// PUT: actualizar item
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id, 10);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { name, category, sizes, price } = body;

    // Validar campos requeridos
    if (!name || !category) {
      return NextResponse.json(
        { error: "Nombre y categoría son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el item existe
    const existing = await query("SELECT id FROM Items WHERE id = ?", [itemId]);
    if (!existing || (existing as any[]).length === 0) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    }

    // Actualizar el item
    const sizesJson = Array.isArray(sizes) && sizes.length > 0 ? JSON.stringify(sizes) : null;
    const pricePerDay = parseFloat(price) || 0;

    await query(
      "UPDATE Items SET name = ?, category = ?, sizes = ?, pricePerDay = ? WHERE id = ?",
      [name, category, sizesJson, pricePerDay, itemId]
    );

    return NextResponse.json({
      success: true,
      message: "Item actualizado correctamente",
      item: { id: itemId, name, category, sizes, pricePerDay },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// DELETE: eliminar item
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = parseInt(id, 10);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar si el item existe
    const existing = await query("SELECT id FROM Items WHERE id = ?", [itemId]);
    if (!existing || (existing as any[]).length === 0) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    }

    // Eliminar el item
    await query("DELETE FROM Items WHERE id = ?", [itemId]);
    
    return NextResponse.json({ success: true, message: "Item eliminado correctamente" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

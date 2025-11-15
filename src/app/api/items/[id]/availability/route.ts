import { NextResponse } from "next/server";
import {getItem, getItemRentals} from "@/lib/RentalManagementSystem";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  // Para /api/items/6/availability -> parts = ["api", "items", "6", "availability"]
  // El ID está en la posición parts.length - 2
  const idStr = parts[parts.length - 2];
  const id = Number(idStr);
  const item = await getItem(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rentals = (await getItemRentals(id)).map((r) => ({ 
    start: typeof r.start === 'string' ? r.start.slice(0, 10) : r.start.toISOString().slice(0, 10),
    end: typeof r.end === 'string' ? r.end.slice(0, 10) : r.end.toISOString().slice(0, 10)
  }));
  return NextResponse.json({ rentals });
}

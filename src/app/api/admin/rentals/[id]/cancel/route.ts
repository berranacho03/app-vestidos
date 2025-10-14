import { NextResponse } from "next/server";
import { isAdmin } from "../../../../../../../lib/CsrfSessionManagement";
import { cancelRental } from "../../../../../../../lib/RentalManagementSystem";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // extrae el id de la URL de la petición; algunos tipos del runtime pueden ser
  // restrictivos, por eso parsear la ruta es más robusto en distintos entornos.
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 2] === 'rentals' ? parts[parts.length - 1] : parts[parts.length - 1];
  const { error } = cancelRental(id);
  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ ok: true });
}

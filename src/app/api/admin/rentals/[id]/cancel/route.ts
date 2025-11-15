import { NextResponse } from "next/server";
import { isAuthenticatedServer } from "../../../../../../../lib/serverAuth";
import { cancelRental } from "../../../../../../../lib/RentalManagementSystem";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticatedServer())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const rentalId = params.id;
  
  if (!rentalId) {
    return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
  }
  
  console.log("Attempting to cancel rental:", rentalId);
  const { error } = await cancelRental(rentalId);
  
  if (error) {
    console.log("Error canceling rental:", error);
    return NextResponse.json({ error }, { status: 404 });
  }
  
  console.log("Rental canceled successfully:", rentalId);
  return NextResponse.json({ ok: true });
}

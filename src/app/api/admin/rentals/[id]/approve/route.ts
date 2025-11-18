import { NextResponse } from "next/server";
import { isAuthenticatedServer } from "../../../../../../../lib/serverAuth";
import { approveRental } from "../../../../../../../lib/RentalManagementSystem";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  console.log("Approve rental API called with ID:", params.id);
  
  if (!(await isAuthenticatedServer())) {
    console.log("Authentication failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const rentalId = params.id;
  
  if (!rentalId) {
    console.log("Missing rental ID");
    return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
  }
  
  console.log("Attempting to approve rental:", rentalId);
  const result = await approveRental(rentalId);
  
  if (result.error) {
    console.log("Error approving rental:", result.error);
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  
  console.log("Rental approved successfully:", rentalId);
  return NextResponse.json({ success: true, message: "Rental approved successfully" });
}

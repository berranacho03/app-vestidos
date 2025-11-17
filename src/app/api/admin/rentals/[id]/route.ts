import { NextResponse } from "next/server";
import { isAuthenticatedServer } from "../../../../../../lib/serverAuth";
import { cancelRental } from "../../../../../../lib/RentalManagementSystem";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  console.log("Cancel rental API called with ID:", params.id);
  
  if (!(await isAuthenticatedServer())) {
    console.log("Authentication failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const rentalId = params.id;
  
  if (!rentalId) {
    console.log("Missing rental ID");
    return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
  }
  
  console.log("Attempting to cancel rental:", rentalId);
  const result = await cancelRental(rentalId);
  
  if (result.error) {
    console.log("Error canceling rental:", result.error);
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  
  console.log("Rental canceled successfully:", rentalId);
  return NextResponse.json({ success: true, message: "Rental canceled successfully" });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticatedServer())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rentalId = params.id;
  if (!rentalId) return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });

  try {
    const { deleteRental } = await import('../../../../../../lib/RentalManagementSystem');
    const result = await deleteRental(rentalId);
    if ((result as any).error) return NextResponse.json({ error: (result as any).error }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Rental deleted' });
  } catch (err) {
    console.error('Error deleting rental:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
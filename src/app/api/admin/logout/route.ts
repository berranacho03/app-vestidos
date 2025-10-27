import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/CsrfSessionManagement";

export async function POST(req: Request) {
  clearAdminSession();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/admin/login", url.origin));
}

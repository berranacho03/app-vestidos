import { NextResponse } from "next/server";
import { setAdminSession, verifyCsrfToken } from "@/lib/CsrfSessionManagement";

export async function POST(req: Request) {
  const form = await req.formData();
  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
  }
  const username = (form.get("username") || "").toString();
  const password = (form.get("password") || "").toString();

  const expected = process.env.ADMIN_PASSWORD || "admin123"; // set securely in env
  if (!username || password !== expected) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSession();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/admin", url.origin));
}

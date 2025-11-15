import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Sesión cerrada exitosamente" },
    { status: 200 }
  );

  // Eliminar la cookie del token
  response.cookies.set('user_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

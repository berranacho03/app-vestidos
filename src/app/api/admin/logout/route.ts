import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/", req.url));
  
  // Eliminar la cookie del token
  response.cookies.set({
    name: 'admin_token',
    value: '',
    expires: new Date(0),
    path: '/'
  });

  return response;
}

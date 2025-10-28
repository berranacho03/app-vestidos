import { NextResponse } from "next/server";
import { validateAdminCredentials, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const username = (form.get("username") || "").toString();
    const password = (form.get("password") || "").toString();

    if (!validateAdminCredentials({ username, password })) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generateToken();

    // Crear la respuesta JSON con éxito
    const response = NextResponse.json({ success: true });
    
    // Configurar la cookie con el token
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretKey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const users = await query(
      "SELECT id, email, password_hash, name, phone FROM Users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Crear respuesta con cookie
    const response = NextResponse.json(
      { 
        message: "Login exitoso",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      },
      { status: 200 }
    );

    // Establecer cookie con el token
    response.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}

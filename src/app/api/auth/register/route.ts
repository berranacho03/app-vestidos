import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    // Validaciones
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUsers = await query(
      "SELECT id FROM Users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      );
    }

    // Hashear la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear el usuario
    await query(
      "INSERT INTO Users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)",
      [email, password_hash, name, phone || null]
    );

    return NextResponse.json(
      { message: "Usuario registrado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}

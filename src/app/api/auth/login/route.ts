import { NextResponse } from "next/server";
import { createToken, COOKIE_NAME } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";

// Demo password for all mock users (in production, verify against bcrypt hash in DB)
const DEMO_PASSWORD = "demo123";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user || password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    if (user.estado === "SUSPENDIDO") {
      return NextResponse.json(
        { error: "Tu cuenta está suspendida. Contacta al administrador." },
        { status: 403 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      rol: user.rol,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

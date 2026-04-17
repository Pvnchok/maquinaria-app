import { NextResponse } from "next/server";
import { getUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("[api/db/users] error:", error);
    return NextResponse.json(
      { error: "Error al obtener los usuarios." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getOperatorAvailability } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operadorId = searchParams.get("operadorId");
    if (!operadorId) {
      return NextResponse.json(
        { error: "Falta el parámetro operadorId." },
        { status: 400 }
      );
    }
    const availability = await getOperatorAvailability(operadorId);
    return NextResponse.json({ availability });
  } catch (error) {
    console.error("[api/db/operator-availability] error:", error);
    return NextResponse.json(
      { error: "Error al obtener la disponibilidad." },
      { status: 500 }
    );
  }
}

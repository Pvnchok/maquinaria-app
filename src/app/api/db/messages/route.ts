import { NextResponse } from "next/server";
import { getMessages } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await getMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[api/db/messages] error:", error);
    return NextResponse.json(
      { error: "Error al obtener los mensajes." },
      { status: 500 }
    );
  }
}

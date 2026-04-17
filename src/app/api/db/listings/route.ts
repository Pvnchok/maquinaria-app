import { NextResponse } from "next/server";
import { getListings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("[api/db/listings] error:", error);
    return NextResponse.json(
      { error: "Error al obtener los listings." },
      { status: 500 }
    );
  }
}

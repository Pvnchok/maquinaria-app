/**
 * Capa de acceso a datos.
 *
 * Si Supabase está configurado (NEXT_PUBLIC_SUPABASE_URL y
 * NEXT_PUBLIC_SUPABASE_ANON_KEY), lee desde Supabase. De lo contrario hace
 * fallback a los datos mock en `src/lib/data.ts` para que la app siga
 * funcionando en entornos sin configurar.
 *
 * Las funciones server-side (sitemap, route handlers, server components) deben
 * importar desde este archivo en vez de `@/lib/data` directamente.
 */
import { createClient } from "@supabase/supabase-js";
import {
  mockListings,
  mockUsers,
  mockMessages,
  mockOperatorAvailability,
  type MockUser,
  type MockMessage,
  type OperatorAvailability,
} from "./data";

export type Listing = (typeof mockListings)[number];
export type { MockUser, MockMessage, OperatorAvailability };

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Cliente sin sesión — uso server-side / server components
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------- mappers ----------
type ListingRow = {
  id: string;
  tipo_servicio: string;
  precio_referencial: number;
  region_disponible: string;
  ciudad_disponible: string;
  usuario: Listing["usuario"];
  maquinaria: Listing["maquinaria"] | null;
};

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    tipoServicio: row.tipo_servicio,
    precioReferencial: Number(row.precio_referencial),
    regionDisponible: row.region_disponible,
    ciudadDisponible: row.ciudad_disponible,
    usuario: row.usuario,
    maquinaria: row.maquinaria ?? undefined,
  } as Listing;
}

type UserRow = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: string;
  estado: string;
  fecha_registro: string;
  clase_licencia: string | null;
  posee_maquinaria: boolean | null;
  empresa: string | null;
  password_hash: string | null;
};

function rowToUser(row: UserRow): MockUser {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono ?? "",
    rol: row.rol as MockUser["rol"],
    estado: row.estado as MockUser["estado"],
    fechaRegistro: row.fecha_registro,
    claseLicencia: row.clase_licencia ?? undefined,
    poseeMaquinaria: row.posee_maquinaria ?? undefined,
    empresa: row.empresa ?? undefined,
    passwordHash: row.password_hash ?? undefined,
  };
}

type MessageRow = {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  asunto: string;
  contenido: string;
  fecha: string;
  leido: boolean;
};

function rowToMessage(row: MessageRow): MockMessage {
  return {
    id: row.id,
    remitenteId: row.remitente_id,
    destinatarioId: row.destinatario_id,
    asunto: row.asunto,
    contenido: row.contenido,
    fecha: row.fecha,
    leido: row.leido,
  };
}

// ---------- listings ----------
export async function getListings(): Promise<Listing[]> {
  const client = getClient();
  if (!client) return mockListings;
  const { data, error } = await client.from("listings").select("*");
  if (error) {
    console.error("[db.getListings] error:", error.message);
    return mockListings;
  }
  return (data as ListingRow[]).map(rowToListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const client = getClient();
  if (!client) return mockListings.find((l) => l.id === id) ?? null;
  const { data, error } = await client
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db.getListingById] error:", error.message);
    return mockListings.find((l) => l.id === id) ?? null;
  }
  return data ? rowToListing(data as ListingRow) : null;
}

// ---------- users ----------
export async function getUsers(): Promise<MockUser[]> {
  const client = getClient();
  if (!client) return mockUsers;
  const { data, error } = await client.from("users").select("*");
  if (error) {
    console.error("[db.getUsers] error:", error.message);
    return mockUsers;
  }
  return (data as UserRow[]).map(rowToUser);
}

export async function getUserByEmail(email: string): Promise<MockUser | null> {
  const client = getClient();
  if (!client) {
    return (
      mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
      null
    );
  }
  const { data, error } = await client
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  if (error) {
    console.error("[db.getUserByEmail] error:", error.message);
    return (
      mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
      null
    );
  }
  return data ? rowToUser(data as UserRow) : null;
}

// ---------- messages ----------
export async function getMessages(): Promise<MockMessage[]> {
  const client = getClient();
  if (!client) return mockMessages;
  const { data, error } = await client
    .from("messages")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) {
    console.error("[db.getMessages] error:", error.message);
    return mockMessages;
  }
  return (data as MessageRow[]).map(rowToMessage);
}

// ---------- operator availability ----------
export async function getOperatorAvailability(
  operadorId: string
): Promise<OperatorAvailability | null> {
  const client = getClient();
  if (!client) {
    return (
      mockOperatorAvailability.find((a) => a.operadorId === operadorId) ?? null
    );
  }
  const { data, error } = await client
    .from("operator_availability")
    .select("*")
    .eq("operador_id", operadorId)
    .maybeSingle();
  if (error) {
    console.error("[db.getOperatorAvailability] error:", error.message);
    return (
      mockOperatorAvailability.find((a) => a.operadorId === operadorId) ?? null
    );
  }
  if (!data) return null;
  return {
    operadorId: data.operador_id,
    diasLibres: data.dias_libres ?? [],
  };
}

/**
 * Helper para saber si Supabase está activo (útil para mostrar banners en UI).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

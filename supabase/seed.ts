/**
 * Supabase seed script.
 *
 * Toma los datos mock de `src/lib/data.ts` y los inserta en el Supabase
 * configurado en `.env.local`. Requiere `SUPABASE_SERVICE_ROLE_KEY` para
 * bypassear RLS al escribir.
 *
 * Uso:
 *   1. Configura `.env.local` con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   2. Asegúrate de haber corrido `supabase/schema.sql` en tu SQL Editor
 *   3. `npm run supabase:seed`
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import {
  mockListings,
  mockUsers,
  mockMessages,
  mockOperatorAvailability,
} from "../src/lib/data";

// Cargar manualmente .env.local (tsx no lo hace automáticamente)
function loadEnvLocal() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local no existe — confiar en variables de entorno del shell
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
        "   Crea un archivo .env.local basado en .env.example."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("🧹 Limpiando tablas existentes...");
  await supabase.from("operator_availability").delete().neq("operador_id", "");
  await supabase.from("messages").delete().neq("id", "");
  await supabase.from("listings").delete().neq("id", "");
  await supabase.from("users").delete().neq("id", "");

  console.log(`👥 Insertando ${mockUsers.length} usuarios...`);
  const usersPayload = mockUsers.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono,
    rol: u.rol,
    estado: u.estado,
    fecha_registro: u.fechaRegistro,
    clase_licencia: u.claseLicencia ?? null,
    posee_maquinaria: u.poseeMaquinaria ?? null,
    empresa: u.empresa ?? null,
    password_hash: u.passwordHash ?? null,
  }));
  const { error: usersError } = await supabase.from("users").insert(usersPayload);
  if (usersError) throw usersError;

  console.log(`🏗️  Insertando ${mockListings.length} listings...`);
  const listingsPayload = mockListings.map((l) => ({
    id: l.id,
    tipo_servicio: l.tipoServicio,
    precio_referencial: l.precioReferencial,
    region_disponible: l.regionDisponible,
    ciudad_disponible: l.ciudadDisponible,
    usuario: l.usuario,
    maquinaria: l.maquinaria ?? null,
    estado: "ACTIVO",
  }));
  // Insertar en batches para no golpear límites de payload
  for (let i = 0; i < listingsPayload.length; i += 20) {
    const batch = listingsPayload.slice(i, i + 20);
    const { error } = await supabase.from("listings").insert(batch);
    if (error) throw error;
  }

  console.log(`✉️  Insertando ${mockMessages.length} mensajes...`);
  const messagesPayload = mockMessages.map((m) => ({
    id: m.id,
    remitente_id: m.remitenteId,
    destinatario_id: m.destinatarioId,
    asunto: m.asunto,
    contenido: m.contenido,
    fecha: m.fecha,
    leido: m.leido,
  }));
  const { error: msgError } = await supabase
    .from("messages")
    .insert(messagesPayload);
  if (msgError) throw msgError;

  console.log(
    `📅 Insertando disponibilidad para ${mockOperatorAvailability.length} operadores...`
  );
  const availabilityPayload = mockOperatorAvailability.map((a) => ({
    operador_id: a.operadorId,
    dias_libres: a.diasLibres,
  }));
  const { error: availError } = await supabase
    .from("operator_availability")
    .insert(availabilityPayload);
  if (availError) throw availError;

  console.log("✅ Seed completado. Revisa tu dashboard de Supabase → Table Editor.");
}

main().catch((err) => {
  console.error("❌ Error durante el seed:", err);
  process.exit(1);
});

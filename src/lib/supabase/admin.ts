import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client with the `service_role` key. Bypasses Row Level
 * Security. Must ONLY be used server-side (seed scripts, trusted admin
 * endpoints). Never import this into a Client Component.
 *
 * Returns `null` if the service-role key is not configured.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

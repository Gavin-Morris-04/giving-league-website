import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the SERVICE ROLE key, which bypasses Row Level Security, so it must never reach the browser. The
 * `server-only` import makes the build fail if a client component imports this file. Public visitors never
 * talk to Supabase directly: every write goes through a validated server action, and every table has RLS
 * enabled with no anonymous policies (see supabase/migrations/0001_init.sql).
 */
let client: SupabaseClient | null | undefined;

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isSupabaseConfigured()) {
    client = null;
    return client;
  }
  client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

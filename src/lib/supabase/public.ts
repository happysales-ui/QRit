import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

/**
 * Cookie-less anon client for public reads (profiles/links). Unlike the
 * server client it never touches `cookies()`, so routes that only need
 * public data stay statically cacheable (ISR).
 */
export function createPublicClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  SUPABASE_SERVICE_ROLE_NOT_CONFIGURED,
} from "@/lib/supabase/env";

export function createServiceClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey().trim();

  if (!serviceRoleKey) {
    throw new Error(SUPABASE_SERVICE_ROLE_NOT_CONFIGURED);
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

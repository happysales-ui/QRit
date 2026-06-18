import { createClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profile";
import type { Profile } from "@/types";

export function isAdmin(
  profile: Pick<Profile, "is_admin"> | null | undefined,
): boolean {
  return profile?.is_admin === true;
}

export async function requireAdminProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const profile = await getProfileForUser(user.id);

  if (!profile || !isAdmin(profile)) {
    throw new Error("FORBIDDEN");
  }

  return { supabase, user, profile };
}

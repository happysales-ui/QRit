import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SubscriptionStatus } from "@/lib/subscription";
import type { LinkBlock, Profile } from "@/types";
import type { ProfileWithLinks } from "@/lib/mock-profile";

function normalizeLinkRow(link: Record<string, unknown>): LinkBlock {
  const row = link as unknown as LinkBlock;
  return {
    ...row,
    bank_code: row.bank_code ?? null,
    account_no: row.account_no ?? null,
    is_hidden: row.is_hidden === true,
  };
}

function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  if (value === "paid" || value === "expired" || value === "free") {
    return value;
  }
  return "free";
}

function normalizeProfileRow(profile: Record<string, unknown>): Profile {
  const row = profile as unknown as Profile;
  const fallbackFreeUntil = new Date(
    Date.parse(String(row.created_at)) + 2 * 365 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const freeUntil =
    (row.free_until as string | undefined) ??
    (row.expired_at as string | undefined) ??
    fallbackFreeUntil;

  return {
    ...row,
    phone: row.phone ?? null,
    default_link_id: row.default_link_id ?? null,
    expired_at: (row.expired_at as string | undefined) ?? freeUntil,
    free_until: freeUntil,
    subscription_status: normalizeSubscriptionStatus(row.subscription_status),
    is_admin: row.is_admin === true,
  };
}

export async function getProfileByUsername(
  username: string,
): Promise<ProfileWithLinks | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const normalized = username.toLowerCase();

  const { data: profile, error: profileError } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("username", normalized)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true });

  if (linksError) {
    return null;
  }

  return {
    profile: normalizeProfileRow({ ...profile, phone: null, is_admin: false }),
    links: (links ?? []).map((link) => normalizeLinkRow(link)),
  };
}

export async function getProfileForUser(
  userId: string,
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeProfileRow(data);
}

export async function getLinksForProfile(
  profileId: string,
): Promise<LinkBlock[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map((link) => normalizeLinkRow(link));
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  const supabase = await createClient();
  const normalized = username.toLowerCase();

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  if (error) {
    return false;
  }

  if (!data) {
    return true;
  }

  if (excludeUserId && data.id === excludeUserId) {
    return true;
  }

  return false;
}

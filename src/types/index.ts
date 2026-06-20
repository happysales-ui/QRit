import type { SubscriptionStatus } from "@/lib/subscription";

export interface Profile {
  id: string;
  username: string;
  phone: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  default_link_id: string | null;
  expired_at: string;
  free_until: string;
  subscription_status: SubscriptionStatus;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkBlock {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  bank_code: string | null;
  account_no: string | null;
  sort_order: number;
  is_active: boolean;
  is_hidden: boolean;
  created_at: string;
}

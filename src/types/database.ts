export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          subscription_status: "free" | "expired" | "paid";
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          phone?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: string;
          default_link_id?: string | null;
          expired_at?: string;
          free_until?: string;
          subscription_status?: "free" | "expired" | "paid";
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          phone?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: string;
          default_link_id?: string | null;
          expired_at?: string;
          free_until?: string;
          subscription_status?: "free" | "expired" | "paid";
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      links: {
        Row: {
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
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          url: string;
          bank_code?: string | null;
          account_no?: string | null;
          sort_order?: number;
          is_active?: boolean;
          is_hidden?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          url?: string;
          bank_code?: string | null;
          account_no?: string | null;
          sort_order?: number;
          is_active?: boolean;
          is_hidden?: boolean;
          created_at?: string;
        };
      };
      public_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          theme: string;
          default_link_id: string | null;
          expired_at: string;
          free_until: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          status: "unused" | "used";
          created_at: string;
          used_at: string | null;
          used_by_user_id: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          status?: "unused" | "used";
          created_at?: string;
          used_at?: string | null;
          used_by_user_id?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          status?: "unused" | "used";
          created_at?: string;
          used_at?: string | null;
          used_by_user_id?: string | null;
          note?: string | null;
        };
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          theme: string;
          default_link_id: string | null;
          expired_at: string;
          free_until: string;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_username_taken: {
        Args: { p_username: string };
        Returns: boolean;
      };
      is_phone_taken: {
        Args: { p_phone: string };
        Returns: boolean;
      };
      verify_invite_code: {
        Args: { p_code: string };
        Returns: "valid" | "invalid_format" | "not_found" | "already_used";
      };
      consume_invite_code: {
        Args: { p_code: string; p_user_id: string };
        Returns: boolean;
      };
      check_password_reset_rate_limit: {
        Args: {
          p_bucket_key: string;
          p_max_attempts?: number;
          p_window_minutes?: number;
        };
        Returns: boolean;
      };
      verify_profile_for_password_reset: {
        Args: { p_phone: string; p_username: string };
        Returns: string | null;
      };
    };
  };
}

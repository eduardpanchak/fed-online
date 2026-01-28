import type { SupabaseClient } from "@supabase/supabase-js"
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]



export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          clicks: number
          country: string | null
          created_at: string
          expires_at: string
          id: string
          impressions: number
          // is_paid: boolean | null
          is_trial: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          media_type: string
          media_url: string
          paid_until: string | null
          postcode: string | null
          status: string
          target_url: string
          trial_ended_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          clicks?: number
          country?: string | null
          created_at?: string
          expires_at: string
          id?: string
          impressions?: number
          languages?: string[] | null
          // is_paid?: boolean | null
          is_trial?: boolean | null
          latitude?: number | null
          longitude?: number | null
          media_type: string
          media_url: string
          paid_until?: string | null
          postcode?: string | null
          status?: string
          target_url: string
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          clicks?: number
          country?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          impressions?: number
          // is_paid?: boolean | null
          is_trial?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          media_type?: string
          media_url?: string
          paid_until?: string | null
          postcode?: string | null
          status?: string
          target_url?: string
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_type: string | null
          city_area: string | null
          created_at: string
          id: string
          languages: string[] | null
          services_provided: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          business_type?: string | null
          city_area?: string | null
          created_at?: string
          id?: string
          languages?: string[] | null
          services_provided?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          business_type?: string | null
          city_area?: string | null
          created_at?: string
          id?: string
          languages?: string[] | null
          services_provided?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      checklist_progress: {
        Row: {
          checklist_id: string
          completed: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist_id: string
          completed?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      list_items: {
        Row: {
          created_at: string
          id: string
          is_done: boolean
          list_id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean
          list_id: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean
          list_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          is_template: boolean
          progress: number
          template_key: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_template?: boolean
          progress?: number
          template_key?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_template?: boolean
          progress?: number
          template_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }

      owner_bans: {
        Row: {
          banned_by: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }

      profiles: {
        Row: {
          ad_trial_ended_at: string | null
          ad_trial_started_at: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          entitlement_active: boolean | null
          entitlement_expires_at: string | null
          has_used_ad_trial: boolean | null
          id: string
          is_business_user: boolean | null
          location: string | null
          name: string | null
          phone: string | null
          premium_trial_used: boolean
          revenuecat_customer_id: string | null
          standart_trial_used: boolean
          trial_ad_id: string | null
          updated_at: string
        }
        Insert: {
          ad_trial_ended_at?: string | null
          ad_trial_started_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          entitlement_active?: boolean | null
          entitlement_expires_at?: string | null
          has_used_ad_trial?: boolean | null
          id: string
          is_business_user?: boolean | null
          location?: string | null
          name?: string | null
          phone?: string | null
          premium_trial_used: boolean
          revenuecat_customer_id?: string | null
          standart_trial_used: boolean
          trial_ad_id?: string | null
          updated_at?: string
        }
        Update: {
          ad_trial_ended_at?: string | null
          ad_trial_started_at?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          entitlement_active?: boolean | null
          entitlement_expires_at?: string | null
          has_used_ad_trial?: boolean | null
          id?: string
          is_business_user?: boolean | null
          location?: string | null
          name?: string | null
          phone?: string | null
          premium_trial_used?: boolean
          revenuecat_customer_id?: string | null 
          standart_trial_used?: boolean 
          trial_ad_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      service_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          address: string | null
          borough: string | null
          category: string
          city: string | null
          country: string | null
          click_count: number | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          languages: string[]
          latitude: number | null
          longitude: number | null
           moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          phone: string | null
          photos: string[] | null
          postcode: string | null
          pricing: string | null
          reports_count: number | null
          service_name: string
          social_links: Json | null
          status: string
          stripe_subscription_id: string | null
          subscription_tier: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          address?: string | null
          borough?: string | null
          category: string
          city?: string | null
          country?: string | null
          postcode?: string | null
          click_count?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          languages: string[]
          latitude?: number | null
          longitude?: number | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          phone?: string | null
          photos?: string[] | null
          pricing?: string | null
          reports_count?: number | null
          service_name: string
          social_links?: Json | null
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          address?: string | null
          borough?: string | null
          category?: string
          city?: string | null
          country?: string | null
          postcode?: string | null
          click_count?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          phone?: string | null
          photos?: string[] | null
          pricing?: string | null
          reports_count?: number | null
          service_name?: string
          social_links?: Json | null
          status?: string
          stripe_subscription_id?: string | null
          subscription_tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }

      user_entitlements: {
        Row: {
          ads_active: boolean
          ads_expires_at: string | null
          created_at: string
          id: string
          // premium_active: boolean
          // premium_expires_at: string | null
          revenuecat_customer_id: string | null
          top_service_active: boolean
          top_service_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_active?: boolean
          ads_expires_at?: string | null
          created_at?: string
          id?: string
          // premium_active?: boolean
          // premium_expires_at?: string | null
          revenuecat_customer_id?: string | null
          top_service_active?: boolean
          top_service_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_active?: boolean
          ads_expires_at?: string | null
          created_at?: string
          id?: string
          // premium_active?: boolean
          // premium_expires_at?: string | null
          revenuecat_customer_id?: string | null
          top_service_active?: boolean
          top_service_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }

      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }

      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string | null
          notifications: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    
    Views: {
      active_advertisements: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          clicks: number | null
          country: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          impressions: number | null
          // is_paid: boolean | null
          is_trial: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          media_type: string | null
          media_url: string | null
          paid_until: string | null
          postcode: string | null
          status: string | null
          target_url: string | null
          trial_days_remaining: number | null
          trial_ended_at: string | null
          trial_started_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          impressions?: number | null
          // is_paid?: boolean | null
          is_trial?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          media_type?: string | null
          media_url?: string | null
          paid_until?: string | null
          postcode?: string | null
          status?: string | null
          target_url?: string | null
          trial_days_remaining?: never
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          impressions?: number | null
          // is_paid?: boolean | null
          is_trial?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          media_type?: string | null
          media_url?: string | null
          paid_until?: string | null
          postcode?: string | null
          status?: string | null
          target_url?: string | null
          trial_days_remaining?: never
          trial_ended_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_paid_ad: { Args: { p_ad_id: string }; Returns: Json }
      can_get_ad_trial: { Args: never; Returns: boolean }
      cancel_expired_trials: { Args: never; Returns: undefined }
      expire_trial_ads: { Args: never; Returns: number }
      get_ad_trial_status: { Args: never; Returns: Json }
      get_services_seeded_order: {
        Args: { seed_value: number }
        Returns: {
          borough: string
          category: string
          city: string
          country: string
          description: string
          id: string
          languages: string[]
          latitude: number
          longitude: number
          photos: string[]
          postcode: string
          pricing: string
          service_name: string
          subscription_tier: string
        }[]
      }

      get_user_entitlements: { Args: { p_user_id?: string }; Returns: Json }
      has_ads_entitlement: { Args: { p_user_id?: string }; Returns: boolean }
      // has_premium_entitlement: {
      //   Args: { p_user_id?: string }
      //   Returns: boolean
      // }
      has_top_service_entitlement: {
        Args: { p_user_id?: string }
        Returns: boolean
      }

      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ad_clicks: { Args: { ad_id: string }; Returns: undefined }
      increment_ad_impressions: { Args: { ad_id: string }; Returns: undefined }
      increment_click_count: {
        Args: { service_id: string }
        Returns: undefined
      }
      increment_view_count: { Args: { service_id: string }; Returns: undefined }
      publish_ad: {
        Args: {
          p_address?: string
          p_category?: string
          p_city?: string
          p_country?: string
          p_languages?: string[]
          p_latitude?: number
          p_longitude?: number
          p_media_type: string
          p_media_url: string
          p_postcode?: string
          p_request_trial?: boolean
          p_target_url: string
        }
        Returns: Json
      }
        publish_top_service: { Args: { p_service_id: string }; Returns: Json }
      sync_user_entitlements: {
        Args: {
          p_ads_active?: boolean
          p_ads_expires_at?: string
          p_premium_active?: boolean
          p_premium_expires_at?: string
          p_revenuecat_customer_id?: string
          p_top_service_active?: boolean
          p_top_service_expires_at?: string
          p_user_id: string
        }
        Returns: boolean
      }
      update_user_entitlement: {
        Args: {
          p_active: boolean
          p_expires_at: string
          p_revenuecat_customer_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      moderation_status: "active" | "under_review" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      moderation_status: ["active", "under_review", "suspended"],
    },
  },
} as const

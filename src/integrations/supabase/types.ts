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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_waitlist: {
        Row: {
          consent_version: string
          created_at: string
          email: string
          id: string
          interests: string[]
        }
        Insert: {
          consent_version?: string
          created_at?: string
          email: string
          id?: string
          interests?: string[]
        }
        Update: {
          consent_version?: string
          created_at?: string
          email?: string
          id?: string
          interests?: string[]
        }
        Relationships: []
      }
      community_waitlist_rate_limits: {
        Row: {
          attempts: number
          fingerprint: string
          window_start: string
        }
        Insert: {
          attempts?: number
          fingerprint: string
          window_start?: string
        }
        Update: {
          attempts?: number
          fingerprint?: string
          window_start?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          idempotency_key: string
          operation: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          idempotency_key: string
          operation: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          idempotency_key?: string
          operation?: string
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          admin_only: boolean
          enabled: boolean
          key: string
          org_allowlist: string[]
          updated_at: string
          user_allowlist: string[]
        }
        Insert: {
          admin_only?: boolean
          enabled?: boolean
          key: string
          org_allowlist?: string[]
          updated_at?: string
          user_allowlist?: string[]
        }
        Update: {
          admin_only?: boolean
          enabled?: boolean
          key?: string
          org_allowlist?: string[]
          updated_at?: string
          user_allowlist?: string[]
        }
        Relationships: []
      }
      guest_usage: {
        Row: {
          created_at: string
          fingerprint: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
        }
        Relationships: []
      }
      knowledge_resources: {
        Row: {
          access_level: string
          category: string
          commercial_reuse_allowed: boolean
          created_at: string
          evidence_strength: string | null
          file_version: string
          full_content: string | null
          hosting_allowed: boolean
          id: string
          kind: string
          language: string
          licence_name: string
          licence_url: string | null
          original_url: string
          permission_reference: string | null
          preview_content: string
          published: boolean
          published_at: string | null
          publisher: string
          redistribution_allowed: boolean
          region: string
          reuse_conditions: string
          rights_reviewed_at: string | null
          rights_status: string
          slug: string
          source_count: number
          summary: string
          title: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          access_level?: string
          category?: string
          commercial_reuse_allowed?: boolean
          created_at?: string
          evidence_strength?: string | null
          file_version?: string
          full_content?: string | null
          hosting_allowed?: boolean
          id?: string
          kind?: string
          language?: string
          licence_name?: string
          licence_url?: string | null
          original_url: string
          permission_reference?: string | null
          preview_content?: string
          published?: boolean
          published_at?: string | null
          publisher: string
          redistribution_allowed?: boolean
          region?: string
          reuse_conditions?: string
          rights_reviewed_at?: string | null
          rights_status?: string
          slug: string
          source_count?: number
          summary?: string
          title: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          access_level?: string
          category?: string
          commercial_reuse_allowed?: boolean
          created_at?: string
          evidence_strength?: string | null
          file_version?: string
          full_content?: string | null
          hosting_allowed?: boolean
          id?: string
          kind?: string
          language?: string
          licence_name?: string
          licence_url?: string | null
          original_url?: string
          permission_reference?: string | null
          preview_content?: string
          published?: boolean
          published_at?: string | null
          publisher?: string
          redistribution_allowed?: boolean
          region?: string
          reuse_conditions?: string
          rights_reviewed_at?: string | null
          rights_status?: string
          slug?: string
          source_count?: number
          summary?: string
          title?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: Json
          created_at: string
          id: string
          question: string
          share_token: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          question: string
          share_token?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          question?: string
          share_token?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      research_cache: {
        Row: {
          created_at: string
          key: string
          kind: string
          payload: Json
        }
        Insert: {
          created_at?: string
          key: string
          kind: string
          payload: Json
        }
        Update: {
          created_at?: string
          key?: string
          kind?: string
          payload?: Json
        }
        Relationships: []
      }
      resource_downloads: {
        Row: {
          downloaded_at: string
          file_version: string
          id: string
          period_end: string
          period_start: string
          resource_id: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          file_version: string
          id?: string
          period_end: string
          period_start: string
          resource_id: string
          subscription_id: string
          user_id: string
        }
        Update: {
          downloaded_at?: string
          file_version?: string
          id?: string
          period_end?: string
          period_start?: string
          resource_id?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_downloads_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "knowledge_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_downloads_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_issues: {
        Row: {
          created_at: string
          id: string
          issue_type: string
          message: string
          resource_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_type: string
          message: string
          resource_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_type?: string
          message?: string
          resource_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_issues_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "knowledge_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_sources: {
        Row: {
          id: string
          licence_name: string
          publisher: string
          resource_id: string
          retrieved_at: string
          reuse_conditions: string
          title: string
          url: string
        }
        Insert: {
          id?: string
          licence_name?: string
          publisher: string
          resource_id: string
          retrieved_at?: string
          reuse_conditions?: string
          title: string
          url: string
        }
        Update: {
          id?: string
          licence_name?: string
          publisher?: string
          resource_id?: string
          retrieved_at?: string
          reuse_conditions?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_sources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "knowledge_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_meter: {
        Row: {
          actual_cost_usd: number | null
          created_at: string
          estimated_cost_usd: number | null
          event_type: string
          guest_fingerprint: string | null
          id: string
          idempotency_key: string | null
          latency_ms: number | null
          model_route: string | null
          organization_id: string | null
          period_end: string
          period_start: string
          plan: string
          provider: string | null
          quantity: number
          report_id: string | null
          resource_id: string | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          actual_cost_usd?: number | null
          created_at?: string
          estimated_cost_usd?: number | null
          event_type: string
          guest_fingerprint?: string | null
          id?: string
          idempotency_key?: string | null
          latency_ms?: number | null
          model_route?: string | null
          organization_id?: string | null
          period_end: string
          period_start: string
          plan?: string
          provider?: string | null
          quantity?: number
          report_id?: string | null
          resource_id?: string | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          actual_cost_usd?: number | null
          created_at?: string
          estimated_cost_usd?: number | null
          event_type?: string
          guest_fingerprint?: string | null
          id?: string
          idempotency_key?: string | null
          latency_ms?: number | null
          model_route?: string | null
          organization_id?: string | null
          period_end?: string
          period_start?: string
          plan?: string
          provider?: string | null
          quantity?: number
          report_id?: string | null
          resource_id?: string | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_cache: {
        Row: {
          claim_hash: string
          created_at: string
          result: Json
        }
        Insert: {
          claim_hash: string
          created_at?: string
          result: Json
        }
        Update: {
          claim_hash?: string
          created_at?: string
          result?: Json
        }
        Relationships: []
      }
      verification_rate_limits: {
        Row: {
          attempts: number
          subject_hash: string
          window_start: string
        }
        Insert: {
          attempts?: number
          subject_hash: string
          window_start?: string
        }
        Update: {
          attempts?: number
          subject_hash?: string
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_library_download:
        | {
            Args: { resource_uuid: string }
            Returns: {
              content: string
              remaining: number
              resets_at: string
            }[]
          }
        | {
            Args: { check_env: string; resource_uuid: string }
            Returns: {
              content: string
              remaining: number
              resets_at: string
            }[]
          }
      consume_credits: {
        Args: {
          _allowance: number
          _cost: number
          _key: string
          _op: string
          _pend: string
          _pstart: string
          _user: string
        }
        Returns: {
          ok: boolean
          remaining: number
          replay: boolean
          used: number
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_community_waitlist: {
        Args: { p_email: string; p_fingerprint: string; p_interest?: string }
        Returns: undefined
      }
      reserve_verification_request: {
        Args: { p_authenticated: boolean; p_subject_hash: string }
        Returns: {
          allowed: boolean
          remaining: number
          resets_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const

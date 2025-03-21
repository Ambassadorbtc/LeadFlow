export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          industry: string | null
          name: string
          prospect_id: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          prospect_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          prospect_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          owner: string | null
          phone: string | null
          position: string | null
          prospect_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          owner?: string | null
          phone?: string | null
          position?: string | null
          prospect_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          owner?: string | null
          phone?: string | null
          position?: string | null
          prospect_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closing_date: string | null
          company: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string | null
          deal_type: string | null
          description: string | null
          id: string
          name: string
          prospect_id: string | null
          stage: string
          updated_at: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          closing_date?: string | null
          company?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          deal_type?: string | null
          description?: string | null
          id?: string
          name: string
          prospect_id?: string | null
          stage: string
          updated_at?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          closing_date?: string | null
          company?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string | null
          deal_type?: string | null
          description?: string | null
          id?: string
          name?: string
          prospect_id?: string | null
          stage?: string
          updated_at?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type?: string | null
          status: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_history: {
        Row: {
          created_at: string | null
          file_name: string | null
          id: string
          import_type: string
          metadata: Json | null
          record_count: number
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          id?: string
          import_type: string
          metadata?: Json | null
          record_count: number
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          id?: string
          import_type?: string
          metadata?: Json | null
          record_count?: number
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lead_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          lead_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          lead_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_comments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          ba_interest: boolean | null
          bf_interest: boolean | null
          business_name: string
          contact_email: string | null
          contact_name: string
          created_at: string | null
          ct_interest: boolean | null
          deal_value: number | null
          id: string
          import_batch_id: string | null
          notes: string | null
          owner: string | null
          phone: string | null
          prospect_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          ba_interest?: boolean | null
          bf_interest?: boolean | null
          business_name: string
          contact_email?: string | null
          contact_name: string
          created_at?: string | null
          ct_interest?: boolean | null
          deal_value?: number | null
          id?: string
          import_batch_id?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          prospect_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          ba_interest?: boolean | null
          bf_interest?: boolean | null
          business_name?: string
          contact_email?: string | null
          contact_name?: string
          created_at?: string | null
          ct_interest?: boolean | null
          deal_value?: number | null
          id?: string
          import_batch_id?: string | null
          notes?: string | null
          owner?: string | null
          phone?: string | null
          prospect_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          company_name: string | null
          contact_email: string | null
          created_at: string | null
          enable_email_notifications: boolean | null
          enable_in_app_notifications: boolean | null
          enable_notifications: boolean | null
          enable_user_registration: boolean | null
          id: string
          maintenance_message: string | null
          maintenance_mode: boolean | null
          max_users: number | null
          password_reset_email_template: string | null
          privacy_policy: string | null
          site_name: string | null
          support_email: string | null
          terms_of_service: string | null
          updated_at: string | null
          welcome_email_template: string | null
          welcome_message: string | null
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          enable_email_notifications?: boolean | null
          enable_in_app_notifications?: boolean | null
          enable_notifications?: boolean | null
          enable_user_registration?: boolean | null
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_users?: number | null
          password_reset_email_template?: string | null
          privacy_policy?: string | null
          site_name?: string | null
          support_email?: string | null
          terms_of_service?: string | null
          updated_at?: string | null
          welcome_email_template?: string | null
          welcome_message?: string | null
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          created_at?: string | null
          enable_email_notifications?: boolean | null
          enable_in_app_notifications?: boolean | null
          enable_notifications?: boolean | null
          enable_user_registration?: boolean | null
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_users?: number | null
          password_reset_email_template?: string | null
          privacy_policy?: string | null
          site_name?: string | null
          support_email?: string | null
          terms_of_service?: string | null
          updated_at?: string | null
          welcome_email_template?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_refresh_dashboard: boolean | null
          compact_view: boolean | null
          contact_updates: boolean | null
          created_at: string | null
          date_format: string | null
          deal_notifications: boolean | null
          deal_updates: boolean | null
          default_currency: string | null
          default_language: string | null
          disable_onboarding: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          lead_notifications: boolean | null
          marketing_emails: boolean | null
          onboarding_completed: boolean | null
          show_deal_values: boolean | null
          task_notifications: boolean | null
          theme_preference: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_refresh_dashboard?: boolean | null
          compact_view?: boolean | null
          contact_updates?: boolean | null
          created_at?: string | null
          date_format?: string | null
          deal_notifications?: boolean | null
          deal_updates?: boolean | null
          default_currency?: string | null
          default_language?: string | null
          disable_onboarding?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          lead_notifications?: boolean | null
          marketing_emails?: boolean | null
          onboarding_completed?: boolean | null
          show_deal_values?: boolean | null
          task_notifications?: boolean | null
          theme_preference?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_refresh_dashboard?: boolean | null
          compact_view?: boolean | null
          contact_updates?: boolean | null
          created_at?: string | null
          date_format?: string | null
          deal_notifications?: boolean | null
          deal_updates?: boolean | null
          default_currency?: string | null
          default_language?: string | null
          disable_onboarding?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          lead_notifications?: boolean | null
          marketing_emails?: boolean | null
          onboarding_completed?: boolean | null
          show_deal_values?: boolean | null
          task_notifications?: boolean | null
          theme_preference?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          credits: string | null
          disable_onboarding: boolean | null
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_admin: boolean | null
          is_blocked: boolean | null
          job_title: string | null
          name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          subscription: string | null
          token_identifier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits?: string | null
          disable_onboarding?: boolean | null
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          job_title?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          subscription?: string | null
          token_identifier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          credits?: string | null
          disable_onboarding?: boolean | null
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          job_title?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          subscription?: string | null
          token_identifier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: {
          query: string
        }
        Returns: Record<string, unknown>[]
      }
      fix_duplicate_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_total_deal_value: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sync_missing_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

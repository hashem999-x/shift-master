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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          number: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          number: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          number?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          profile_id: string
          read_at: string | null
          task_id: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id: string
          read_at?: string | null
          task_id?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          read_at?: string | null
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string
          created_at: string
          employee_number: string
          full_name: string
          id: string
          responsibilities: string | null
          role: Database["public"]["Enums"]["app_role"]
          shift_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          employee_number: string
          full_name: string
          id?: string
          responsibilities?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          shift_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          employee_number?: string
          full_name?: string
          id?: string
          responsibilities?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          shift_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          allowed: boolean
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          allowed?: boolean
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          allowed?: boolean
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      sections: {
        Row: {
          branch_id: string | null
          color: string
          created_at: string
          icon: string
          id: string
          is_default: boolean
          key: string
          management_only: boolean
          name: string
          sort_order: number
        }
        Insert: {
          branch_id?: string | null
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          key: string
          management_only?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          branch_id?: string | null
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean
          key?: string
          management_only?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "sections_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_handovers: {
        Row: {
          branch_id: string
          completed_count: number
          created_at: string
          from_profile_id: string | null
          from_shift_id: string | null
          id: string
          notes: string | null
          overdue_count: number
          overtime_taken: boolean
          pending_count: number
          to_shift_id: string | null
        }
        Insert: {
          branch_id: string
          completed_count?: number
          created_at?: string
          from_profile_id?: string | null
          from_shift_id?: string | null
          id?: string
          notes?: string | null
          overdue_count?: number
          overtime_taken?: boolean
          pending_count?: number
          to_shift_id?: string | null
        }
        Update: {
          branch_id?: string
          completed_count?: number
          created_at?: string
          from_profile_id?: string | null
          from_shift_id?: string | null
          id?: string
          notes?: string | null
          overdue_count?: number
          overtime_taken?: boolean
          pending_count?: number
          to_shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_handovers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_from_profile_id_fkey"
            columns: ["from_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_from_shift_id_fkey"
            columns: ["from_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_to_shift_id_fkey"
            columns: ["to_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          allows_overtime: boolean
          branch_id: string | null
          created_at: string
          end_time: string
          id: string
          name: string
          overtime_end_time: string | null
          sort_order: number
          start_time: string
        }
        Insert: {
          allows_overtime?: boolean
          branch_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          name: string
          overtime_end_time?: string | null
          sort_order?: number
          start_time: string
        }
        Update: {
          allows_overtime?: boolean
          branch_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          name?: string
          overtime_end_time?: string | null
          sort_order?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      task_favorites: {
        Row: {
          created_at: string
          profile_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_favorites_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          action: string
          actor_id: string | null
          branch_id: string
          created_at: string
          detail: Json
          id: string
          occurrence_id: string | null
          task_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          branch_id: string
          created_at?: string
          detail?: Json
          id?: string
          occurrence_id?: string | null
          task_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          branch_id?: string
          created_at?: string
          detail?: Json
          id?: string
          occurrence_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "task_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notes: {
        Row: {
          author_id: string | null
          body: string
          branch_id: string
          created_at: string
          id: string
          occurrence_id: string | null
          task_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          branch_id: string
          created_at?: string
          id?: string
          occurrence_id?: string | null
          task_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          branch_id?: string
          created_at?: string
          id?: string
          occurrence_id?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "task_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_occurrences: {
        Row: {
          branch_id: string
          completed_at: string | null
          completed_by: string | null
          completion_note: string | null
          created_at: string
          due_at: string
          id: string
          status: Database["public"]["Enums"]["occurrence_status"]
          task_id: string
        }
        Insert: {
          branch_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_note?: string | null
          created_at?: string
          due_at: string
          id?: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          task_id: string
        }
        Update: {
          branch_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_note?: string | null
          created_at?: string
          due_at?: string
          id?: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_occurrences_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_occurrences_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_occurrences_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_photos: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["photo_kind"]
          occurrence_id: string | null
          path: string
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["photo_kind"]
          occurrence_id?: string | null
          path: string
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["photo_kind"]
          occurrence_id?: string | null
          path?: string
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_photos_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "task_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          payload: Json
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          payload?: Json
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assign_all: boolean
          assigned_shift_id: string | null
          assigned_to: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          day_of_month: number | null
          description: string | null
          due_time: string | null
          end_date: string | null
          id: string
          interval_minutes: number | null
          is_archived: boolean
          is_management: boolean
          is_paused: boolean
          is_temporary: boolean
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          recurrence: string
          reminder_minutes: number | null
          section_id: string | null
          start_date: string
          title: string
          updated_at: string
          weekday: number | null
        }
        Insert: {
          assign_all?: boolean
          assigned_shift_id?: string | null
          assigned_to?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          description?: string | null
          due_time?: string | null
          end_date?: string | null
          id?: string
          interval_minutes?: number | null
          is_archived?: boolean
          is_management?: boolean
          is_paused?: boolean
          is_temporary?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence?: string
          reminder_minutes?: number | null
          section_id?: string | null
          start_date?: string
          title: string
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          assign_all?: boolean
          assigned_shift_id?: string | null
          assigned_to?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          description?: string | null
          due_time?: string | null
          end_date?: string | null
          id?: string
          interval_minutes?: number | null
          is_archived?: boolean
          is_management?: boolean
          is_paused?: boolean
          is_temporary?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence?: string
          reminder_minutes?: number | null
          section_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_shift_id_fkey"
            columns: ["assigned_shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_branch: { Args: { _branch_id: string }; Returns: boolean }
      can_do: { Args: { _permission: string }; Returns: boolean }
      generate_occurrences: {
        Args: { _branch_id: string; _horizon_hours?: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: never; Returns: boolean }
      my_branch_id: { Args: never; Returns: string }
      my_profile_id: { Args: never; Returns: string }
      my_role: { Args: never; Returns: Database["public"]["Enums"]["app_role"] }
    }
    Enums: {
      app_role: "area_manager" | "branch_manager" | "shift_manager" | "employee"
      occurrence_status: "pending" | "completed"
      photo_kind: "before" | "after"
      task_priority: "high" | "medium" | "low"
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
      app_role: ["area_manager", "branch_manager", "shift_manager", "employee"],
      occurrence_status: ["pending", "completed"],
      photo_kind: ["before", "after"],
      task_priority: ["high", "medium", "low"],
    },
  },
} as const

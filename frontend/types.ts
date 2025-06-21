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
      badges: {
        Row: {
          category: number | null
          created_at: string
          description: string | null
          id: number
          locked: boolean | null
          name: string | null
        }
        Insert: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: number
          locked?: boolean | null
          name?: string | null
        }
        Update: {
          category?: number | null
          created_at?: string
          description?: string | null
          id?: number
          locked?: boolean | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          coords: string
          created_at: string
          date: string | null
          id: number
          name: string | null
          played: boolean | null
        }
        Insert: {
          coords: string
          created_at?: string
          date?: string | null
          id?: number
          name?: string | null
          played?: boolean | null
        }
        Update: {
          coords?: string
          created_at?: string
          date?: string | null
          id?: number
          name?: string | null
          played?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          fid: string
          id: number
        }
        Insert: {
          created_at?: string
          fid: string
          id?: number
        }
        Update: {
          created_at?: string
          fid?: string
          id?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          created_at: string
          gameID: number | null
          id: number
          optionA: string | null
          optionB: string | null
          optionC: string | null
          optionD: string | null
          question: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          gameID?: number | null
          id?: number
          optionA?: string | null
          optionB?: string | null
          optionC?: string | null
          optionD?: string | null
          question?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          gameID?: number | null
          id?: number
          optionA?: string | null
          optionB?: string | null
          optionC?: string | null
          optionD?: string | null
          question?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_gameID_fkey"
            columns: ["gameID"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badgeID: number | null
          created_at: string
          id: number
          userID: number | null
        }
        Insert: {
          badgeID?: number | null
          created_at?: string
          id?: number
          userID?: number | null
        }
        Update: {
          badgeID?: number | null
          created_at?: string
          id?: number
          userID?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badgeID_fkey"
            columns: ["badgeID"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_games: {
        Row: {
          created_at: string
          gameID: number | null
          id: number
          lastSignIn: string
          score: number | null
          streak: number | null
          userID: number | null
        }
        Insert: {
          created_at?: string
          gameID?: number | null
          id?: number
          lastSignIn: string
          score?: number | null
          streak?: number | null
          userID?: number | null
        }
        Update: {
          created_at?: string
          gameID?: number | null
          id?: number
          lastSignIn?: string
          score?: number | null
          streak?: number | null
          userID?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_games_gameID_fkey"
            columns: ["gameID"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_games_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      set_user_context: {
        Args: { profile_id: number }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      match_results: {
        Row: {
          created_at: string
          id: string
          match_date: string
          match_type: string
          player1_name: string
          player1_score: number
          player2_name: string
          player2_score: number
        }
        Insert: {
          created_at?: string
          id?: string
          match_date?: string
          match_type?: string
          player1_name: string
          player1_score: number
          player2_name: string
          player2_score: number
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string
          match_type?: string
          player1_name?: string
          player1_score?: number
          player2_name?: string
          player2_score?: number
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      news_items: {
        Row: {
          created_at: string
          date_label: string
          description: string
          id: string
          is_active: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          date_label: string
          description: string
          id?: string
          is_active?: boolean
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          date_label?: string
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      party_votes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vote_option: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vote_option: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vote_option?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          doubles_games: number
          doubles_points: number
          games_played: number
          id: string
          name: string
          singles_games: number
          singles_points: number
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          doubles_games?: number
          doubles_points?: number
          games_played?: number
          id?: string
          name: string
          singles_games?: number
          singles_points?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          doubles_games?: number
          doubles_points?: number
          games_played?: number
          id?: string
          name?: string
          singles_games?: number
          singles_points?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          member_id: string
          name: string
          role: string
          title: string | null
          updated_at: string
          years_of_service: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          member_id: string
          name: string
          role: string
          title?: string | null
          updated_at?: string
          years_of_service?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          member_id?: string
          name?: string
          role?: string
          title?: string | null
          updated_at?: string
          years_of_service?: number | null
        }
        Relationships: []
      }
      session_games: {
        Row: {
          created_at: string
          game_number: number
          id: string
          session_date: string
          team_a_player1: string
          team_a_player2: string
          team_a_score: number | null
          team_b_player1: string
          team_b_player2: string
          team_b_score: number | null
          winner: string | null
        }
        Insert: {
          created_at?: string
          game_number: number
          id?: string
          session_date?: string
          team_a_player1: string
          team_a_player2: string
          team_a_score?: number | null
          team_b_player1: string
          team_b_player2: string
          team_b_score?: number | null
          winner?: string | null
        }
        Update: {
          created_at?: string
          game_number?: number
          id?: string
          session_date?: string
          team_a_player1?: string
          team_a_player2?: string
          team_a_score?: number | null
          team_b_player1?: string
          team_b_player2?: string
          team_b_score?: number | null
          winner?: string | null
        }
        Relationships: []
      }
      session_signups: {
        Row: {
          created_at: string
          id: string
          player_id: string | null
          player_name: string
          session_date: string
          signed_up_by: string | null
          slot_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_id?: string | null
          player_name: string
          session_date: string
          signed_up_by?: string | null
          slot_number: number
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string | null
          player_name?: string
          session_date?: string
          signed_up_by?: string | null
          slot_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_signups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      team_stats: {
        Row: {
          created_at: string
          games_played: number
          id: string
          player1_name: string
          player2_name: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          games_played?: number
          id?: string
          player1_name: string
          player2_name: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          games_played?: number
          id?: string
          player1_name?: string
          player2_name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_session_signups: { Args: never; Returns: undefined }
      get_user_role: { Args: { user_id: string }; Returns: string }
      increment_player_stats: {
        Args: {
          p_doubles_points: number
          p_player_name: string
          p_points: number
          p_singles_points: number
        }
        Returns: undefined
      }
      increment_singles_stats: {
        Args: { p_player_name: string; p_points: number }
        Returns: undefined
      }
      increment_team_stats: {
        Args: { p_player1: string; p_player2: string; p_points: number }
        Returns: undefined
      }
      recalculate_player_stats: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

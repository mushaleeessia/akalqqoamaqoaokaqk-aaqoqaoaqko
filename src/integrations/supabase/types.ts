export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      discord_webhooks_sent: {
        Row: {
          created_at: string
          id: string
          sent_at: string
          session_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sent_at?: string
          session_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sent_at?: string
          session_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          attempts: number
          completed_at: string
          game_mode: string
          guesses: string[]
          id: string
          target_words: string[]
          user_id: string
          won: boolean
        }
        Insert: {
          attempts: number
          completed_at?: string
          game_mode: string
          guesses: string[]
          id?: string
          target_words: string[]
          user_id: string
          won: boolean
        }
        Update: {
          attempts?: number
          completed_at?: string
          game_mode?: string
          guesses?: string[]
          id?: string
          target_words?: string[]
          user_id?: string
          won?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_stats: {
        Row: {
          average_attempts: number | null
          created_at: string
          game_mode: string
          id: string
          last_played: string | null
          max_win_streak: number
          total_games: number
          total_losses: number
          total_wins: number
          updated_at: string
          user_id: string
          win_streak: number
        }
        Insert: {
          average_attempts?: number | null
          created_at?: string
          game_mode: string
          id?: string
          last_played?: string | null
          max_win_streak?: number
          total_games?: number
          total_losses?: number
          total_wins?: number
          updated_at?: string
          user_id: string
          win_streak?: number
        }
        Update: {
          average_attempts?: number | null
          created_at?: string
          game_mode?: string
          id?: string
          last_played?: string | null
          max_win_streak?: number
          total_games?: number
          total_losses?: number
          total_wins?: number
          updated_at?: string
          user_id?: string
          win_streak?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          clicked_at: string
          id: string
          ip_address: string | null
          link_title: string
          link_url: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          ip_address?: string | null
          link_title: string
          link_url: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          ip_address?: string | null
          link_title?: string
          link_url?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          artist_name: string
          audio_url: string | null
          created_at: string
          duration: number | null
          expires_at: string
          id: string
          spotify_url: string
          thumbnail_url: string | null
          track_name: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          artist_name: string
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          spotify_url: string
          thumbnail_url?: string | null
          track_name: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          artist_name?: string
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          spotify_url?: string
          thumbnail_url?: string | null
          track_name?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      portuguese_words: {
        Row: {
          created_at: string
          id: string
          is_valid: boolean
          updated_at: string
          word: string
          word_normalized: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_valid?: boolean
          updated_at?: string
          word: string
          word_normalized: string
        }
        Update: {
          created_at?: string
          id?: string
          is_valid?: boolean
          updated_at?: string
          word?: string
          word_normalized?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nickname: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nickname: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_tracks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_webhook_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_account: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      get_link_click_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          link_title: string
          total_clicks: number
          clicks_today: number
          clicks_this_week: number
          last_click: string
        }[]
      }
      is_crossword_complete: {
        Args: { grid_data: Json; target_words: Json }
        Returns: boolean
      }
      normalize_word: {
        Args: { input_word: string }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
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

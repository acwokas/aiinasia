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
      achievements: {
        Row: {
          badge_icon: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          article_id: string
          category_id: string
        }
        Insert: {
          article_id: string
          category_id: string
        }
        Update: {
          article_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          ai_generated_at: string | null
          ai_summary: string | null
          ai_tags: string[] | null
          article_type: Database["public"]["Enums"]["article_type_new"]
          author_id: string | null
          canonical_url: string | null
          comment_count: number | null
          content: Json
          cornerstone: boolean | null
          created_at: string
          created_by: string | null
          event_date: string | null
          event_end_date: string | null
          event_location: string | null
          event_registration_url: string | null
          event_start_date: string | null
          event_venue: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_caption: string | null
          featured_image_credit: string | null
          featured_image_url: string | null
          featured_on_homepage: boolean | null
          focus_keyphrase: string | null
          id: string
          keyphrase_synonyms: string | null
          like_count: number | null
          meta_description: string | null
          meta_title: string | null
          podcast_audio_url: string | null
          podcast_duration_minutes: number | null
          preview_code: string | null
          primary_category_id: string | null
          published_at: string | null
          reading_time_minutes: number | null
          review_product_name: string | null
          review_rating: number | null
          scheduled_for: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          sticky: boolean | null
          title: string
          updated_at: string
          updated_by: string | null
          version: number | null
          view_count: number | null
        }
        Insert: {
          ai_generated_at?: string | null
          ai_summary?: string | null
          ai_tags?: string[] | null
          article_type?: Database["public"]["Enums"]["article_type_new"]
          author_id?: string | null
          canonical_url?: string | null
          comment_count?: number | null
          content?: Json
          cornerstone?: boolean | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_location?: string | null
          event_registration_url?: string | null
          event_start_date?: string | null
          event_venue?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_credit?: string | null
          featured_image_url?: string | null
          featured_on_homepage?: boolean | null
          focus_keyphrase?: string | null
          id?: string
          keyphrase_synonyms?: string | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          podcast_audio_url?: string | null
          podcast_duration_minutes?: number | null
          preview_code?: string | null
          primary_category_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          review_product_name?: string | null
          review_rating?: number | null
          scheduled_for?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          sticky?: boolean | null
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          view_count?: number | null
        }
        Update: {
          ai_generated_at?: string | null
          ai_summary?: string | null
          ai_tags?: string[] | null
          article_type?: Database["public"]["Enums"]["article_type_new"]
          author_id?: string | null
          canonical_url?: string | null
          comment_count?: number | null
          content?: Json
          cornerstone?: boolean | null
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_end_date?: string | null
          event_location?: string | null
          event_registration_url?: string | null
          event_start_date?: string | null
          event_venue?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_caption?: string | null
          featured_image_credit?: string | null
          featured_image_url?: string | null
          featured_on_homepage?: boolean | null
          focus_keyphrase?: string | null
          id?: string
          keyphrase_synonyms?: string | null
          like_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          podcast_audio_url?: string | null
          podcast_duration_minutes?: number | null
          preview_code?: string | null
          primary_category_id?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          review_product_name?: string | null
          review_rating?: number | null
          scheduled_for?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          sticky?: boolean | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          article_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          name: string
          slug: string
          twitter_handle: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          article_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          name: string
          slug: string
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          article_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          name?: string
          slug?: string
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          approved: boolean | null
          article_id: string
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          article_id: string
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          article_id?: string
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          replied_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          city: string
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string
          organizer: string | null
          region: string
          registration_url: string | null
          slug: string
          start_date: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          venue: string | null
          website_url: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location: string
          organizer?: string | null
          region?: string
          registration_url?: string | null
          slug: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          venue?: string | null
          website_url?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string
          organizer?: string | null
          region?: string
          registration_url?: string | null
          slug?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          venue?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean | null
          email: string
          id: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed?: boolean | null
          email: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean | null
          email?: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          country: string | null
          created_at: string | null
          first_name: string | null
          id: string
          interests: string[] | null
          job_title: string | null
          last_name: string | null
          newsletter_subscribed: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          interests?: string[] | null
          job_title?: string | null
          last_name?: string | null
          newsletter_subscribed?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          job_title?: string | null
          last_name?: string | null
          newsletter_subscribed?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          article_id: string
          completed: boolean | null
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          completed?: boolean | null
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          completed?: boolean | null
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string
          created_by: string | null
          from_path: string
          id: string
          status_code: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_path: string
          id?: string
          status_code?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_path?: string
          id?: string
          status_code?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      scout_queries: {
        Row: {
          created_at: string | null
          id: string
          query_count: number | null
          query_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query_count?: number | null
          query_date?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query_count?: number | null
          query_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
      user_stats: {
        Row: {
          articles_read: number | null
          comments_made: number | null
          created_at: string | null
          id: string
          last_read_date: string | null
          level: string | null
          points: number | null
          shares_made: number | null
          streak_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          articles_read?: number | null
          comments_made?: number | null
          created_at?: string | null
          id?: string
          last_read_date?: string | null
          level?: string | null
          points?: number | null
          shares_made?: number | null
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          articles_read?: number | null
          comments_made?: number | null
          created_at?: string | null
          id?: string
          last_read_date?: string | null
          level?: string | null
          points?: number | null
          shares_made?: number | null
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: { _points: number; _user_id: string }
        Returns: undefined
      }
      check_and_award_achievements: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_streak: {
        Args: { _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "contributor" | "user"
      article_status:
        | "draft"
        | "review"
        | "published"
        | "archived"
        | "scheduled"
        | "unpublished"
      article_type: "feature" | "news" | "opinion" | "tools" | "life"
      article_type_new:
        | "article"
        | "voice"
        | "guide"
        | "tool"
        | "video"
        | "site_furniture"
        | "event"
        | "interview"
        | "review"
        | "explainer"
        | "podcast"
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
      app_role: ["admin", "editor", "contributor", "user"],
      article_status: [
        "draft",
        "review",
        "published",
        "archived",
        "scheduled",
        "unpublished",
      ],
      article_type: ["feature", "news", "opinion", "tools", "life"],
      article_type_new: [
        "article",
        "voice",
        "guide",
        "tool",
        "video",
        "site_furniture",
        "event",
        "interview",
        "review",
        "explainer",
        "podcast",
      ],
    },
  },
} as const

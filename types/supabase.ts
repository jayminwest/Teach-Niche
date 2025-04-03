export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          bio: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          bio?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          bio?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_id: string
          thumbnail_url: string | null
          video_url: string
          price: number
          created_at: string
          updated_at: string
          lesson_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_id: string
          thumbnail_url?: string | null
          video_url: string
          price: number
          created_at?: string
          updated_at?: string
          lesson_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_id?: string
          thumbnail_url?: string | null
          video_url?: string
          price?: number
          created_at?: string
          updated_at?: string
          lesson_id?: string | null
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          stripe_payment_id: string
          amount: number
          created_at: string
          lesson_id: string | null
          instructor_payout_amount: number | null
          platform_fee_amount: number | null
          payout_status: string | null
          stripe_product_id: string | null
          stripe_price_id: string | null
          is_free: boolean
          stripe_transfer_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_id: string
          amount: number
          created_at?: string
          lesson_id?: string | null
          instructor_payout_amount?: number | null
          platform_fee_amount?: number | null
          payout_status?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          is_free?: boolean
          stripe_transfer_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_id?: string
          amount?: number
          created_at?: string
          lesson_id?: string | null
          instructor_payout_amount?: number | null
          platform_fee_amount?: number | null
          payout_status?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          is_free?: boolean
          stripe_transfer_id?: string | null
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_id: string
          price: number
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_id: string
          price: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_id?: string
          price?: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      instructor_profiles: {
        Row: {
          id: string
          user_id: string
          stripe_account_id: string | null
          stripe_account_enabled: boolean
          stripe_onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_account_id?: string | null
          stripe_account_enabled?: boolean
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_account_id?: string | null
          stripe_account_enabled?: boolean
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_purchased_lessons: {
        Row: {
          user_id: string | null
          lesson_id: string | null
          title: string | null
          description: string | null
          thumbnail_url: string | null
          purchase_date: string | null
        }
      }
    }
  }
}

export type Video = Database["public"]["Tables"]["videos"]["Row"]
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"]
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"]
export type UserPurchasedLesson = Database["public"]["Views"]["user_purchased_lessons"]["Row"]
export type InstructorProfile = Database["public"]["Tables"]["instructor_profiles"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]


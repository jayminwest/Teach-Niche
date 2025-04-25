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
          video_url: string | null
          stripe_product_id: string | null
          stripe_price_id: string | null
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
          video_url?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
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
          video_url?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
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
          name: string | null
          bio: string | null
          total_earnings: number | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_account_id?: string | null
          stripe_account_enabled?: boolean
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
          name?: string | null
          bio?: string | null
          total_earnings?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_account_id?: string | null
          stripe_account_enabled?: boolean
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
          name?: string | null
          bio?: string | null
          total_earnings?: number | null
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
    Functions: {
      check_lesson_access: {
        Args: {
          lesson_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
  }
}

export type Purchase = Database["public"]["Tables"]["purchases"]["Row"]
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"]
export type UserPurchasedLesson = Database["public"]["Views"]["user_purchased_lessons"]["Row"]
export type InstructorProfile = Database["public"]["Tables"]["instructor_profiles"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
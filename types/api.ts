import type { Database } from './supabase';
import type { Video, Lesson, Purchase, InstructorProfile, User } from './supabase';

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Stripe Response Types
export interface StripeCheckoutSession {
  id: string;
  url: string;
  paymentIntentId?: string;
}

export interface StripeAccountStatus {
  accountId: string;
  accountEnabled: boolean;
  onboardingComplete: boolean;
  account: {
    email: string | null;
    business_type: string | null;
    country: string | null;
    default_currency: string | null;
  };
}

// Checkout Request Types
export interface VideoCheckoutRequest {
  videoId: string;
  price: number;
  title: string;
}

export interface LessonCheckoutRequest {
  lessonId: string;
}

// API Success Response Types
export interface CheckoutSuccessResponse {
  url: string;
}

export interface VerifyPurchaseResponse {
  purchased: boolean;
  purchaseId?: string;
  purchasedAt?: string;
}

// Admin API Types
export interface RlsPolicySetupResult {
  success: boolean;
  policies: string[];
}

export interface StorageSetupResult {
  success: boolean;
  buckets: string[];
}

// Extended Database Types with Common Joins
export interface VideoWithInstructor extends Video {
  users?: Pick<User, 'id' | 'name'>;
}

export interface LessonWithInstructor extends Lesson {
  users?: Pick<User, 'id' | 'name'>;
  instructor_profiles?: Pick<InstructorProfile, 'stripe_account_id' | 'stripe_account_enabled'>;
  _count?: {
    videos: number;
  };
}

export interface LessonWithVideos extends Lesson {
  videos: Video[];
  users?: Pick<User, 'id' | 'name'>;
  _count?: {
    videos: number;
  };
}

export interface PurchaseWithDetails extends Purchase {
  videos?: Video;
  lessons?: Lesson;
  users?: Pick<User, 'id' | 'name'>;
}

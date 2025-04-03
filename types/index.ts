// Re-export all types from the type files
export * from './supabase';
export * from './api';
export * from './components';
export * from './errors';
export * from './utils';

// Environment variable types
export interface EnvVariables {
  // Next.js environment variables
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  
  // Server-side environment variables
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_CONNECT_CLIENT_ID?: string;
}

// Next.js specific types
export interface PageParams {
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

// Auth types
export interface Session {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
  expires_at: number;
  access_token: string;
  refresh_token: string;
}

// Form submission types
export interface FormState<T = Record<string, unknown>> {
  errors?: Record<keyof T, string[]>;
  message?: string;
  success?: boolean;
  data?: T;
}

// Route handler types (extending Next.js types)
export interface RouteHandlerContext {
  params: Record<string, string | string[]>;
}

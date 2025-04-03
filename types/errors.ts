// Standard Error Types to Replace 'any' Usage

export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Extend Error to include additional properties commonly found in API errors
export interface ExtendedError extends Error {
  code?: string;
  status?: number;
  data?: unknown;
  statusCode?: number;
  response?: {
    data?: unknown;
    status?: number;
    statusText?: string;
  };
}

// Stripe specific error types
export interface StripeError extends ExtendedError {
  type?: string;
  raw?: unknown;
  statusCode?: number;
  requestId?: string;
  headers?: Record<string, string>;
  code?: string;
  param?: string;
  detail?: string;
}

// Supabase specific error types
export interface SupabaseError extends ExtendedError {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

// Auth errors
export interface AuthError extends ExtendedError {
  type?: string;
  code?: string;
}

// File upload errors
export interface FileUploadError extends ExtendedError {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

// Database errors
export interface DatabaseError extends ExtendedError {
  table?: string;
  column?: string;
  constraint?: string;
}

// Helper function to safely handle errors and extract message
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

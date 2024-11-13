/**
 * Shared configuration for Supabase Edge Functions
 */

// List of allowed origins for CORS
export const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com",
  "https://www.teach-niche.com",
  "https://wcqpttujocyvueudlcnt.supabase.co", // Prod Supabase
  "https://your-production-url.com"
];

/**
 * Clean and format URL to prevent double slashes
 * @param url - URL to clean
 * @returns Cleaned URL
 */
export const cleanUrl = (url: string) => url.replace(/\/$/, "");

/**
 * Generate CORS headers for a given origin
 * @param origin - The origin of the request
 * @returns Object containing CORS headers
 */
export const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
});

/**
 * Create a CORS-enabled Response object
 * @param status - HTTP status code
 * @param body - Response body
 * @param origin - Request origin
 * @returns Response object with CORS headers
 */
export const createCorsResponse = (
  status: number,
  body: any,
  origin: string,
) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
};

// Add environment variable validation
export const validateEnvVars = () => {
  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !Deno.env.get(key));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};

// Call this at the start of your webhook handler
validateEnvVars();

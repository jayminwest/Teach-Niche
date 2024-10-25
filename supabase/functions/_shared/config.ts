/**
 * Shared configuration for Supabase Edge Functions
 */

// List of allowed origins for CORS
export const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com",
  "https://www.teach-niche.com",
  "https://wcqpttujocyvueudlcnt.supabase.co",
  // Add any other origins that should be allowed to make requests
];

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

/**
 * Shared configuration for Supabase Edge Functions
 */

// List of allowed origins for CORS
export const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com",
];

/**
 * Generate CORS headers for a given origin
 * @param origin - The origin of the request
 * @returns Object containing CORS headers
 */
export const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
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
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
};

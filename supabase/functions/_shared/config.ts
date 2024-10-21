// supabase/functions/_shared/config.ts

export const allowedOrigins = [
  "http://localhost:3000",
  "https://teach-niche.com",
];

export const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

export const createCorsResponse = (status: number, body: any, origin: string) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
};

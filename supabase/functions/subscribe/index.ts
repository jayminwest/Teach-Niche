import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Newsletter Subscription Function
 *
 * This function handles newsletter subscriptions by adding email addresses
 * to a 'newsletter_subscriptions' table in Supabase.
 *
 * @param {Request} req - The incoming HTTP request
 * @returns {Response} The HTTP response
 */
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Initialize Supabase client with anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      },
    );

    // Insert the email into the 'newsletter_subscriptions' table
    const { error } = await supabaseClient
      .from("newsletter_subscriptions")
      .insert({ email });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Subscription successful" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in subscribe function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error
          ? error.message
          : "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});

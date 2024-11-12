// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import config from "./config";

/**
 * Supabase client instance
 * @type {SupabaseClient}
 */
const supabase = createClient(
  config.supabase.url,
  config.supabase.key,
  config.supabase.options,
);

export default supabase;

// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase URL from environment variables.
 * @type {string}
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

/**
 * Supabase anonymous key from environment variables.
 * @type {string}
 */
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

/**
 * Supabase client configuration options.
 * @type {Object}
 */
const supabaseOptions = {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
};

/**
 * Initialized Supabase client for client-side operations.
 * @type {SupabaseClient}
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

export default supabase;

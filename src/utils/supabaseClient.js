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
 * Initialized Supabase client for client-side operations.
 * @type {SupabaseClient}
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// src/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Debug logging
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  HAS_KEY: !!process.env.REACT_APP_SUPABASE_KEY
});

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

export default supabase;

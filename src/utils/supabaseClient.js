// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env file.'
  )
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation'
  },
  db: {
    schema: 'public'
  }
})

export default supabase

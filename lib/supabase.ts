import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire app
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

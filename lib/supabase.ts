import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

const hasValidUrl =
  supabaseUrl.length > 0 && /^https?:\/\//i.test(supabaseUrl);

export const supabase: SupabaseClient | null =
  hasValidUrl && supabaseAnonKey.length > 0
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn(
    "Supabase: nastav NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY v .env (alebo .env.local)"
  );
}

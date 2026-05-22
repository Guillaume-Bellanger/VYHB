import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Fallback vide pour react-snap (SSG) — les requêtes échouent proprement sans crasher l'import
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://placeholder.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "placeholder";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured =
  supabaseUrl !== "https://placeholder.supabase.co" && supabaseAnonKey !== "placeholder";

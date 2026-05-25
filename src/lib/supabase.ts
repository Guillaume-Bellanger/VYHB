import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log('[supabase] creating client with URL:', import.meta.env.VITE_SUPABASE_URL?.slice(0, 30));
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

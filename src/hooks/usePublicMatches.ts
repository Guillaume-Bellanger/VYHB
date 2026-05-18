import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Match } from "@/types/database";

// ── Matchs publiés (résultats) ────────────────────────────────

export function usePublicMatches(categorie?: string) {
  return useQuery({
    queryKey: ["public-matches", categorie],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      let q = supabase
        .from("matches")
        .select("*")
        .eq("statut", "publie")
        .order("date", { ascending: false });

      if (categorie) q = q.eq("categorie", categorie);

      const { data, error } = await q;
      if (error) throw error;
      return data as Match[];
    },
  });
}

// ── Matchs à venir (prévus, date future) ─────────────────────

export function usePublicUpcoming(categorie?: string) {
  return useQuery({
    queryKey: ["public-upcoming", categorie],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      let q = supabase
        .from("matches")
        .select("*")
        .eq("statut", "prevu")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (categorie) q = q.eq("categorie", categorie);

      const { data, error } = await q;
      if (error) throw error;
      return data as Match[];
    },
  });
}

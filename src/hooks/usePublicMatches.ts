import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Match } from "@/types/database";

// ── Matchs publiés + prévus (page /resultats) ────────────────

export function usePublicMatches(categorie?: string) {
  return useQuery({
    queryKey: ["public-matches", categorie],
    queryFn: async () => {
      let q = supabase
        .from("matches")
        .select("*")
        .in("statut", ["publie", "prevu"])
        .order("date", { ascending: false });

      if (categorie) q = q.eq("categorie", categorie);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Match[];
    },
  });
}

// ── Matchs à venir (prévus, date future) ─────────────────────

export function usePublicUpcoming(categorie?: string) {
  return useQuery({
    queryKey: ["public-upcoming", categorie],
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
      return (data ?? []) as Match[];
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Match, MatchStatut } from "@/types/database";

export const MATCHES_QK = ["matches"] as const;

// ── Types ───────────────────────────────────────────────────────────────────

export type MatchInsert = Omit<Match, "id" | "created_at" | "updated_at" | "created_by">;
export type MatchUpdate = Partial<MatchInsert> & { statut?: MatchStatut };

export interface MatchFilters {
  statut?: MatchStatut;
  categorie?: string;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useMatches(filters: MatchFilters = {}) {
  const { isResponsable, categorie } = useAuth();

  return useQuery({
    queryKey: [...MATCHES_QK, filters, isResponsable, categorie],
    queryFn: async () => {
      let q = supabase.from("matches").select("*").order("date", { ascending: false });

      // Responsable ne voit que sa catégorie
      if (isResponsable && categorie) q = q.eq("categorie", categorie);

      if (filters.statut) q = q.eq("statut", filters.statut);
      if (filters.categorie) q = q.eq("categorie", filters.categorie);

      const { data, error } = await q;
      if (error) throw error;
      return data as Match[];
    },
  });
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: [...MATCHES_QK, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Match;
    },
    enabled: !!id,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useCreateMatch() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: MatchInsert) => {
      const { data: result, error } = await supabase
        .from("matches")
        .insert({ ...data, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return result as Match;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MatchUpdate }) => {
      const { error } = await supabase.from("matches").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/types/database";

async function pgFetch<T>(path: string): Promise<T> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Matchs publiés + prévus (page /resultats) ────────────────

export function usePublicMatches(categorie?: string) {
  return useQuery({
    queryKey: ["public-matches", categorie],
    queryFn: () => {
      let q = `matches?select=*&statut=in.(publie,prevu)&order=date.desc`;
      if (categorie) q += `&categorie=eq.${encodeURIComponent(categorie)}`;
      return pgFetch<Match[]>(q);
    },
  });
}

// ── Matchs à venir (prévus, date future) ─────────────────────

export function usePublicUpcoming(categorie?: string) {
  return useQuery({
    queryKey: ["public-upcoming", categorie],
    queryFn: () => {
      const now = new Date().toISOString();
      let q = `matches?select=*&statut=eq.prevu&date=gte.${now}&order=date.asc`;
      if (categorie) q += `&categorie=eq.${encodeURIComponent(categorie)}`;
      return pgFetch<Match[]>(q);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Match, MatchStatut } from "@/types/database";

export const MATCHES_QK = ["matches"] as const;

// ── Types ─────────────────────────────────────────────────────

export type MatchInsert = Omit<Match, "id" | "created_at" | "updated_at" | "created_by">;
export type MatchUpdate = Partial<MatchInsert> & { statut?: MatchStatut };

export interface MatchFilters {
  statut?: MatchStatut;
  categorie?: string;
}

// ── Helpers (env vars + token lus à chaque appel) ─────────────

function baseHeaders(): Record<string, string> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  let token = key;
  try {
    const ref = new URL(url).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (raw) {
      const s = JSON.parse(raw) as { access_token?: string };
      token = s.access_token ?? key;
    }
  } catch {}
  return { apikey: key, Authorization: `Bearer ${token}` };
}

function restUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

async function pgList<T>(path: string): Promise<T> {
  const res = await fetch(restUrl(path), { headers: baseHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function pgOne<T>(path: string): Promise<T> {
  const res = await fetch(restUrl(path), {
    headers: { ...baseHeaders(), Accept: "application/vnd.pgrst.object+json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function pgInsert<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(restUrl(path), {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
      Accept: "application/vnd.pgrst.object+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function pgPatch(path: string, body: unknown): Promise<void> {
  const res = await fetch(restUrl(path), {
    method: "PATCH",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function pgDelete(path: string): Promise<void> {
  const res = await fetch(restUrl(path), {
    method: "DELETE",
    headers: { ...baseHeaders(), Prefer: "return=minimal" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Queries ───────────────────────────────────────────────────

export function useMatches(filters: MatchFilters = {}) {
  const { isEntraineur, categorie } = useAuth();

  return useQuery({
    queryKey: [...MATCHES_QK, filters, isEntraineur, categorie],
    queryFn: () => {
      let q = `matches?select=*&order=date.desc`;
      if (isEntraineur && categorie) q += `&categorie=eq.${encodeURIComponent(categorie)}`;
      if (filters.statut) q += `&statut=eq.${filters.statut}`;
      if (filters.categorie) q += `&categorie=eq.${encodeURIComponent(filters.categorie)}`;
      return pgList<Match[]>(q);
    },
  });
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: [...MATCHES_QK, id],
    queryFn: () => pgOne<Match>(`matches?id=eq.${id}&select=*`),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useCreateMatch() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: MatchInsert) =>
      pgInsert<Match>("matches", { ...data, created_by: user!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchUpdate }) =>
      pgPatch(`matches?id=eq.${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pgDelete(`matches?id=eq.${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: MATCHES_QK }),
  });
}

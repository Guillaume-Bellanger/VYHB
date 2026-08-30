import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { Collectif } from "@/types/collectif";

export const COLLECTIFS_QK = ["collectifs"] as const;
export const PUBLIC_COLLECTIFS_QK = ["public-collectifs"] as const;

// ── Types ─────────────────────────────────────────────────────

export type CollectifInsert = Omit<Collectif, "id" | "created_at" | "updated_at">;
export type CollectifUpdate = Partial<CollectifInsert>;

// ── Helpers (env vars + token lus à chaque appel) ─────────────
// Même pattern que useMatches.ts — aucun import depuis @/lib/supabase.

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

function anonHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  return { apikey: key, Authorization: `Bearer ${key}` };
}

function restUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

async function pgList<T>(path: string, headers: Record<string, string>): Promise<T> {
  const res = await fetch(restUrl(path), { headers });
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

// ── Cache helper ──────────────────────────────────────────────

function findCollectifInCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
): Collectif | undefined {
  for (const [, data] of qc.getQueriesData<Collectif[]>({ queryKey: COLLECTIFS_QK })) {
    if (Array.isArray(data)) {
      const c = data.find((c) => c.id === id);
      if (c) return c;
    }
  }
  return undefined;
}

// ── Queries publiques ─────────────────────────────────────────

export function useCollectifsPublic() {
  return useQuery({
    queryKey: PUBLIC_COLLECTIFS_QK,
    queryFn: () => pgList<Collectif[]>("collectifs?select=*&order=ordre.asc", anonHeaders()),
  });
}

// ── Queries admin ─────────────────────────────────────────────

export function useCollectifsAdmin() {
  return useQuery({
    queryKey: COLLECTIFS_QK,
    queryFn: () => pgList<Collectif[]>("collectifs?select=*&order=ordre.asc", baseHeaders()),
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useCreateCollectif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (data: CollectifInsert) => pgInsert<Collectif>("collectifs", data),
    onSuccess: (collectif) => {
      logAction("Collectif créé", "collectif", collectif.id, collectif.nom, {
        slug: collectif.slug,
      });
      qc.invalidateQueries({ queryKey: COLLECTIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_COLLECTIFS_QK });
    },
  });
}

export function useUpdateCollectif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectifUpdate }) =>
      pgPatch(`collectifs?id=eq.${id}`, data),
    onMutate: async ({ id }) => ({ previous: findCollectifInCache(qc, id) }),
    onSuccess: (_, { id, data }, context) => {
      const prev = context?.previous;
      logAction("Collectif modifié", "collectif", id, data.nom ?? prev?.nom ?? id, {
        avant: prev ?? null,
        apres: data,
      });
      qc.invalidateQueries({ queryKey: COLLECTIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_COLLECTIFS_QK });
    },
  });
}

export function useDeleteCollectif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (id: string) => pgDelete(`collectifs?id=eq.${id}`),
    onMutate: async (id) => ({ previous: findCollectifInCache(qc, id) }),
    onSuccess: (_, id, context) => {
      logAction("Collectif supprimé", "collectif", id, context?.previous?.nom ?? id);
      qc.invalidateQueries({ queryKey: COLLECTIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_COLLECTIFS_QK });
    },
  });
}

// Réordonnancement : permute le `ordre` de deux collectifs (boutons ↑↓)
export function useReorderCollectifs() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; ordre: number }[]) => {
      await Promise.all(
        updates.map((u) => pgPatch(`collectifs?id=eq.${u.id}`, { ordre: u.ordre }))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COLLECTIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_COLLECTIFS_QK });
    },
  });
}

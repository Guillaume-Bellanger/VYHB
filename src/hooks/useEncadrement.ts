import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/hooks/useAuth";
import type { Encadrement, EncadrementType } from "@/types/encadrement";

export const ENCADREMENT_QK = ["encadrement"] as const;
export const PUBLIC_ENCADREMENT_QK = ["public-encadrement"] as const;
export const ENCADREMENT_TRASH_QK = ["encadrement-trash"] as const;

// ── Types ─────────────────────────────────────────────────────

export type EncadrementInsert = Omit<Encadrement, "id" | "created_at" | "updated_at" | "supprime_le" | "supprime_par">;
export type EncadrementUpdate = Partial<EncadrementInsert>;

// ── Helpers (env vars + token lus à chaque appel) ─────────────
// Même pattern que useCollectifs.ts — aucun import depuis @/lib/supabase.

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

function findEncadrementInCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
): Encadrement | undefined {
  for (const [, data] of qc.getQueriesData<Encadrement[]>({ queryKey: ENCADREMENT_QK })) {
    if (Array.isArray(data)) {
      const e = data.find((e) => e.id === id);
      if (e) return e;
    }
  }
  return undefined;
}

// ── Queries publiques ─────────────────────────────────────────

// Tri : `ordre` puis critères stables (created_at, id) — un éventuel
// ex-aequo sur `ordre` ne doit jamais donner un affichage aléatoire.
const ENCADREMENT_ORDER = "ordre.asc,created_at.asc,id.asc";

export function useEncadrementPublic(type?: EncadrementType) {
  return useQuery({
    queryKey: [...PUBLIC_ENCADREMENT_QK, type ?? "all"],
    queryFn: () => {
      let q = `encadrement?select=*&order=${ENCADREMENT_ORDER}`;
      if (type) q += `&type=eq.${type}`;
      return pgList<Encadrement[]>(q, anonHeaders());
    },
  });
}

// ── Queries admin ─────────────────────────────────────────────

export function useEncadrementAdmin() {
  return useQuery({
    queryKey: ENCADREMENT_QK,
    queryFn: () =>
      pgList<Encadrement[]>(`encadrement?select=*&supprime_le=is.null&order=type.asc,${ENCADREMENT_ORDER}`, baseHeaders()),
  });
}

// Corbeille : fiches supprimées (soft delete), avec le nom de l'auteur
export function useEncadrementTrash() {
  return useQuery({
    queryKey: ENCADREMENT_TRASH_QK,
    queryFn: () =>
      pgList<(Encadrement & { supprime_par_profile: { full_name: string | null } | null })[]>(
        "encadrement?select=*,supprime_par_profile:profiles!supprime_par(full_name)&supprime_le=not.is.null&order=supprime_le.desc",
        baseHeaders()
      ),
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useCreateEncadrement() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (data: EncadrementInsert) => pgInsert<Encadrement>("encadrement", data),
    onSuccess: (person) => {
      logAction("Encadrement créé", "encadrement", person.id, person.prenom ?? person.role ?? person.id, {
        type: person.type,
      });
      qc.invalidateQueries({ queryKey: ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_ENCADREMENT_QK });
    },
  });
}

export function useUpdateEncadrement() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EncadrementUpdate }) =>
      pgPatch(`encadrement?id=eq.${id}`, data),
    onMutate: async ({ id }) => ({ previous: findEncadrementInCache(qc, id) }),
    onSuccess: (_, { id, data }, context) => {
      const prev = context?.previous;
      logAction(
        "Encadrement modifié",
        "encadrement",
        id,
        data.prenom ?? prev?.prenom ?? data.role ?? prev?.role ?? id,
        { avant: prev ?? null, apres: data }
      );
      qc.invalidateQueries({ queryKey: ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_ENCADREMENT_QK });
    },
  });
}

// Suppression réversible : passe par la corbeille (PATCH supprime_le/supprime_par)
export function useDeleteEncadrement() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) =>
      pgPatch(`encadrement?id=eq.${id}`, { supprime_le: new Date().toISOString(), supprime_par: user?.id ?? null }),
    onMutate: async (id) => ({ previous: findEncadrementInCache(qc, id) }),
    onSuccess: (_, id, context) => {
      const prev = context?.previous;
      logAction("Encadrement supprimé", "encadrement", id, prev?.prenom ?? prev?.role ?? id);
      qc.invalidateQueries({ queryKey: ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: ENCADREMENT_TRASH_QK });
    },
  });
}

export function useRestoreEncadrement() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (id: string) => pgPatch(`encadrement?id=eq.${id}`, { supprime_le: null, supprime_par: null }),
    onSuccess: (_, id) => {
      logAction("Encadrement restauré", "encadrement", id, id);
      qc.invalidateQueries({ queryKey: ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: ENCADREMENT_TRASH_QK });
    },
  });
}

// Suppression définitive — la RLS restreint déjà ceci à super_admin
export function useHardDeleteEncadrement() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (id: string) => pgDelete(`encadrement?id=eq.${id}`),
    onSuccess: (_, id) => {
      logAction("Encadrement supprimé définitivement", "encadrement", id, id);
      qc.invalidateQueries({ queryKey: ENCADREMENT_TRASH_QK });
    },
  });
}

// Réordonnancement (boutons ↑↓) : délègue à la fonction SQL
// `reorder_encadrement(p_id, p_direction)` — elle densifie la section
// (0..N-1) puis échange les deux `ordre` dans une seule transaction.
// Atomique côté serveur : aucun doublon transitoire ni persistant.
export function useReorderEncadrement() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: -1 | 1 }) => {
      const res = await fetch(restUrl("rpc/reorder_encadrement"), {
        method: "POST",
        headers: { ...baseHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ p_id: id, p_direction: direction }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENCADREMENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_ENCADREMENT_QK });
    },
  });
}

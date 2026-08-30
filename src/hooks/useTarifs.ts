import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/hooks/useAuth";
import type { Tarif } from "@/types/tarif";

export const TARIFS_QK = ["tarifs"] as const;
export const PUBLIC_TARIFS_QK = ["public-tarifs"] as const;
export const TARIFS_TRASH_QK = ["tarifs-trash"] as const;

// ── Types ─────────────────────────────────────────────────────

export type TarifInsert = Omit<Tarif, "id" | "created_at" | "updated_at" | "supprime_le" | "supprime_par">;
export type TarifUpdate = Partial<TarifInsert>;

// ── Helpers (env vars + token lus à chaque appel) ─────────────
// Même pattern que useCollectifs.ts / useEncadrement.ts.

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

function findTarifInCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
): Tarif | undefined {
  for (const [, data] of qc.getQueriesData<Tarif[]>({ queryKey: TARIFS_QK })) {
    if (Array.isArray(data)) {
      const t = data.find((t) => t.id === id);
      if (t) return t;
    }
  }
  return undefined;
}

// ── Query publique ────────────────────────────────────────────

export function useTarifs() {
  return useQuery({
    queryKey: PUBLIC_TARIFS_QK,
    queryFn: () => pgList<Tarif[]>("tarifs?select=*&order=ordre.asc", anonHeaders()),
  });
}

// ── Query admin ───────────────────────────────────────────────

export function useTarifsAdmin() {
  return useQuery({
    queryKey: TARIFS_QK,
    queryFn: () => pgList<Tarif[]>("tarifs?select=*&supprime_le=is.null&order=saison.desc,ordre.asc", baseHeaders()),
  });
}

// Corbeille : tarifs supprimés (soft delete), avec le nom de l'auteur
export function useTarifsTrash() {
  return useQuery({
    queryKey: TARIFS_TRASH_QK,
    queryFn: () =>
      pgList<(Tarif & { supprime_par_profile: { full_name: string | null } | null })[]>(
        "tarifs?select=*,supprime_par_profile:profiles!supprime_par(full_name)&supprime_le=not.is.null&order=supprime_le.desc",
        baseHeaders()
      ),
  });
}

// ── Mutations ─────────────────────────────────────────────────

export function useCreateTarif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (data: TarifInsert) => pgInsert<Tarif>("tarifs", data),
    onSuccess: (tarif) => {
      logAction("Tarif créé", "tarif", tarif.id, tarif.libelle, { saison: tarif.saison, montant: tarif.montant });
      qc.invalidateQueries({ queryKey: TARIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_TARIFS_QK });
    },
  });
}

export function useUpdateTarif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TarifUpdate }) =>
      pgPatch(`tarifs?id=eq.${id}`, data),
    onMutate: async ({ id }) => ({ previous: findTarifInCache(qc, id) }),
    onSuccess: (_, { id, data }, context) => {
      const prev = context?.previous;
      logAction("Tarif modifié", "tarif", id, data.libelle ?? prev?.libelle ?? id, {
        avant: prev ?? null,
        apres: data,
      });
      qc.invalidateQueries({ queryKey: TARIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_TARIFS_QK });
    },
  });
}

// Suppression réversible : passe par la corbeille (PATCH supprime_le/supprime_par)
export function useDeleteTarif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) =>
      pgPatch(`tarifs?id=eq.${id}`, { supprime_le: new Date().toISOString(), supprime_par: user?.id ?? null }),
    onMutate: async (id) => ({ previous: findTarifInCache(qc, id) }),
    onSuccess: (_, id, context) => {
      logAction("Tarif supprimé", "tarif", id, context?.previous?.libelle ?? id);
      qc.invalidateQueries({ queryKey: TARIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_TARIFS_QK });
      qc.invalidateQueries({ queryKey: TARIFS_TRASH_QK });
    },
  });
}

export function useRestoreTarif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (id: string) => pgPatch(`tarifs?id=eq.${id}`, { supprime_le: null, supprime_par: null }),
    onSuccess: (_, id) => {
      logAction("Tarif restauré", "tarif", id, id);
      qc.invalidateQueries({ queryKey: TARIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_TARIFS_QK });
      qc.invalidateQueries({ queryKey: TARIFS_TRASH_QK });
    },
  });
}

// Suppression définitive — la RLS restreint déjà ceci à super_admin
export function useHardDeleteTarif() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: (id: string) => pgDelete(`tarifs?id=eq.${id}`),
    onSuccess: (_, id) => {
      logAction("Tarif supprimé définitivement", "tarif", id, id);
      qc.invalidateQueries({ queryKey: TARIFS_TRASH_QK });
    },
  });
}

// Réordonnancement : permute le `ordre` de deux tarifs (boutons ↑↓, au sein d'une saison)
export function useReorderTarifs() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; ordre: number }[]) => {
      await Promise.all(
        updates.map((u) => pgPatch(`tarifs?id=eq.${u.id}`, { ordre: u.ordre }))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TARIFS_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_TARIFS_QK });
    },
  });
}

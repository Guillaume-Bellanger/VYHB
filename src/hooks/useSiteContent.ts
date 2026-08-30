import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { SiteContentRow } from "@/types/siteContent";

export const SITE_CONTENT_QK = ["site-content"] as const;
export const PUBLIC_SITE_CONTENT_QK = ["public-site-content"] as const;

// ── Helpers (env vars + token lus à chaque appel) ─────────────
// Même pattern que useCollectifs.ts / useEncadrement.ts / useTarifs.ts.

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

// ── Cache helper ──────────────────────────────────────────────

function findSiteContentInCache(
  qc: ReturnType<typeof useQueryClient>,
  cle: string
): SiteContentRow | undefined {
  for (const [, data] of qc.getQueriesData<SiteContentRow[]>({ queryKey: SITE_CONTENT_QK })) {
    if (Array.isArray(data)) {
      const r = data.find((r) => r.cle === cle);
      if (r) return r;
    }
  }
  return undefined;
}

// ── Query publique ────────────────────────────────────────────
// get(cle, fallback) : renvoie la valeur éditée si elle existe, sinon le
// fallback en dur passé par l'appelant (design "aucune régression si la clé
// est absente" — pas de enabled:, pas de throw, cf. tasks/lessons.md).

export function useSiteContent() {
  const query = useQuery({
    queryKey: PUBLIC_SITE_CONTENT_QK,
    queryFn: () => pgList<SiteContentRow[]>("site_content?select=*", anonHeaders()),
  });

  function get<T>(cle: string, fallback: T): T {
    const row = query.data?.find((r) => r.cle === cle);
    return row ? (row.valeur as T) : fallback;
  }

  return { ...query, get };
}

// ── Query + mutation admin ────────────────────────────────────

export function useSiteContentAdmin() {
  return useQuery({
    queryKey: SITE_CONTENT_QK,
    queryFn: () => pgList<SiteContentRow[]>("site_content?select=*&order=groupe.asc,ordre.asc", baseHeaders()),
  });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  const { logAction } = useAuditLog();

  return useMutation({
    mutationFn: ({ cle, valeur }: { cle: string; valeur: unknown }) =>
      pgPatch(`site_content?cle=eq.${encodeURIComponent(cle)}`, { valeur }),
    onMutate: async ({ cle }) => ({ previous: findSiteContentInCache(qc, cle) }),
    onSuccess: (_, { cle, valeur }, context) => {
      const prev = context?.previous;
      logAction("Texte du site modifié", "site_content", cle, prev?.libelle ?? cle, {
        avant: prev?.valeur ?? null,
        apres: valeur,
      });
      qc.invalidateQueries({ queryKey: SITE_CONTENT_QK });
      qc.invalidateQueries({ queryKey: PUBLIC_SITE_CONTENT_QK });
    },
  });
}

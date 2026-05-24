import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile, UserRole } from "@/types/database";

export const USERS_QK = ["users"] as const;

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

function authUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/auth/v1/${path}`;
}

// ── Queries ──────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: USERS_QK,
    queryFn: async () => {
      const res = await fetch(restUrl("profiles?select=*&order=created_at.asc"), {
        headers: baseHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Profile[]>;
    },
  });
}

// ── Mutations ────────────────────────────────────────────────

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { role?: UserRole; categorie?: string | null; disabled?: boolean };
    }) => {
      const res = await fetch(restUrl(`profiles?id=eq.${id}`), {
        method: "PATCH",
        headers: {
          ...baseHeaders(),
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_QK }),
  });
}

export interface InvitePayload {
  email: string;
  role: UserRole;
  categorie: string | null;
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role, categorie }: InvitePayload) => {
      // 1. Enregistrer le rôle/catégorie avant le 1er login
      const upsertRes = await fetch(restUrl("pending_invites"), {
        method: "POST",
        headers: {
          ...baseHeaders(),
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ email, role, categorie }),
      });
      if (!upsertRes.ok) {
        const err = await upsertRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Erreur lors de la pré-invitation");
      }

      // 2. Envoyer l'invitation via l'endpoint admin (nécessite VITE_SUPABASE_SERVICE_ROLE_KEY)
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;
      const inviteRes = await fetch(authUrl("admin/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          email,
          email_confirm: false,
          invite: true,
          redirect_to: `${window.location.origin}/admin/auth/callback`,
        }),
      });

      const inviteText = await inviteRes.text();
      if (!inviteRes.ok) {
        const err = JSON.parse(inviteText || '{}');
        throw new Error(err.msg ?? err.message ?? "Erreur lors de l'envoi de l'invitation");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_QK }),
  });
}

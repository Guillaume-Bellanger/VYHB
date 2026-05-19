import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types/database";

export const USERS_QK = ["users"] as const;

// ── Queries ──────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: USERS_QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Profile[];
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
      const { error } = await supabase.from("profiles").update(data).eq("id", id);
      if (error) throw error;
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
      // 1. Enregistrer le rôle souhaité avant le 1er login
      const { error: pendingErr } = await supabase
        .from("pending_invites")
        .upsert({ email, role, categorie });
      if (pendingErr) throw pendingErr;

      // 2. Envoyer le magic link (crée le compte si inexistant)
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
        },
      });
      if (otpErr) throw otpErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_QK }),
  });
}

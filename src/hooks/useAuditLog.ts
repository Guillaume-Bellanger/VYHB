import { useAuthStore } from "@/stores/authStore";

function auditHeaders(): Record<string, string> {
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
  return { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function useAuditLog() {
  const { user, profile } = useAuthStore();

  function logAction(
    action: string,
    entityType: string,
    entityId: string | null,
    entityLabel: string,
    details?: Record<string, unknown>
  ) {
    if (!user) return;

    fetch(
      `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/audit_logs`,
      {
        method: "POST",
        headers: { ...auditHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: user.id,
          user_name: profile?.full_name ?? profile?.email ?? user.email ?? "Inconnu",
          action,
          entity_type: entityType,
          entity_id: entityId ?? null,
          entity_label: entityLabel,
          details: details ?? null,
        }),
      }
    ).catch(() => {});
  }

  return { logAction };
}

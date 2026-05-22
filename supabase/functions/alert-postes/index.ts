import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  date: string;
  adversaire: string;
  categorie: string;
  lieu: string | null;
}

interface MatchPoste {
  poste: string;
}

interface Profile {
  email: string | null;
}

type AlertLevel = 7 | 3 | 1;

// ── Constants ─────────────────────────────────────────────────────────────────

const POSTE_LABELS: Record<string, string> = {
  responsable_salle: "Responsable de salle",
  secretaire: "Secrétaire",
  table: "Table de marque",
  arbitre: "Arbitre",
};

const ADMIN_URL = "https://v2.vyhb.fr/admin/matches";

const ALERT_CONFIG: Record<AlertLevel, { subject: string; intro: string; color: string }> = {
  7: {
    subject: "📋 Postes à attribuer - Match dans 7 jours",
    intro: "Des postes sont encore à attribuer pour le match suivant. Vous avez 7 jours pour compléter les informations.",
    color: "#2563eb",
  },
  3: {
    subject: "⚠️ Rappel - Postes non attribués - Match dans 3 jours",
    intro: "Attention — des postes obligatoires ne sont toujours pas attribués. Le match a lieu dans 3 jours.",
    color: "#d97706",
  },
  1: {
    subject: "🚨 URGENT - Postes non attribués - Match DEMAIN",
    intro: "ACTION REQUISE — Des postes obligatoires sont encore non attribués pour le match de DEMAIN. Merci d'agir immédiatement.",
    color: "#dc2626",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchWindow(daysFromNow: number): { from: string; to: string } {
  const now = new Date();
  const target = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  const TOLERANCE_MS = 2 * 60 * 60 * 1000; // ±2h
  return {
    from: new Date(target.getTime() - TOLERANCE_MS).toISOString(),
    to: new Date(target.getTime() + TOLERANCE_MS).toISOString(),
  };
}

async function sendMail(
  resendKey: string,
  to: string[],
  match: Match,
  emptyPostes: MatchPoste[],
  level: AlertLevel
): Promise<void> {
  if (to.length === 0) return;

  const { subject, intro, color } = ALERT_CONFIG[level];

  const postesList = emptyPostes
    .map((p) => `  - ${POSTE_LABELS[p.poste] ?? p.poste}`)
    .join("\n");

  const lieuLine = match.lieu ? `\nLieu : ${match.lieu}` : "";
  const lieuHtml = match.lieu
    ? `<tr><td style="color:#888;padding:3px 0">Lieu</td><td style="padding:3px 0 3px 14px"><strong>${match.lieu}</strong></td></tr>`
    : "";

  const text = `Bonjour,

${intro}

Match     : VYHB vs ${match.adversaire}
Date      : ${formatDate(match.date)} à ${formatTime(match.date)}${lieuLine}
Catégorie : ${match.categorie}

Postes non attribués :
${postesList}

→ Compléter sur le site admin :
${ADMIN_URL}/${match.id}/edit

---
Val d'Yerres Handball — Notification automatique`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:16px;color:#1a1a1a">
  <div style="background:${color};padding:14px 20px;border-radius:8px 8px 0 0">
    <p style="color:#fff;font-weight:700;font-size:15px;margin:0">${subject}</p>
  </div>
  <div style="background:#fafafa;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin-top:0;line-height:1.5">${intro}</p>

    <table style="border-collapse:collapse;margin-bottom:18px;font-size:14px">
      <tr>
        <td style="color:#888;padding:3px 0;white-space:nowrap">Match</td>
        <td style="padding:3px 0 3px 14px"><strong>VYHB vs ${match.adversaire}</strong></td>
      </tr>
      <tr>
        <td style="color:#888;padding:3px 0;white-space:nowrap">Date</td>
        <td style="padding:3px 0 3px 14px"><strong>${formatDate(match.date)} à ${formatTime(match.date)}</strong></td>
      </tr>
      ${lieuHtml}
      <tr>
        <td style="color:#888;padding:3px 0;white-space:nowrap">Catégorie</td>
        <td style="padding:3px 0 3px 14px"><strong>${match.categorie}</strong></td>
      </tr>
    </table>

    <p style="font-weight:600;margin-bottom:8px;font-size:14px">Postes non attribués :</p>
    <ul style="margin:0 0 22px;padding-left:18px;font-size:14px">
      ${emptyPostes.map((p) => `<li style="margin:5px 0">${POSTE_LABELS[p.poste] ?? p.poste}</li>`).join("\n      ")}
    </ul>

    <a href="${ADMIN_URL}/${match.id}/edit"
       style="display:inline-block;background:${color};color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
      Compléter les postes →
    </a>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin-top:14px">
    Val d'Yerres Handball — Notification automatique
  </p>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VYHB <noreply@vyhb.fr>",
      to,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceRoleKey || !resendKey) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Récupérer les emails super_admin une seule fois
  const { data: admins } = await supabase
    .from("profiles")
    .select("email")
    .eq("role", "super_admin")
    .eq("disabled", false);

  const adminEmails = (admins ?? [])
    .map((p: Profile) => p.email)
    .filter((e): e is string => !!e);

  let totalSent = 0;
  const levelResults: Record<string, number> = {};

  // Boucle sur les 3 niveaux d'alerte
  for (const level of [7, 3, 1] as AlertLevel[]) {
    const { from, to } = matchWindow(level);

    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("id, date, adversaire, categorie, lieu")
      .gte("date", from)
      .lte("date", to)
      .in("statut", ["prevu", "joue"]);

    if (matchesError) {
      console.error(`Erreur query J-${level}:`, matchesError.message);
      levelResults[`j${level}`] = 0;
      continue;
    }

    let levelSent = 0;

    for (const match of (matches ?? []) as Match[]) {
      // Postes obligatoires non attribués (NULL ou chaîne vide)
      const { data: emptyPostes } = await supabase
        .from("match_postes")
        .select("poste")
        .eq("match_id", match.id)
        .eq("facultatif", false)
        .or("personne.is.null,personne.eq.");

      if (!emptyPostes || emptyPostes.length === 0) continue;

      // Email du ou des responsables de la catégorie
      const { data: responsables } = await supabase
        .from("profiles")
        .select("email")
        .eq("role", "responsable")
        .eq("categorie", match.categorie)
        .eq("disabled", false);

      const responsableEmails = (responsables ?? [])
        .map((p: Profile) => p.email)
        .filter((e): e is string => !!e);

      const recipients = [...new Set([...responsableEmails, ...adminEmails])];
      if (recipients.length === 0) continue;

      try {
        await sendMail(resendKey, recipients, match, emptyPostes as MatchPoste[], level);
        levelSent++;
        totalSent++;
      } catch (e) {
        console.error(`Erreur mail J-${level} match ${match.id}:`, e);
      }
    }

    levelResults[`j${level}`] = levelSent;
  }

  return new Response(
    JSON.stringify({ message: "Alertes envoyées", total: totalSent, ...levelResults }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

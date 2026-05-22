import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  date: string;
  adversaire: string;
  categorie: string;
}

interface MatchPoste {
  poste: string;
}

interface Profile {
  email: string | null;
  role: string;
  categorie: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const POSTE_LABELS: Record<string, string> = {
  responsable_salle: "Responsable de salle",
  secretaire: "Secrétaire",
  table: "Table de marque",
  arbitre: "Arbitre",
};

const ADMIN_URL = "https://v2.vyhb.fr/admin/matches";

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

async function sendMail(
  resendKey: string,
  to: string[],
  match: Match,
  emptyPostes: MatchPoste[]
): Promise<void> {
  if (to.length === 0) return;

  const postesList = emptyPostes
    .map((p) => `  - ${POSTE_LABELS[p.poste] ?? p.poste}`)
    .join("\n");

  const subject = "⚠️ Postes non attribués - Match VYHB dans 7 jours";

  const text = `Bonjour,

Le match [VYHB vs ${match.adversaire}] du ${formatDate(match.date)} à ${formatTime(match.date)} (catégorie ${match.categorie}) a des postes obligatoires non attribués :

${postesList}

Merci de compléter les informations sur le site admin :
${ADMIN_URL}/${match.id}/edit

---
Val d'Yerres Handball — Notification automatique`;

  const html = `<p>Bonjour,</p>
<p>
  Le match <strong>VYHB vs ${match.adversaire}</strong><br>
  du <strong>${formatDate(match.date)}</strong> à <strong>${formatTime(match.date)}</strong><br>
  (catégorie <strong>${match.categorie}</strong>)
  a des postes obligatoires non attribués :
</p>
<ul>
  ${emptyPostes.map((p) => `<li>${POSTE_LABELS[p.poste] ?? p.poste}</li>`).join("\n  ")}
</ul>
<p>
  <a href="${ADMIN_URL}/${match.id}/edit">
    Compléter les informations sur le site admin →
  </a>
</p>
<hr>
<p style="color:#888;font-size:12px;">Val d'Yerres Handball — Notification automatique</p>`;

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

  // Fenêtre J-7 ± 1h
  const now = new Date();
  const target = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const from = new Date(target.getTime() - 60 * 60 * 1000).toISOString();
  const to = new Date(target.getTime() + 60 * 60 * 1000).toISOString();

  // Récupérer les matchs dans la fenêtre J-7
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, date, adversaire, categorie")
    .gte("date", from)
    .lte("date", to)
    .in("statut", ["prevu", "joue"]);

  if (matchesError) {
    return new Response(
      JSON.stringify({ error: matchesError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!matches || matches.length === 0) {
    return new Response(
      JSON.stringify({ message: "Aucun match dans 7 jours", sent: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Récupérer tous les super_admin emails une seule fois
  const { data: admins } = await supabase
    .from("profiles")
    .select("email")
    .eq("role", "super_admin")
    .eq("disabled", false);

  const adminEmails = (admins ?? [])
    .map((p: Profile) => p.email)
    .filter((e): e is string => !!e);

  let sentCount = 0;

  for (const match of matches as Match[]) {
    // Postes obligatoires non attribués pour ce match
    const { data: emptyPostes } = await supabase
      .from("match_postes")
      .select("poste")
      .eq("match_id", match.id)
      .eq("facultatif", false)
      .is("personne", null);

    if (!emptyPostes || emptyPostes.length === 0) continue;

    // Email du responsable de la catégorie
    const { data: responsables } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "responsable")
      .eq("categorie", match.categorie)
      .eq("disabled", false);

    const responsableEmails = (responsables ?? [])
      .map((p: Profile) => p.email)
      .filter((e): e is string => !!e);

    // Destinataires uniques : responsable(s) + super_admins
    const recipients = [...new Set([...responsableEmails, ...adminEmails])];

    if (recipients.length === 0) continue;

    try {
      await sendMail(resendKey, recipients, match, emptyPostes as MatchPoste[]);
      sentCount++;
    } catch (e) {
      console.error(`Erreur mail match ${match.id}:`, e);
    }
  }

  return new Response(
    JSON.stringify({ message: "Alertes envoyées", sent: sentCount }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfMonth, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Trophy, CalendarDays, AlertTriangle, Megaphone,
  Plus, Radio, CheckCircle2, Pencil, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// ── Helpers ───────────────────────────────────────────────────────────────────

function dashHeaders(): Record<string, string> {
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

function dbUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

async function dbFetch<T>(path: string): Promise<T> {
  const res = await fetch(dbUrl(path), { headers: dashHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface MatchItem {
  id: string;
  date: string;
  adversaire: string;
  categorie: string;
  lieu: string | null;
}

interface PosteItem {
  match_id: string;
  poste: string;
}

interface EvenementItem {
  id: string;
  titre: string;
  date_debut: string;
  expire_le: string | null;
}

interface MatchIncomplet {
  match: MatchItem;
  postes: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const POSTE_LABELS: Record<string, string> = {
  responsable_salle: "Resp. salle",
  secretaire: "Secrétaire",
  chronometreur: "Chronométreur",
  arbitre: "Arbitre",
  videaste: "Vidéaste",
  buvette: "Buvette",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-white/[0.06] rounded-lg animate-pulse ${className}`} />;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  loading,
  accent = "text-white/40",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  loading: boolean;
  accent?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-2">
      <div className={`flex items-center gap-2 ${accent}`}>
        <Icon size={14} />
        <span className="text-xs font-medium text-white/40">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <div className="text-2xl font-display font-black text-white leading-none">{value}</div>
      )}
      {loading ? (
        <Skeleton className="h-3 w-24" />
      ) : (
        subtitle && <p className="text-xs text-white/30 truncate">{subtitle}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [matchsMois, setMatchsMois] = useState(0);
  const [prochainsMatchStat, setProchainsMatchStat] = useState<MatchItem | null>(null);
  const [postesCount, setPostesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [incomplets, setIncomplets] = useState<MatchIncomplet[]>([]);
  const [prochains, setProchains] = useState<MatchItem[]>([]);
  const [eventsActifs, setEventsActifs] = useState<EvenementItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const startMonthStr = startOfMonth(today).toISOString().split("T")[0];

        // Batch 1 — requêtes indépendantes en parallèle
        const [matchesMoisRaw, futureMatches, events] = await Promise.all([
          dbFetch<{ id: string }[]>(`matches?date=gte.${startMonthStr}&select=id`),
          dbFetch<MatchItem[]>(
            `matches?statut=eq.prevu&date=gte.${todayStr}&order=date.asc&select=id,date,adversaire,categorie,lieu`
          ),
          dbFetch<EvenementItem[]>(
            `evenements?actif=eq.true&or=(expire_le.is.null,expire_le.gte.${todayStr})&order=ordre.asc,date_debut.asc&select=id,titre,date_debut,expire_le`
          ),
        ]);

        if (cancelled) return;

        // Batch 2 — postes (dépend des IDs de matchs futurs)
        let postes: PosteItem[] = [];
        if (futureMatches.length > 0) {
          const ids = futureMatches.map((m) => m.id).join(",");
          postes = await dbFetch<PosteItem[]>(
            `match_postes?match_id=in.(${ids})&personne=is.null&facultatif=eq.false&select=match_id,poste`
          );
        }

        if (cancelled) return;

        // Matchs incomplets dans les 14 prochains jours
        const plus14 = addDays(today, 14);
        const matchIds14 = new Set(
          futureMatches.filter((m) => new Date(m.date) <= plus14).map((m) => m.id)
        );

        const postesByMatch = new Map<string, string[]>();
        for (const p of postes) {
          if (!postesByMatch.has(p.match_id)) postesByMatch.set(p.match_id, []);
          postesByMatch.get(p.match_id)!.push(p.poste);
        }

        const incompletsList = futureMatches
          .filter((m) => matchIds14.has(m.id) && postesByMatch.has(m.id))
          .map((m) => ({ match: m, postes: postesByMatch.get(m.id)! }));

        setMatchsMois(matchesMoisRaw.length);
        setProchainsMatchStat(futureMatches[0] ?? null);
        setPostesCount(postes.length);
        setEventsCount(events.length);
        setIncomplets(incompletsList);
        setProchains(futureMatches.slice(0, 3));
        setEventsActifs(events);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-black text-white mb-1">Tableau de bord</h1>
        <p className="text-white/40 text-sm">
          Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""}
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          Erreur : {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Matchs ce mois"
          value={matchsMois}
          loading={loading}
          accent="text-orange-400"
        />
        <StatCard
          icon={CalendarDays}
          label="Prochain match"
          value={
            prochainsMatchStat
              ? format(new Date(prochainsMatchStat.date), "d MMM", { locale: fr })
              : "—"
          }
          subtitle={prochainsMatchStat?.adversaire ?? "Aucun prévu"}
          loading={loading}
          accent="text-blue-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Postes manquants"
          value={postesCount}
          subtitle={
            postesCount === 0
              ? "Tout est OK"
              : postesCount === 1
              ? "1 poste non attribué"
              : `${postesCount} postes non attribués`
          }
          loading={loading}
          accent={postesCount > 0 ? "text-red-400" : "text-emerald-400"}
        />
        <StatCard
          icon={Megaphone}
          label="Événements en ligne"
          value={eventsCount}
          loading={loading}
          accent="text-emerald-400"
        />
      </div>

      {/* Section: Postes incomplets */}
      <section>
        <h2 className="text-base font-display font-bold text-white mb-3">
          Matchs à venir — Postes incomplets
          <span className="text-white/30 font-normal text-sm ml-2">(14 prochains jours)</span>
        </h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : incomplets.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">
              Tous les postes sont attribués pour les 14 prochains jours.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {incomplets.map(({ match, postes }) => {
              const daysLeft = differenceInDays(new Date(match.date), new Date());
              const isUrgent = daysLeft <= 7;
              const urgentLabel = daysLeft === 0 ? "Aujourd'hui" : `J-${daysLeft}`;
              return (
                <div
                  key={match.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{match.adversaire}</span>
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                          {urgentLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">
                      {format(new Date(match.date), "EEEE d MMMM · HH:mm", { locale: fr })}
                      {" · "}{match.categorie}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {postes.map((p) => (
                        <span
                          key={p}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/15"
                        >
                          {POSTE_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/matches/${match.id}/edit`)}
                    className="text-white/40 hover:text-white hover:bg-white/[0.06] h-8 px-2.5 text-xs gap-1.5 shrink-0 mt-0.5"
                  >
                    <Pencil size={12} />
                    Éditer
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section: Prochains matchs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-white">Prochains matchs</h2>
          <button
            onClick={() => navigate("/admin/matches")}
            className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
          >
            Tout voir <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : prochains.length === 0 ? (
          <p className="text-white/30 text-sm py-6 text-center">Aucun match prévu.</p>
        ) : (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {prochains.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{m.adversaire}</span>
                    <span className="text-white/25 text-xs shrink-0">{m.categorie}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">
                    {format(new Date(m.date), "EEEE d MMMM · HH:mm", { locale: fr })}
                    {m.lieu && (
                      <span className="text-white/25"> · {m.lieu}</span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/admin/matches/${m.id}/edit`)}
                  className="text-white/30 hover:text-white hover:bg-white/[0.06] h-7 w-7 p-0 shrink-0"
                >
                  <Pencil size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Événements actifs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-white">Événements en ligne</h2>
          <button
            onClick={() => navigate("/admin/evenements")}
            className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
          >
            Gérer <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : eventsActifs.length === 0 ? (
          <p className="text-white/30 text-sm py-6 text-center">Aucun événement en ligne.</p>
        ) : (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {eventsActifs.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium truncate block">{ev.titre}</span>
                  <p className="text-white/35 text-xs mt-0.5">
                    {ev.expire_le
                      ? `Expire le ${format(new Date(ev.expire_le), "d MMMM yyyy", { locale: fr })}`
                      : "Aucune expiration"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate("/admin/evenements")}
                  className="text-white/30 hover:text-white hover:bg-white/[0.06] h-7 w-7 p-0 shrink-0"
                >
                  <Pencil size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Raccourcis rapides */}
      <section>
        <h2 className="text-base font-display font-bold text-white mb-3">Raccourcis</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/admin/matches/new")}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
          >
            <Plus size={15} />
            Nouveau match
          </Button>
          <Button
            onClick={() => navigate("/admin/evenements")}
            variant="outline"
            className="border-white/[0.10] bg-white/[0.03] text-white hover:bg-white/[0.07] font-bold gap-2"
          >
            <Plus size={15} />
            Nouvel événement
          </Button>
          <Button
            onClick={() => navigate("/admin/ticker")}
            variant="outline"
            className="border-white/[0.10] bg-white/[0.03] text-white hover:bg-white/[0.07] font-bold gap-2"
          >
            <Radio size={15} />
            Gérer le bandeau
          </Button>
        </div>
      </section>
    </div>
  );
}

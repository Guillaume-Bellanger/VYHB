import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Home, Plane, BookOpen, Calendar, Trophy, History } from "lucide-react";
import SEO from "@/components/SEO";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { MATCH_CATEGORIES } from "@/data/categories";
import type { Match } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ── Constants ────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  championnat: "Championnat",
  coupe: "Coupe",
  amical: "Amical",
  tournoi: "Tournoi",
};

// ── Helpers ──────────────────────────────────────────────────

// Saison de septembre à août : mai 2026 → "2025/2026"
function getSeasonLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const startYear = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${startYear}/${startYear + 1}`;
}

// Regroupe une liste déjà triée par date croissante en groupes de saison
// consécutifs (l'ordre des groupes suit donc naturellement l'ordre chronologique).
function groupBySeason(matches: Match[]): { saison: string; matches: Match[] }[] {
  const groups: { saison: string; matches: Match[] }[] = [];
  for (const m of matches) {
    const saison = getSeasonLabel(m.date);
    const last = groups[groups.length - 1];
    if (last && last.saison === saison) {
      last.matches.push(m);
    } else {
      groups.push({ saison, matches: [m] });
    }
  }
  return groups;
}

// ── Sub-components ───────────────────────────────────────────

function ResultBadge({ nous, eux }: { nous: number; eux: number }) {
  const result = nous > eux ? "V" : nous < eux ? "D" : "N";
  const map = {
    V: { label: "Victoire", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    D: { label: "Défaite",  cls: "bg-red-500/15 text-red-400 border-red-500/25" },
    N: { label: "Nul",      cls: "bg-white/10 text-white/50 border-white/15" },
  };
  const { label, cls } = map[result];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-display font-bold uppercase border ${cls}`}>
      {label}
    </span>
  );
}

function MatchSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

function UpcomingCard({ match, index }: { match: Match; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-premium rounded-2xl p-5 border border-white/[0.06] hover:border-orange-500/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-black text-white text-sm">
          {format(new Date(match.date), "EEEE d MMMM", { locale: fr })}
        </span>
        <span className="text-orange-400/80 font-display font-bold text-sm">
          {format(new Date(match.date), "HH:mm")}
        </span>
      </div>
      <p className="font-display font-bold text-white mb-0.5">{match.categorie}</p>
      <p className="text-white/55 text-sm mb-3">vs {match.adversaire}</p>
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 font-medium ${match.domicile ? "text-orange-400/80" : "text-blue-400/80"}`}>
          {match.domicile ? <Home size={11} /> : <Plane size={11} />}
          {match.lieu ?? (match.domicile ? "Domicile" : "Extérieur")}
        </span>
        <span className="text-white/30">{TYPE_LABELS[match.type]}</span>
      </div>
    </motion.div>
  );
}

function ResultCard({
  match,
  index,
  onResume,
}: {
  match: Match;
  index: number;
  onResume: (m: Match) => void;
}) {
  const hasScore = match.score_nous != null && match.score_eux != null;
  const result = hasScore
    ? match.score_nous! > match.score_eux! ? "V" : match.score_nous! < match.score_eux! ? "D" : "N"
    : null;

  const borderCls = result === "V"
    ? "border-emerald-500/15"
    : result === "D"
    ? "border-red-500/15"
    : "border-white/[0.06]";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-premium rounded-2xl border ${borderCls}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          {hasScore ? (
            <ResultBadge nous={match.score_nous!} eux={match.score_eux!} />
          ) : (
            <span className="text-white/30 text-xs">Score non renseigné</span>
          )}
          <span className="text-xs text-white/30">
            {format(new Date(match.date), "d MMM yyyy", { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-2.5">
          {hasScore && (
            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-display font-black text-2xl tabular-nums ${result === "V" ? "text-emerald-400" : result === "D" ? "text-red-400" : "text-white/60"}`}>
                {match.score_nous}
              </span>
              <span className="text-white/20 font-bold">—</span>
              <span className="font-display font-black text-2xl tabular-nums text-white/40">
                {match.score_eux}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm truncate">{match.categorie}</p>
            <p className="text-white/45 text-sm truncate">vs {match.adversaire}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs flex items-center gap-1 ${match.domicile ? "text-orange-400/60" : "text-blue-400/60"}`}>
            {match.domicile ? <Home size={10} /> : <Plane size={10} />}
            {match.lieu ?? (match.domicile ? "Domicile" : "Extérieur")}
          </span>
          {match.resume && (
            <button
              onClick={() => onResume(match)}
              className="flex items-center gap-1.5 text-xs text-orange-400/70 hover:text-orange-400 transition-colors"
            >
              <BookOpen size={12} />
              Lire le résumé
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CategoryResultsGroup({
  categorie,
  matches,
  onResume,
}: {
  categorie: string;
  matches: Match[];
  onResume: (m: Match) => void;
}) {
  return (
    <div>
      <h3 className="font-display font-bold text-white/75 text-sm uppercase tracking-wider mb-3">{categorie}</h3>
      <div className="space-y-3">
        {matches.map((m, i) => (
          <ResultCard key={m.id} match={m} index={i} onResume={onResume} />
        ))}
      </div>
    </div>
  );
}

function SeasonGroup({
  saison,
  matches,
  onResume,
}: {
  saison: string;
  matches: Match[];
  onResume: (m: Match) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-display font-black text-white/70 text-sm uppercase tracking-wider shrink-0">
          Saison {saison}
        </h3>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <div className="space-y-3">
        {matches.map((m, i) => (
          <ResultCard key={m.id} match={m} index={i} onResume={onResume} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function Resultats() {
  const [tab, setTab] = useState<string>("resultats");
  const [historiqueCategorie, setHistoriqueCategorie] = useState<string>("toutes");
  const [resumeMatch, setResumeMatch] = useState<Match | null>(null);

  const { data, isLoading, isError } = usePublicMatches();

  const now = new Date();
  const publies = data?.filter((m) => m.statut === "publie") ?? [];
  const upcoming = (data?.filter((m) => m.statut === "prevu" && new Date(m.date) > now) ?? [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Derniers résultats : 2 matchs les plus récents par catégorie, catégories vides masquées
  const derniersParCategorie = MATCH_CATEGORIES
    .map((categorie) => ({
      categorie,
      matches: publies
        .filter((m) => m.categorie === categorie)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2),
    }))
    .filter((g) => g.matches.length > 0);

  // Historique : tous les matchs publiés, filtre catégorie, du plus ancien au plus récent
  const historiqueMatches = (
    historiqueCategorie === "toutes"
      ? publies
      : publies.filter((m) => m.categorie === historiqueCategorie)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const historiqueParSaison = groupBySeason(historiqueMatches);

  return (
    <>
      <SEO
        title="Résultats & Calendrier"
        description="Résultats et matchs à venir du Val d'Yerres Handball — toutes catégories, saison 2026/2027."
        canonical="/resultats"
        breadcrumb={[
          { name: "Accueil", url: "/" },
          { name: "Résultats", url: "/resultats" },
        ]}
      />

      {/* Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[420px] h-[420px] bg-orange-600/12 top-[-100px] right-[-80px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[280px] h-[280px] bg-blue-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "18s", animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Résultats <span className="gradient-text">&amp; Calendrier</span>
            </h1>
            <p className="text-white/45 text-lg max-w-lg leading-relaxed mx-auto">
              Scores, comptes-rendus et matchs à venir — toutes catégories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container-narrow px-4 md:px-6">
          <Tabs value={tab} onValueChange={setTab}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid mb-10 h-auto p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <TabsTrigger
                  value="resultats"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-display font-bold data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/40 data-[state=active]:[background:var(--gradient-accent)]"
                >
                  <Trophy size={13} />
                  Résultats
                </TabsTrigger>
                <TabsTrigger
                  value="historique"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-display font-bold data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-white/40 data-[state=active]:[background:var(--gradient-accent)]"
                >
                  <History size={13} />
                  Historique
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* ── Onglet Résultats ── */}
            <TabsContent value="resultats" className="mt-0 space-y-10">
              {/* À venir */}
              <div>
                <h2 className="font-display font-black text-white text-lg mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-orange-400" />
                  Matchs à venir
                </h2>
                {isLoading && <MatchSkeletons />}
                {!isLoading && !isError && upcoming.length === 0 && (
                  <p className="text-white/25 text-sm py-6 text-center">Aucun match à venir.</p>
                )}
                {!isLoading && upcoming.length > 0 && (
                  <div className="space-y-3">
                    {upcoming.map((m, i) => (
                      <UpcomingCard key={m.id} match={m} index={i} />
                    ))}
                  </div>
                )}
              </div>

              {/* Derniers résultats — 2 par catégorie */}
              <div>
                <h2 className="font-display font-black text-white text-lg mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-orange-400" />
                  Derniers résultats
                </h2>
                {isLoading && <MatchSkeletons />}
                {!isLoading && isError && (
                  <p className="text-white/25 text-sm py-6 text-center">Impossible de charger les résultats.</p>
                )}
                {!isLoading && !isError && derniersParCategorie.length === 0 && (
                  <p className="text-white/25 text-sm py-6 text-center">Aucun résultat publié.</p>
                )}
                {!isLoading && !isError && derniersParCategorie.length > 0 && (
                  <div className="space-y-8">
                    {derniersParCategorie.map(({ categorie, matches }) => (
                      <CategoryResultsGroup
                        key={categorie}
                        categorie={categorie}
                        matches={matches}
                        onResume={setResumeMatch}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Onglet Historique ── */}
            <TabsContent value="historique" className="mt-0 space-y-8">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-display font-black text-white text-lg flex items-center gap-2">
                  <History size={18} className="text-orange-400" />
                  Historique des matchs
                </h2>
                <Select value={historiqueCategorie} onValueChange={setHistoriqueCategorie}>
                  <SelectTrigger className="w-full sm:w-56 bg-white/[0.04] border-white/[0.10] text-white">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toutes">Toutes catégories</SelectItem>
                    {MATCH_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading && <MatchSkeletons />}
              {!isLoading && isError && (
                <p className="text-white/25 text-sm py-6 text-center">Impossible de charger l'historique.</p>
              )}
              {!isLoading && !isError && historiqueParSaison.length === 0 && (
                <p className="text-white/25 text-sm py-6 text-center">
                  {historiqueCategorie === "toutes"
                    ? "Aucun résultat publié."
                    : `Aucun match publié pour ${historiqueCategorie}.`}
                </p>
              )}
              {!isLoading && !isError && historiqueParSaison.length > 0 && (
                <div className="space-y-10">
                  {historiqueParSaison.map(({ saison, matches }) => (
                    <SeasonGroup
                      key={saison}
                      saison={saison}
                      matches={matches}
                      onResume={setResumeMatch}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Modal résumé */}
      <Dialog open={!!resumeMatch} onOpenChange={(o) => !o && setResumeMatch(null)}>
        {resumeMatch && (
          <DialogContent className="bg-[#0f0f17] border-white/[0.08] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-display">
                {resumeMatch.categorie} · vs {resumeMatch.adversaire}
              </DialogTitle>
              <p className="text-white/40 text-sm">
                {format(new Date(resumeMatch.date), "d MMMM yyyy", { locale: fr })}
                {resumeMatch.score_nous != null && resumeMatch.score_eux != null && (
                  <> · <span className="font-bold text-white">{resumeMatch.score_nous} – {resumeMatch.score_eux}</span></>
                )}
              </p>
            </DialogHeader>
            <div className="mt-2 text-white/65 text-sm leading-relaxed whitespace-pre-wrap">
              {resumeMatch.resume}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

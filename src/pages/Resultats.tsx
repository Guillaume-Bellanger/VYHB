import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Home, Plane, BookOpen, Calendar, Trophy } from "lucide-react";
import SEO from "@/components/SEO";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import type { Match } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ── Constants ────────────────────────────────────────────────

const ALL_CATS = [
  "Séniors Masculins", "Séniors Féminins", "-15/-18M", "-15/-18F",
  "-13F", "-13H", "-11 Mixte", "-9", "Baby / -7", "Loisir",
];

const TYPE_LABELS: Record<string, string> = {
  championnat: "Championnat",
  coupe: "Coupe",
  amical: "Amical",
  tournoi: "Tournoi",
};

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

// ── Main page ─────────────────────────────────────────────────

export default function Resultats() {
  const [activeTab, setActiveTab] = useState<string>("tous");
  const [resumeMatch, setResumeMatch] = useState<Match | null>(null);

  const catFilter = activeTab === "tous" ? undefined : activeTab;

  const { data, isLoading, isError } = usePublicMatches(catFilter);

  const now = new Date();
  const results = data?.filter((m) => m.statut === "publie") ?? [];
  const upcoming = (data?.filter((m) => m.statut === "prevu" && new Date(m.date) > now) ?? [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const tabs = [{ value: "tous", label: "Tous" }, ...ALL_CATS.map((c) => ({ value: c, label: c }))];

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

          {/* Tab bar — horizontal scroll sur mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-1 p-1.5 rounded-2xl mb-10 overflow-x-auto scrollbar-none"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {tabs.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer ${
                  activeTab === value
                    ? "text-white shadow-lg"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                style={activeTab === value ? { background: "var(--gradient-accent)" } : {}}
              >
                {value === "tous" ? <Trophy size={12} /> : null}
                {label}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* ── À venir ── */}
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

              {/* ── Résultats ── */}
              <div>
                <h2 className="font-display font-black text-white text-lg mb-4 flex items-center gap-2">
                  <Trophy size={18} className="text-orange-400" />
                  Résultats
                </h2>
                {isLoading && <MatchSkeletons />}
                {!isLoading && isError && (
                  <p className="text-white/25 text-sm py-6 text-center">Impossible de charger les résultats.</p>
                )}
                {!isLoading && !isError && results.length === 0 && (
                  <p className="text-white/25 text-sm py-6 text-center">Aucun résultat publié.</p>
                )}
                {!isLoading && !isError && results.length > 0 && (
                  <div className="space-y-3">
                    {results.map((m, i) => (
                      <ResultCard key={m.id} match={m} index={i} onResume={setResumeMatch} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
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

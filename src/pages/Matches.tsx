import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Trophy, BarChart2, MapPin, Clock, Home, Plane, Info } from "lucide-react";

/* ─── DATA ─── */

const prochainsMatchs = [
  { date: "03/05/2026", heure: "14h00", equipe: "Seniors Masculins", adversaire: "JS Corbeil", competition: "Chpt. Dépt. D2", lieu: "Gymnase Jean Moulin, Boussy-S-A.", domicile: true, isNext: true },
  { date: "05/05/2026", heure: "11h00", equipe: "-13F", adversaire: "Épinay HB", competition: "Chpt. Dépt.", lieu: "Gymnase d'Épinay-sous-Sénart", domicile: false, isNext: false },
  { date: "10/05/2026", heure: "10h30", equipe: "-13F", adversaire: "HBC Yerres", competition: "Chpt. Dépt.", lieu: "Gymnase Municipal, Boussy-S-A.", domicile: true, isNext: false },
  { date: "10/05/2026", heure: "15h00", equipe: "Seniors Féminines", adversaire: "Ste-Geneviève HB", competition: "Chpt. Dépt.", lieu: "Gymnase Jean Moulin, Boussy-S-A.", domicile: true, isNext: false },
  { date: "12/05/2026", heure: "14h00", equipe: "Seniors Masculins", adversaire: "Quincy HB", competition: "Chpt. Dépt. D2", lieu: "Gymnase de Quincy-sous-Sénart", domicile: false, isNext: false },
  { date: "17/05/2026", heure: "15h00", equipe: "-15/-18M", adversaire: "Draveil HB", competition: "Chpt. Dépt.", lieu: "Gymnase Paul Bert, Boussy-S-A.", domicile: true, isNext: false },
  { date: "19/05/2026", heure: "10h00", equipe: "-11M", adversaire: "HC Brunoy", competition: "Chpt. Dépt.", lieu: "Gymnase de Brunoy", domicile: false, isNext: false },
  { date: "24/05/2026", heure: "11h00", equipe: "-15/-18M", adversaire: "HBC Yerres", competition: "Chpt. Dépt.", lieu: "Gymnase Jean Moulin, Boussy-S-A.", domicile: true, isNext: false },
  { date: "31/05/2026", heure: "09h30", equipe: "-11M", adversaire: "HC Brunoy", competition: "Chpt. Dépt.", lieu: "Gymnase Municipal, Boussy-S-A.", domicile: true, isNext: false },
];

const resultats = [
  { date: "27/04/2026", equipe: "Seniors Masculins", adversaire: "HC Brunoy", scoreNous: 28, scoreAdv: 24, domicile: true, competition: "Chpt. Dépt. D2", resultat: "V" },
  { date: "26/04/2026", equipe: "-13F", adversaire: "Épinay HB", scoreNous: 24, scoreAdv: 20, domicile: true, competition: "Chpt. Dépt.", resultat: "V" },
  { date: "20/04/2026", equipe: "Seniors Féminines", adversaire: "HBC Yerres", scoreNous: 19, scoreAdv: 22, domicile: true, competition: "Chpt. Dépt.", resultat: "D" },
  { date: "19/04/2026", equipe: "Seniors Masculins", adversaire: "Brunoy HB", scoreNous: 25, scoreAdv: 19, domicile: false, competition: "Chpt. Dépt. D2", resultat: "V" },
  { date: "13/04/2026", equipe: "-15/-18M", adversaire: "Quincy HB", scoreNous: 31, scoreAdv: 18, domicile: true, competition: "Chpt. Dépt.", resultat: "V" },
  { date: "12/04/2026", equipe: "-13F", adversaire: "Ste-Geneviève HB", scoreNous: 16, scoreAdv: 21, domicile: false, competition: "Chpt. Dépt.", resultat: "D" },
  { date: "06/04/2026", equipe: "Seniors Féminines", adversaire: "Draveil HB", scoreNous: 22, scoreAdv: 22, domicile: false, competition: "Chpt. Dépt.", resultat: "N" },
  { date: "05/04/2026", equipe: "Seniors Masculins", adversaire: "Draveil HB", scoreNous: 22, scoreAdv: 22, domicile: true, competition: "Chpt. Dépt. D2", resultat: "N" },
  { date: "30/03/2026", equipe: "-11M", adversaire: "HC Brunoy", scoreNous: 14, scoreAdv: 8, domicile: true, competition: "Chpt. Dépt.", resultat: "V" },
  { date: "29/03/2026", equipe: "-15/-18M", adversaire: "HBC Yerres", scoreNous: 24, scoreAdv: 27, domicile: false, competition: "Chpt. Dépt.", resultat: "D" },
];

const classements = [
  {
    categorie: "Seniors Masculins",
    competition: "Championnat Départemental D2",
    equipes: [
      { pos: 1, nom: "HC Brunoy",         j: 18, v: 14, n: 1, d: 3,  bp: 512, bc: 412, pts: 43, nous: false },
      { pos: 2, nom: "Draveil HB",         j: 18, v: 12, n: 2, d: 4,  bp: 487, bc: 436, pts: 38, nous: false },
      { pos: 3, nom: "Val d'Yerres Handball",    j: 18, v: 11, n: 2, d: 5,  bp: 476, bc: 451, pts: 35, nous: true  },
      { pos: 4, nom: "JS Corbeil",         j: 18, v: 10, n: 1, d: 7,  bp: 441, bc: 432, pts: 31, nous: false },
      { pos: 5, nom: "Quincy HB",          j: 18, v: 8,  n: 3, d: 7,  bp: 423, bc: 430, pts: 27, nous: false },
      { pos: 6, nom: "HBC Yerres",         j: 18, v: 7,  n: 2, d: 9,  bp: 398, bc: 444, pts: 23, nous: false },
      { pos: 7, nom: "Brunoy HB",          j: 18, v: 5,  n: 3, d: 10, bp: 379, bc: 468, pts: 18, nous: false },
      { pos: 8, nom: "Épinay HB",          j: 18, v: 3,  n: 2, d: 13, bp: 328, bc: 531, pts: 11, nous: false },
    ],
  },
  {
    categorie: "Seniors Féminines",
    competition: "Championnat Départemental",
    equipes: [
      { pos: 1, nom: "HBC Yerres",         j: 16, v: 12, n: 1, d: 3,  bp: 442, bc: 371, pts: 37, nous: false },
      { pos: 2, nom: "Ste-Geneviève HB",   j: 16, v: 11, n: 2, d: 3,  bp: 427, bc: 382, pts: 35, nous: false },
      { pos: 3, nom: "Val d'Yerres Handball",    j: 16, v: 9,  n: 2, d: 5,  bp: 398, bc: 389, pts: 29, nous: true  },
      { pos: 4, nom: "Draveil HB",         j: 16, v: 8,  n: 1, d: 7,  bp: 371, bc: 398, pts: 25, nous: false },
      { pos: 5, nom: "HC Brunoy",          j: 16, v: 7,  n: 2, d: 7,  bp: 356, bc: 404, pts: 23, nous: false },
      { pos: 6, nom: "Épinay HB",          j: 16, v: 4,  n: 1, d: 11, bp: 298, bc: 448, pts: 13, nous: false },
    ],
  },
];

/* ─── Sub-components ─── */

const ResultBadge = ({ r }: { r: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    V: { label: "Victoire", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    D: { label: "Défaite",  cls: "bg-red-500/15 text-red-400 border-red-500/25" },
    N: { label: "Nul",      cls: "bg-white/10 text-white/50 border-white/15" },
  };
  const { label, cls } = map[r] ?? map.N;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-display font-bold uppercase border ${cls}`}>
      {label}
    </span>
  );
};

const TABS = ["prochains", "resultats", "classement"] as const;
type Tab = typeof TABS[number];

const tabItems = [
  { value: "prochains" as Tab, label: "Prochains matchs", icon: Calendar },
  { value: "resultats" as Tab, label: "Résultats",        icon: Trophy    },
  { value: "classement" as Tab, label: "Classement",      icon: BarChart2 },
];

/* ─── Page ─── */

const Matches = () => {
  const [activeTab, setActiveTab] = useState<Tab>("prochains");

  return (
    <>
      {/* Page Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[420px] h-[420px] bg-orange-600/12 top-[-100px] right-[-80px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[280px] h-[280px] bg-blue-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "18s", animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Matchs <span className="gradient-text">&amp; Résultats</span>
            </h1>
            <p className="text-white/45 text-lg max-w-lg leading-relaxed mx-auto">
              Calendrier, scores et classements — toutes les équipes du club.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 overflow-hidden">
        <div className="container-narrow px-4 md:px-6">

          {/* Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 rounded-xl px-5 py-3.5 mb-8 text-sm border border-blue-500/20 text-blue-400/70"
            style={{ background: "rgba(59,130,246,0.06)" }}
          >
            <Info size={15} className="shrink-0 text-blue-400" />
            <span>Données indicatives — Ces informations seront mises à jour automatiquement depuis le site officiel de la FFHB.</span>
          </motion.div>

          {/* Tab Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-1 p-1.5 rounded-2xl mb-10"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {tabItems.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-all duration-300 grow basis-[calc(33%-4px)] sm:flex-1 justify-center cursor-pointer ${
                  activeTab === value
                    ? "text-white shadow-lg"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                style={activeTab === value ? { background: "var(--gradient-accent)" } : {}}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <AnimatePresence mode="wait">

            {/* ─── PROCHAINS MATCHS ─── */}
            {activeTab === "prochains" && (
              <motion.div
                key="prochains"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {prochainsMatchs.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-premium rounded-2xl p-5 border ${
                      m.isNext
                        ? "border-orange-500/30 shadow-[0_0_24px_rgba(249,115,22,0.08)]"
                        : "border-white/[0.06]"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {m.isNext && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />}
                        <span className="font-display font-black text-white text-sm">{m.date}</span>
                      </div>
                      <span className="flex items-center gap-1.5 font-display font-bold text-orange-400 text-sm">
                        <Clock size={13} />{m.heure}
                      </span>
                    </div>

                    {/* Teams */}
                    <div className="font-display font-bold text-white mb-0.5">{m.equipe}</div>
                    <div className="text-white/55 text-sm mb-3">vs {m.adversaire}</div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={`flex items-center gap-1 font-medium ${m.domicile ? "text-orange-400/80" : "text-blue-400/80"}`}>
                        {m.domicile ? <Home size={12} /> : <Plane size={12} />}
                        {m.domicile ? "Domicile" : "Extérieur"}
                      </span>
                      <span className="text-white/30">{m.competition}</span>
                    </div>

                    {m.lieu && (
                      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-white/20">
                        <MapPin size={10} className="shrink-0" />
                        {m.lieu}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ─── RÉSULTATS ─── */}
            {activeTab === "resultats" && (
              <motion.div
                key="resultats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-3">
                  {resultats.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass-premium rounded-2xl border ${
                        r.resultat === "V" ? "border-emerald-500/15" :
                        r.resultat === "D" ? "border-red-500/15" :
                        "border-white/[0.06]"
                      }`}
                    >
                      <div className="p-5">
                        {/* Ligne 1 : badge + date */}
                        <div className="flex items-center justify-between mb-3">
                          <ResultBadge r={r.resultat} />
                          <span className="text-xs text-white/30 shrink-0">{r.date}</span>
                        </div>

                        {/* Ligne 2 : score + équipe */}
                        <div className="flex items-center gap-4 mb-2.5">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`font-display font-black text-2xl tabular-nums ${
                              r.resultat === "V" ? "text-emerald-400" :
                              r.resultat === "D" ? "text-red-400" :
                              "text-white/60"
                            }`}>{r.scoreNous}</span>
                            <span className="text-white/20 font-bold">—</span>
                            <span className="font-display font-black text-2xl tabular-nums text-white/40">{r.scoreAdv}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-display font-bold text-white text-sm truncate">{r.equipe}</div>
                            <div className="text-white/45 text-sm truncate">vs {r.adversaire}</div>
                          </div>
                        </div>

                        {/* Ligne 3 : domicile/extérieur */}
                        <div className={`text-xs flex items-center gap-1 ${r.domicile ? "text-orange-400/60" : "text-blue-400/60"}`}>
                          {r.domicile ? <Home size={10} /> : <Plane size={10} />}
                          {r.domicile ? "Domicile" : "Extérieur"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── CLASSEMENT ─── */}
            {activeTab === "classement" && (
              <motion.div
                key="classement"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {classements.map((cat, ci) => (
                  <div key={ci}>
                    <div className="text-center mb-6">
                      <h3 className="font-display font-black text-white text-xl">{cat.categorie}</h3>
                      <p className="text-white/35 text-xs font-display font-semibold uppercase tracking-wider mt-1">
                        {cat.competition}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {cat.equipes.map((eq, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ci * 0.1 + i * 0.045 }}
                          className={`glass-premium rounded-2xl p-4 border flex items-center gap-4 ${
                            eq.nous
                              ? "border-orange-500/30 bg-orange-500/[0.06]"
                              : "border-white/[0.06] hover:border-white/[0.1]"
                          } transition-colors`}
                        >
                          {/* Position */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 ${
                              eq.pos === 1
                                ? "text-white"
                                : eq.pos === 2
                                ? "bg-white/10 text-white/70"
                                : eq.pos === 3
                                ? "bg-white/[0.06] text-white/50"
                                : "bg-white/[0.04] text-white/30"
                            }`}
                            style={eq.pos === 1 ? { background: "var(--gradient-accent)" } : {}}
                          >
                            {eq.pos}
                          </div>

                          {/* Name + stats */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-display font-bold text-sm truncate ${eq.nous ? "text-orange-400" : "text-white"}`}>
                              {eq.nom}
                              {eq.nous && (
                                <span className="ml-2 text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-full px-2 py-0.5 font-bold uppercase">
                                  Nous
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-white/35">
                              <span>J{eq.j}</span>
                              <span className="text-emerald-400">V{eq.v}</span>
                              <span>N{eq.n}</span>
                              <span className="text-red-400/70">D{eq.d}</span>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right shrink-0">
                            <div className={`font-display font-black text-2xl tabular-nums leading-none ${eq.nous ? "text-orange-400" : "text-white"}`}>
                              {eq.pts}
                            </div>
                            <div className="text-[10px] text-white/25 mt-0.5">pts</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-[11px] text-white/20 mt-4 text-center">
                      J = Joués · V = Victoires · N = Nuls · D = Défaites
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Matches;

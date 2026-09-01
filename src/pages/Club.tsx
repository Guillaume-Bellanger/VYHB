import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { useEncadrementPublic } from "@/hooks/useEncadrement";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { HistoriqueItem, ValeurItem } from "@/types/siteContent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock, Users, User, GraduationCap,
  Award, ClipboardList, BookOpen,
  Heart, Shield, Users2, Zap,
} from "lucide-react";

// Détails visuels des valeurs (icône/couleur) — non éditables depuis l'admin,
// associés par position au tableau `club.valeurs` chargé depuis site_content.
const VALEUR_STYLES = [
  { icon: Shield, accent: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Heart, accent: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Zap, accent: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Users2, accent: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const FALLBACK_VALEURS: ValeurItem[] = [
  { titre: "Respect", texte: "Le respect de chacun (coéquipiers, entraîneurs, adversaires, arbitres), des règles et de notre environnement est la base d'une pratique sportive saine, collective et constructive." },
  { titre: "Plaisir", texte: "Le plaisir, c'est partager des moments ensemble, s'investir dans l'effort, vivre sa passion et savourer les réussites ; il nourrit l'envie de progresser, de persévérer et de transmettre cette énergie aux autres." },
  { titre: "Dépassement de soi", texte: "Le dépassement de soi, c'est oser aller plus loin que ses limites, se découvrir de nouvelles capacités et progresser au service de soi-même comme du collectif." },
  { titre: "Convivialité", texte: "La convivialité, c'est créer des liens, partager des moments ensemble et faire vivre un esprit de club chaleureux et accueillant." },
];

const FALLBACK_HISTORIQUE: HistoriqueItem[] = [
  { annee: "~2003", titre: "Fondation du club", texte: "Création du VYHB au cœur du Val d'Yerres. Les premières équipes voient le jour avec une poignée de passionnés." },
  { annee: "~2010", titre: "Développement du secteur Jeunes", texte: "Naissance de l'école de handball. Les catégories Baby Hand, -7 et -9 se structurent. La formation devient une priorité." },
  { annee: "~2015", titre: "Croissance et compétitions", texte: "Le club atteint 10 équipes en compétition. Les seniors s'imposent en championnat départemental." },
  { annee: "Aujourd'hui", titre: "245 licenciés, 10 équipes", texte: "Plus qu'un club, une famille. Une communauté engagée, des bénévoles dévoués, et la même passion intacte depuis plus de 20 ans." },
];

const FALLBACK_TEXTE_ENTRAINEURS = "Nos entraîneurs et bénévoles sont le cœur battant du club. Leur passion, leur disponibilité et leur engagement font vivre le club au quotidien.";

const FALLBACK_TEXTE_BENEVOLES = `Au Val d'Yerres Handball, rien ne serait possible sans l'engagement précieux de nos bénévoles. Qu'ils soient sur le terrain, en coulisses ou derrière un ordinateur, ils font vivre le club au quotidien et permettent à toutes nos équipes de pratiquer leur passion dans les meilleures conditions.

Nous avons besoin de vous !

Toutes les bonnes volontés sont les bienvenues : entraînement et encadrement, aide administrative, communication et réseaux sociaux, organisation d'événements, logistique, buvette, responsable de salles…

Intéressé(e) ? Contactez-nous via le site ou par mail. Ensemble, faisons grandir notre club !`;

const FALLBACK_TEXTE_ECOLE_ARBITRAGE = "Notre école d'arbitrage accompagne les jeunes qui souhaitent s'initier à l'arbitrage dans un cadre bienveillant et structuré. Encadrés par des arbitres expérimentés, ils apprennent à maîtriser les règles du jeu, à gérer une rencontre et à développer leur confiance en eux et leur sens des responsabilités. Arbitrer, c'est une autre façon d'aimer le handball.";

const formations = [
  {
    icon: Award,
    title: "Arbitrage",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    content: "Au Val d'Yerres Handball, l'arbitrage fait partie intégrante de l'apprentissage du jeu. Nous encourageons et formons nos jeunes à devenir arbitres, pour développer leur sens des responsabilités, leur confiance et leur connaissance du handball. C'est aussi transmettre des valeurs essentielles : respect, équité, engagement.",
  },
  {
    icon: ClipboardList,
    title: "Table de marque",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    content: "La table de marque, c'est le poste de confiance par excellence. Chronométreur, marqueur, secrétaire de match : ces rôles sont essentiels au bon déroulement de chaque rencontre. Nous formons nos bénévoles et nos jeunes à tenir la table de marque avec sérieux et rigueur. Une belle façon de s'impliquer dans la vie du club tout en apprenant les rouages du handball officiel.",
    photo: "/images/tables.jpeg",
  },
  {
    icon: BookOpen,
    title: "École d'arbitrage",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    content: "Notre école d'arbitrage accompagne les jeunes qui souhaitent s'initier à l'arbitrage dans un cadre bienveillant et structuré. Encadrés par des arbitres expérimentés, ils apprennent à maîtriser les règles du jeu, à gérer une rencontre et à développer leur confiance en eux et leur sens des responsabilités. Arbitrer, c'est une autre façon d'aimer le handball.",
  },
];

const VALID_TABS = ["historique", "bureau", "entraineurs", "formations"] as const;
type TabValue = (typeof VALID_TABS)[number];

const tabItems = [
  { value: "historique" as TabValue, label: "Historique", icon: Clock },
  { value: "bureau" as TabValue, label: "L'Organisation", icon: Users },
  { value: "entraineurs" as TabValue, label: "Entraîneurs et bénévoles", icon: User },
  { value: "formations" as TabValue, label: "Formations", icon: GraduationCap },
];

const Club = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : "historique";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const { data: encadrement = [], isLoading: encadrementLoading } = useEncadrementPublic();
  const entraineursData = encadrement.filter((p) => p.type === "entraineur");
  const bureau = encadrement.filter((p) => p.type === "bureau");
  const responsablesPoles = encadrement.filter((p) => p.type === "pole");

  const { get } = useSiteContent();
  const valeurs = get<ValeurItem[]>("club.valeurs", FALLBACK_VALEURS);
  const timeline = get<HistoriqueItem[]>("club.historique", FALLBACK_HISTORIQUE);
  const texteEntraineurs = get<string>("club.texte_entraineurs", FALLBACK_TEXTE_ENTRAINEURS);
  const texteBenevoles = get<string>("club.texte_benevoles", FALLBACK_TEXTE_BENEVOLES);
  const texteEcoleArbitrage = get<string>("club.texte_ecole_arbitrage", FALLBACK_TEXTE_ECOLE_ARBITRAGE);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (VALID_TABS.includes(t as TabValue)) setActiveTab(t as TabValue);
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as TabValue);
    setSearchParams({ tab: val });
  };

  return (
    <>
      <SEO
        title="Le Club"
        description="Découvrez l'histoire, les valeurs et l'équipe du Val d'Yerres Handball, club fondé il y a 23 ans en Essonne. 245 licenciés, 10 équipes."
        canonical="/club"
        breadcrumb={[
          { name: "Accueil", url: "/" },
          { name: "Le Club", url: "/club" },
        ]}
      />

      {/* Page Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[450px] h-[450px] bg-orange-600/12 top-[-120px] right-[-100px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[300px] h-[300px] bg-red-900/10 bottom-[-80px] left-[-60px]" style={{ animationDuration: "18s", animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Le <span className="gradient-text">Club</span>
            </h1>
            <p className="text-white/45 text-lg max-w-lg leading-relaxed mx-auto">
              Histoire, équipe dirigeante, entraîneurs et bénévoles du Val d'Yerres Handball.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container-narrow px-4 md:px-6">
          {/* Premium Tab Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-1 p-1.5 rounded-2xl mb-10"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {tabItems.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleTabChange(value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-bold transition-all duration-300 grow basis-[calc(50%-4px)] sm:flex-1 justify-center cursor-pointer ${
                  activeTab === value
                    ? "text-white shadow-lg"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                style={activeTab === value ? { background: "var(--gradient-accent)" } : {}}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">

            {/* ─── HISTORIQUE ─── */}
            {activeTab === "historique" && (
              <motion.div
                key="historique"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="max-w-3xl">
                  <p className="text-white/50 text-lg leading-relaxed mb-12 max-w-2xl">
                    Fondé il y a bientôt 23 ans, le Val d'Yerres Handball rassemble 245 licenciés répartis dans 10 équipes, du BabyHand aux seniors. Notre mission reste inchangée : offrir à chacun la possibilité de pratiquer le handball dans les meilleures conditions, dans un esprit de convivialité, d'exigence sportive et de respect mutuel.
                  </p>

                  {/* Timeline */}
                  <div className="relative mb-14">
                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-orange-500/50 via-orange-500/20 to-transparent" />
                    <div className="space-y-8">
                      {timeline.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-6 items-start"
                        >
                          <div
                            className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-display font-black text-xs z-10"
                            style={{ background: "var(--gradient-accent)" }}
                          >
                            {i + 1}
                          </div>
                          <div className="pt-1.5">
                            <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider">{item.annee}</span>
                            <h3 className="font-display font-bold text-white text-lg mt-0.5 mb-1">{item.titre}</h3>
                            <p className="text-white/45 text-sm leading-relaxed">{item.texte}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Citation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-premium rounded-2xl p-8 mb-12 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: "var(--gradient-accent)" }} />
                    <p className="font-display font-black text-2xl text-white italic pl-4">
                      "Seul on va plus vite, ensemble on va plus loin"
                    </p>
                  </motion.div>

                  {/* Valeurs */}
                  <h3 className="font-display font-black text-2xl text-white mb-4">Nos valeurs</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-3">
                    Au-delà de la performance, le Val d'Yerres Handball cultive des valeurs fortes : respect, plaisir, dépassement de soi, et convivialité. Chaque joueur et joueuse, quel que soit son âge ou son niveau, trouve sa place et contribue à l'âme du club.
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    Sur le terrain comme en dehors, le Val d'Yerres Handball est une grande famille où la passion du handball se vit intensément.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {valeurs.map((v, i) => {
                      const style = VALEUR_STYLES[i % VALEUR_STYLES.length];
                      const Icon = style.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="glass-premium rounded-2xl p-6 flex items-start gap-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={20} className={style.accent} />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white mb-1">{v.titre}</h4>
                            <p className="text-sm text-white/45 leading-relaxed">{v.texte}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── L'ORGANISATION ─── */}
            {activeTab === "bureau" && (
              <motion.div
                key="bureau"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-10">

                  {/* ── Le Bureau ── */}
                  <div>
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-2xl text-white mb-2">Le Bureau</h3>
                      <p className="text-white/40 text-sm">Bénévoles élus lors de l'assemblée générale annuelle.</p>
                    </div>
                    {encadrementLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-36 rounded-2xl bg-white/[0.04]" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {bureau.map((person, i) => (
                          <motion.div
                            key={person.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="glass-premium rounded-2xl p-6 flex flex-col items-center text-center border border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300"
                          >
                            {person.photo_url ? (
                              <img
                                src={person.photo_url}
                                alt={person.prenom ?? ""}
                                className="w-14 h-14 rounded-2xl mb-4 object-cover"
                                loading="lazy"
                                width={56}
                                height={56}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl mb-4 bg-white/[0.05] flex items-center justify-center">
                                <User size={24} className="text-white/20" />
                              </div>
                            )}
                            {person.prenom && (
                              <p className="font-display font-bold text-white text-sm mb-1">{person.prenom}</p>
                            )}
                            <span className="eyebrow text-[10px]">{person.role}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Responsables de Pôles ── */}
                  <div>
                    <div className="text-center mb-8">
                      <h3 className="font-display font-black text-2xl text-white mb-2">Responsables de Pôles</h3>
                    </div>
                    {encadrementLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-sm mx-auto sm:max-w-none">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-32 rounded-2xl bg-white/[0.04]" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-sm mx-auto sm:max-w-none">
                        {responsablesPoles.map((person, i) => (
                          <motion.div
                            key={person.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="glass-premium rounded-2xl p-6 flex flex-col items-center text-center border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300"
                          >
                            {person.photo_url ? (
                              <img
                                src={person.photo_url}
                                alt={person.prenom ?? ""}
                                className="w-14 h-14 rounded-2xl mb-4 object-cover"
                                loading="lazy"
                                width={56}
                                height={56}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl mb-4 bg-white/[0.05] flex items-center justify-center">
                                <User size={24} className="text-white/20" />
                              </div>
                            )}
                            {person.prenom && (
                              <p className="font-display font-bold text-white text-sm mb-1">{person.prenom}</p>
                            )}
                            <span className="eyebrow text-[10px]">{person.role}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CA note */}
                  <p className="text-center text-white/40 text-sm leading-relaxed max-w-xl mx-auto">
                    Le conseil d'administration est composé du bureau, des responsables de pôles et des{" "}
                    <Link
                      to="/club?tab=entraineurs"
                      onClick={() => handleTabChange("entraineurs")}
                      className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                    >
                      entraîneurs
                    </Link>.
                  </p>

                </div>
              </motion.div>
            )}

            {/* ─── ENTRAINEURS ─── */}
            {activeTab === "entraineurs" && (
              <motion.div
                key="entraineurs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="max-w-4xl">
                  <p className="text-white/45 text-base leading-relaxed mb-10 max-w-2xl">
                    {texteEntraineurs}
                  </p>

                  <h3 className="font-display font-bold text-base text-white mb-5 flex items-center gap-3">
                    <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-accent)" }} />
                    Entraîneurs
                  </h3>
                  {encadrementLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
                      {entraineursData.map((person, i) => (
                        <motion.div
                          key={person.id}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="glass-premium rounded-2xl p-5 flex flex-col items-center text-center border border-white/[0.06] hover:border-orange-500/20 transition-all duration-300"
                        >
                          {person.photo_url ? (
                            <img
                              src={person.photo_url}
                              alt={person.prenom ?? ""}
                              className="w-12 h-12 rounded-xl mb-3 object-cover"
                              loading="lazy"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl mb-3 bg-white/[0.05] flex items-center justify-center">
                              <User size={20} className="text-white/20" />
                            </div>
                          )}
                          {person.prenom && (
                            <p className="font-display font-bold text-white text-sm">{person.prenom}</p>
                          )}
                          <p className="text-[11px] text-white/40 mt-1 leading-tight">{(person.categories ?? []).join(" / ")}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <h3 className="font-display font-bold text-base text-white mb-5 flex items-center gap-3">
                    <span className="w-1 h-5 rounded-full bg-emerald-500 shrink-0" />
                    Bénévoles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      { src: "/images/HandFLUO.jpeg", alt: "Hand Fluo" },
                      { src: "/images/HANDYHAND.jpeg", alt: "Handy Hand" },
                      { src: "/images/MArch%C3%A9NOEL.jpeg", alt: "Marché de Noël" },
                    ].map((photo, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-2xl overflow-hidden border border-white/[0.06] aspect-video"
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="glass-premium rounded-2xl p-8 border border-white/[0.06] space-y-4 text-white/45 leading-relaxed text-sm">
                    {texteBenevoles.split("\n\n").map((paragraphe, i) => (
                      <p key={i}>{paragraphe}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── FORMATIONS ─── */}
            {activeTab === "formations" && (
              <motion.div
                key="formations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="max-w-3xl space-y-6">
                  {formations.map((f, i) => {
                    const Icon = f.icon;
                    const content = f.title === "École d'arbitrage" ? texteEcoleArbitrage : f.content;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-premium rounded-2xl p-8 border ${f.border}`}
                      >
                        <div className="flex items-center gap-4 mb-5">
                          <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={24} className={f.accent} />
                          </div>
                          <h3 className="font-display font-black text-xl text-white">{f.title}</h3>
                        </div>
                        <p className="text-white/45 leading-relaxed text-sm">{content}</p>
                        {"photo" in f && f.photo && (
                          <img
                            src={f.photo as string}
                            alt={f.title}
                            className="mt-6 w-full rounded-xl object-cover"
                            style={{ height: "auto" }}
                            loading="lazy"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default Club;

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { bureau } from "@/data/bureau";
import { entraineurs as entraineursData } from "@/data/entraineurs";
import {
  Clock, Users, User, GraduationCap,
  Award, ClipboardList, BookOpen,
  Heart, Shield, Users2,
} from "lucide-react";


const valeurs = [
  { icon: Heart, title: "Solidarité", text: "Un club où chacun se sent chez soi, dans le respect et la bonne humeur.", accent: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Shield, title: "Respect", text: "Respecter les autres, les arbitres et les adversaires — valeur fondamentale du handball.", accent: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Users2, title: "Esprit d'équipe", text: "Le collectif avant tout. Sur le terrain comme en dehors.", accent: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: GraduationCap, title: "Formation", text: "Accompagner les jeunes joueurs vers l'excellence sportive et humaine.", accent: "text-violet-400", bg: "bg-violet-500/10" },
];

const timeline = [
  { year: "~2003", title: "Fondation du club", desc: "Création du Val d'Yerres Handball dans la vallée de l'Yerres. Les premières équipes voient le jour avec une poignée de passionnés." },
  { year: "~2010", title: "Développement du secteur jeunes", desc: "Naissance de l'école de handball. Les catégories Baby Hand, -7 et -9 se structurent. La formation devient une priorité." },
  { year: "~2015", title: "Croissance et compétitions", desc: "Le club atteint 10 équipes en compétition. Les seniors s'imposent en championnat départemental." },
  { year: "Aujourd'hui", title: "245 licenciés, 10 équipes", desc: "Plus qu'un club, une famille. Une communauté engagée, des bénévoles dévoués, et la même passion intacte depuis plus de 20 ans." },
];

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
  },
  {
    icon: BookOpen,
    title: "École d'arbitrage",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    content: "Notre école d'arbitrage accompagne les jeunes qui souhaitent s'initier à l'arbitrage dans un cadre bienveillant et structuré. Encadrés par des arbitres expérimentés, ils apprennent à maîtriser les règles du jeu, à gérer une rencontre et à développer leur autorité naturelle. Arbitrer, c'est une autre façon d'aimer le handball.",
  },
];

const VALID_TABS = ["historique", "bureau", "entraineurs", "formations"] as const;
type TabValue = (typeof VALID_TABS)[number];

const tabItems = [
  { value: "historique" as TabValue, label: "Historique", icon: Clock },
  { value: "bureau" as TabValue, label: "L'Organisation", icon: Users },
  { value: "entraineurs" as TabValue, label: "Entraîneurs", icon: User },
  { value: "formations" as TabValue, label: "Formations", icon: GraduationCap },
];

const Club = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : "historique";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

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
              Histoire, bureau dirigeant, entraîneurs et bénévoles du Val d'Yerres Handball.
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
                            <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider">{item.year}</span>
                            <h3 className="font-display font-bold text-white text-lg mt-0.5 mb-1">{item.title}</h3>
                            <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
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
                    Au-delà de la performance, le Val d'Yerres Handball cultive des valeurs fortes : solidarité, respect, et esprit d'équipe. Chaque joueur et joueuse, quel que soit son âge ou son niveau, trouve sa place et contribue à l'âme du club.
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    Sur le terrain comme en dehors, le Val d'Yerres Handball est une grande famille où la passion du handball se vit intensément.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {valeurs.map((v, i) => {
                      const Icon = v.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="glass-premium rounded-2xl p-6 flex items-start gap-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center shrink-0`}>
                            <Icon size={20} className={v.accent} />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white mb-1">{v.title}</h4>
                            <p className="text-sm text-white/45 leading-relaxed">{v.text}</p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {bureau.map((person, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className="glass-premium rounded-2xl p-6 flex flex-col items-center text-center border border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300"
                        >
                          <img
                            src={person.avatarUrl}
                            alt={person.role}
                            className="w-14 h-14 rounded-2xl mb-4 object-cover"
                            loading="lazy"
                            width={56}
                            height={56}
                          />
                          <span className="eyebrow text-[10px]">{person.role}</span>
                        </motion.div>
                      ))}
                    </div>
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
                    Nos entraîneurs et bénévoles sont le cœur battant du club. Merci à tous pour leur engagement au quotidien.
                  </p>

                  <h3 className="font-display font-bold text-base text-white mb-5 flex items-center gap-3">
                    <span className="w-1 h-5 rounded-full shrink-0" style={{ background: "var(--gradient-accent)" }} />
                    Entraîneurs
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
                    {entraineursData.map((person, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="glass-premium rounded-2xl p-5 flex flex-col items-center text-center border border-white/[0.06] hover:border-orange-500/20 transition-all duration-300"
                      >
                        <img
                          src={person.avatarUrl}
                          alt={person.prenom}
                          className="w-12 h-12 rounded-xl mb-3 object-cover"
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                        <p className="font-display font-bold text-white text-sm">{person.prenom}</p>
                        <p className="text-[11px] text-white/40 mt-1 leading-tight">{person.role}</p>
                      </motion.div>
                    ))}
                  </div>

                  <h3 className="font-display font-bold text-base text-white mb-5 flex items-center gap-3">
                    <span className="w-1 h-5 rounded-full bg-emerald-500 shrink-0" />
                    Bénévoles
                  </h3>
                  <div className="glass-premium rounded-2xl p-8 border border-white/[0.06] space-y-4 text-white/45 leading-relaxed text-sm">
                    <p>
                      Au Val d'Yerres Handball, rien ne serait possible sans l'engagement précieux de nos bénévoles. Qu'ils soient sur le terrain, en coulisses ou derrière un ordinateur, ils font vivre le club au quotidien et permettent à toutes nos équipes de pratiquer leur passion dans les meilleures conditions.
                    </p>
                    <p className="font-display font-bold text-white text-base">Nous avons besoin de vous !</p>
                    <p>
                      Toutes les bonnes volontés sont les bienvenues : entraînement et encadrement, aide administrative, communication et réseaux sociaux, organisation d'événements, logistique, buvette, responsable de salles…
                    </p>
                    <p className="font-medium text-white/60">
                      Intéressé(e) ? Contactez-nous via le site ou par mail. Ensemble, faisons grandir notre club !
                    </p>
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
                        <p className="text-white/45 leading-relaxed text-sm">{f.content}</p>
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

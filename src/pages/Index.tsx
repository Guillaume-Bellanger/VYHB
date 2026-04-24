import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useRef, useEffect, useState } from "react";
import {
  ChevronDown, ChevronRight, ArrowRight,
  Users, Trophy, Clock, Heart,
  Phone, Mail, Megaphone, Zap,
  UserPlus, Home, PartyPopper, Recycle,
} from "lucide-react";
import heroImage from "@/assets/hero-handball.jpg";
import { collectifs } from "@/data/collectifs";


// ─── Animation presets
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.72,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
};

// ─── Animated counter hook
const useCountUp = (target: number, inView: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = Date.now();
    const duration = 1800;
    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [target, inView]);
  return count;
};

// ─── SEO schema
const sportsOrgSchema = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Val d'Yerres Handball",
  alternateName: "VYHB",
  url: "https://www.valdyerreshandball.fr",
  email: "vyhandball@gmail.com",
  telephone: "+33675264358",
  sport: "Handball",
  foundingDate: "2003",
  identifier: "46183",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Boussy-Saint-Antoine",
    postalCode: "91800",
    addressCountry: "FR",
  },
  areaServed: ["Boussy-Saint-Antoine", "Quincy-sous-Sénart", "Épinay-sous-Sénart", "Essonne"],
};

// ─── Data
const news = [
  {
    slug: "recrutement",
    tag: "Recrutement",
    tagClass: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
    accent: "bg-orange-500",
    hoverGlow: "group-hover:bg-orange-500/6",
    Icon: UserPlus,
    title: "Recrutement ouvert — Saison 2026/2027",
    desc: "Le club recrute ! Venez essayer gratuitement lors de nos séances d'essai. Toutes les catégories sont ouvertes à de nouveaux licenciés.",
    date: "Saison 2026/2027",
  },
  {
    slug: "portes-ouvertes",
    tag: "Événement",
    tagClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    accent: "bg-emerald-500",
    hoverGlow: "group-hover:bg-emerald-500/5",
    Icon: Home,
    title: "Portes ouvertes — Mai 2026",
    desc: "Portes ouvertes du 01/05 au 31/05/2026. Venez découvrir notre club et essayer le handball gratuitement !",
    date: "01–31 Mai 2026",
  },
  {
    slug: "assemblee-generale",
    tag: "Événement",
    tagClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    accent: "bg-emerald-500",
    hoverGlow: "group-hover:bg-emerald-500/5",
    Icon: PartyPopper,
    title: "Assemblée générale annuelle",
    desc: "L'AG du club se tiendra en juin 2026. Tous les licenciés et parents sont invités à participer.",
    date: "Juin 2026",
  },
  {
    slug: "collecte-bouchons",
    tag: "Info",
    tagClass: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
    accent: "bg-blue-400",
    hoverGlow: "group-hover:bg-blue-500/5",
    Icon: Recycle,
    title: "Collecte de bouchons plastiques",
    desc: "Participez à notre collecte solidaire. Apportez vos bouchons plastiques lors des entraînements !",
    date: "Toute la saison",
  },
];

const matchsDomicile = [
  { date: "03/05", heure: "14h00", equipe: "Seniors M", adversaire: "JS Corbeil", salle: "Jean Moulin", isNext: true },
  { date: "10/05", heure: "10h30", equipe: "-13F", adversaire: "HBC Yerres", salle: "Boussy" },
  { date: "17/05", heure: "15h00", equipe: "Seniors F", adversaire: "Ste-Geneviève HB", salle: "Jean Moulin" },
  { date: "24/05", heure: "11h00", equipe: "-15/-18M", adversaire: "Draveil HB", salle: "Paul Bert" },
  { date: "31/05", heure: "09h30", equipe: "-11M", adversaire: "HC Brunoy", salle: "Boussy" },
];

const statsData = [
  { value: 245, label: "Licenciés", icon: Users, suffix: "" },
  { value: 10,  label: "Équipes",   icon: Trophy, suffix: "" },
  { value: 23,  label: "Ans d'histoire", icon: Clock,  suffix: "" },
  { value: 45,  label: "Bénévoles", icon: Heart,  suffix: "+" },
];

// ─── Stat card with animated counter
const StatCard = ({ stat, delay }: { stat: typeof statsData[0]; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(stat.value, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="card-sport p-6 text-center group cursor-default"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors duration-300">
        <stat.icon className="text-accent" size={20} />
      </div>
      <div className="font-display font-black text-3xl md:text-4xl text-foreground mb-1 tabular-nums">
        {count}{stat.suffix}
      </div>
      <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
        {stat.label}
      </div>
    </motion.div>
  );
};

// ─── Section header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6 }}
    className="text-center mb-10 md:mb-14"
  >
    <h2 className="font-display font-black text-3xl md:text-4xl text-foreground mb-3">
      {title}
    </h2>
    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">{subtitle}</p>
  </motion.div>
);

// ─── Main page
const Index = () => {
  const tickerText =
    "RECRUTEMENT OUVERT 2026/2027  •  PORTES OUVERTES MAI 2026  •  REJOIGNEZ LA FAMILLE  •  ESSAI GRATUIT  •  VAL D'YERRES HANDBALL  •  ";

  return (
    <>
      <SEO
        title={null}
        description="Club de handball à Boussy-Saint-Antoine, Quincy-sous-Sénart et Épinay-sous-Sénart. 245 licenciés, 10 équipes du BabyHand aux Seniors. Inscriptions ouvertes saison 2026/2027."
        canonical="/"
        schema={sportsOrgSchema}
      />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <img
          src={heroImage}
          alt="Match de handball en action"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="hero-orb w-[700px] h-[700px] -top-40 -right-32 bg-orange-600/18" style={{ animationDuration: "13s" }} />
        <div className="hero-orb w-[450px] h-[450px] bottom-0 left-[8%] bg-red-700/14" style={{ animationDelay: "4s", animationDuration: "9s" }} />
        <div className="hero-orb w-[320px] h-[320px] top-1/3 right-1/3 bg-orange-400/10" style={{ animationDelay: "7s", animationDuration: "16s" }} />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="relative container-narrow px-4 md:px-6 py-36 md:py-0 w-full">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl md:mx-auto md:text-center">
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-[11px] font-display font-bold uppercase tracking-[0.2em] border"
              style={{
                background: "hsl(18 100% 55% / 0.1)",
                borderColor: "hsl(18 100% 55% / 0.22)",
                color: "hsl(18 100% 68%)",
              }}
            >
              <Zap size={11} className="fill-current" />
              Saison 2026/2027 — Inscriptions ouvertes
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-display font-black leading-[0.93] tracking-tight text-slate-200 mb-7"
              style={{ fontSize: "clamp(3rem, 8.5vw, 6rem)" }}
            >
              Bienvenue au{" "}
              <span className="gradient-text">Val d'Yerres</span>
              <br />
              <span className="text-white/75">Handball</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} className="text-lg text-white/55 max-w-xl mb-10 leading-relaxed md:mx-auto">
              Un club convivial et ambitieux. 245 licenciés, 10 équipes, 23 ans de passion — du baby hand aux seniors.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 md:justify-center">
              <Link to="/inscriptions" className="btn-primary text-sm py-4 px-8">
                Rejoindre le club <ChevronRight size={16} />
              </Link>
              <Link to="/collectifs" className="btn-secondary text-sm py-4 px-8">
                Nos collectifs
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-scroll-bounce cursor-default"
        >
          <span className="text-[10px] text-white/25 uppercase tracking-[0.22em] font-display font-bold">Défiler</span>
          <ChevronDown size={16} className="text-white/25" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TICKER MARQUEE
      ══════════════════════════════════════════ */}
      <div
        className="overflow-hidden border-y border-white/[0.05] py-3"
        style={{ background: "hsl(0 0% 0% / 0.65)" }}
        aria-hidden="true"
      >
        <div className="flex">
          <span className="animate-ticker text-sm font-display font-bold uppercase tracking-[0.18em] text-orange-400 whitespace-nowrap">
            {tickerText.repeat(6)}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ACTUALITÉS — BENTO
      ══════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeader
            title="Actualités"
            subtitle="Recrutements, événements et infos — Saison 2026/2027"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-full"
            >
              <Link
                to={`/evenements#${news[0].slug}`}
                className="card-sport relative overflow-hidden group flex flex-col justify-between min-h-[240px] h-full p-7 block cursor-pointer hover:border-orange-500/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none ${news[0].hoverGlow}`} />
                <div className="absolute left-0 inset-y-6 w-[3px] rounded-r-full bg-orange-500" />
                <div className="pl-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-display font-bold uppercase ${news[0].tagClass}`}>
                      {news[0].tag}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{news[0].date}</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-foreground mb-2 leading-tight group-hover:text-orange-400 transition-colors">
                    {news[0].title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{news[0].desc}</p>
                </div>
                <div className="mt-6 pl-4 inline-flex items-center gap-2 text-xs font-display font-bold text-accent uppercase tracking-wider group-hover:gap-3 transition-all duration-200">
                  Voir les détails <ArrowRight size={13} />
                </div>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              {news.slice(1).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.08, duration: 0.5 }}
                >
                  <Link
                    to={`/evenements#${item.slug}`}
                    className="card-sport relative overflow-hidden group flex items-start gap-4 p-5 block cursor-pointer hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none ${item.hoverGlow}`} />
                    <div className={`absolute left-0 inset-y-4 w-[3px] rounded-r-full ${item.accent}`} />
                    <div className="pl-3 flex-1 relative">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-display font-bold uppercase ${item.tagClass}`}>
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-foreground mb-1 leading-snug group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                    <ArrowRight size={13} className="text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/evenements" className="btn-secondary gap-2 text-xs">
              Voir tous les événements <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
    INSTAGRAM FEED — PREMIUM
══════════════════════════════════════════ */}
<section className="section-padding bg-muted/20 relative overflow-hidden">
  
  {/* Glow background */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="hero-orb w-[500px] h-[500px] -top-32 -left-32 bg-pink-500/10" />
    <div
      className="hero-orb w-[400px] h-[400px] bottom-[-120px] right-[-80px] bg-orange-500/10"
      style={{ animationDelay: "4s" }}
    />
  </div>

  <div className="container-narrow relative">
    
    {/* HEADER */}
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-pink-500/15 flex items-center justify-center border border-pink-500/20">
          <span className="text-lg">📸</span>
        </div>
        <span className="font-display font-bold text-sm text-muted-foreground tracking-wider uppercase">
          Instagram
        </span>
      </div>

      <h2 className="font-display font-black text-3xl md:text-4xl text-foreground mb-3">
        Suivez-nous
      </h2>

      <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
        Plongez dans la vie du club, les matchs et les coulisses du Val d’Yerres Handball.
      </p>
    </motion.div>

    {/* FEED CARD */}
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative group"
    >
      <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-xl p-4 md:p-6 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 z-10" />

        <a
          href="https://www.instagram.com/VOTRE_COMPTE_INSTAGRAM/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {/* @ts-ignore */}
          <behold-widget feed-id="ouzZDqEFzSX5MTtM8qc8" />
        </a>

        {/* CTA hover */}
        <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition duration-500">
          <p className="text-white text-sm font-display font-bold flex items-center gap-2">
            Voir sur Instagram <ArrowRight size={14} />
          </p>
        </div>
      </div>
    </motion.div>

    {/* CTA BUTTON */}
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-10 text-center"
    >
      <a
        href="https://www.instagram.com/VOTRE_COMPTE_INSTAGRAM/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary inline-flex items-center gap-2 text-xs"
      >
        Suivre le club <ArrowRight size={13} />
      </a>
    </motion.div>

  </div>
</section>

      {/* ══════════════════════════════════════════
          HISTOIRE + STATS
      ══════════════════════════════════════════ */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="eyebrow mb-5 inline-flex">Notre histoire</span>
              <h2
                className="font-display font-black text-foreground mb-6 leading-tight mt-4"
                style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
              >
                Plus qu'un club,
                <br />
                <span className="gradient-text">une famille</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fondé il y a bientôt 23 ans, le Val d'Yerres Handball rassemble 245 licenciés répartis dans 10 équipes, du Baby Hand aux seniors.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Que vous soyez débutant ou confirmé, enfant ou adulte, compétiteur ou joueur loisir : il y a toujours une place pour vous chez nous.
              </p>
              <Link to="/club" className="btn-primary">
                Découvrir le club <ArrowRight size={15} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {statsData.map((stat, i) => (
                <StatCard key={i} stat={stat} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COLLECTIFS
      ══════════════════════════════════════════ */}
      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeader
            title="Nos collectifs"
            subtitle="Du baby hand aux seniors — trouvez votre catégorie"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collectifs.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.045, duration: 0.45 }}
              >
                <Link
                  to={`/collectifs/${c.slug}`}
                  className="card-sport px-5 py-4 flex items-center gap-4 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-300">
                    <span className="text-xl leading-none" role="img" aria-label={c.name}>{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-foreground group-hover:text-accent transition-colors duration-200 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.age}</div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MATCHS DOMICILE
      ══════════════════════════════════════════ */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <SectionHeader
            title="Matchs à venir à domicile"
            subtitle="Venez encourager nos équipes !"
          />

          <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60" style={{ background: "hsl(var(--muted) / 0.5)" }}>
                  {["Date", "Heure", "Équipe", "Adversaire", "Salle"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-display font-bold text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matchsDomicile.map((m, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className={`border-t border-border/40 transition-colors duration-200 hover:bg-accent/[0.04] ${
                      m.isNext ? "bg-accent/[0.06]" : i % 2 === 0 ? "bg-card/40" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-display font-bold text-foreground whitespace-nowrap">
                      {m.isNext && <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 mb-0.5 animate-pulse" />}
                      {m.date}
                    </td>
                    <td className="px-5 py-4 font-display font-bold text-accent whitespace-nowrap">{m.heure}</td>
                    <td className="px-5 py-4 text-foreground font-medium">{m.equipe}</td>
                    <td className="px-5 py-4 text-muted-foreground">vs {m.adversaire}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{m.salle}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {matchsDomicile.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className={`card-sport p-4 ${m.isNext ? "border-orange-500/35 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    {m.isNext && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                    <span className="font-display font-black text-foreground">{m.date}</span>
                  </div>
                  <span className="score-badge text-sm !px-3 !py-1">{m.heure}</span>
                </div>
                <div className="font-display font-bold text-sm text-foreground">{m.equipe}</div>
                <div className="text-sm text-muted-foreground">vs {m.adversaire}</div>
                <div className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <span className="text-[10px]">📍</span> {m.salle}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/matchs" className="btn-secondary gap-2 text-xs">
              Calendrier complet &amp; classements <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA IMMERSIF
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 md:py-44">
        <div className="absolute inset-0" style={{ background: "var(--gradient-dark)" }} />
        <div className="hero-orb absolute w-[550px] h-[550px] -left-28 top-1/2 -translate-y-1/2 bg-orange-600/14" style={{ animationDuration: "14s" }} />
        <div className="hero-orb absolute w-[350px] h-[350px] right-8 bottom-[-60px] bg-red-700/10" style={{ animationDelay: "5s", animationDuration: "11s" }} />

        <div className="relative container-narrow text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 mb-8 mx-auto">
              <Megaphone className="text-accent" size={26} />
            </div>

            <h2
              className="font-display font-black text-foreground mb-6 leading-tight"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)" }}
            >
              Prêt à rejoindre
              <br />
              <span className="gradient-text">l'aventure ?</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-12 leading-relaxed">
              Inscriptions ouvertes pour la saison 2026/2027. Essai gratuit pour tous les nouveaux licenciés.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/inscriptions" className="btn-primary text-sm py-4 px-10">
                S'inscrire maintenant <ChevronRight size={17} />
              </Link>
              <Link to="/contact" className="btn-secondary text-sm py-4 px-10">
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT STRIP
      ══════════════════════════════════════════ */}
      <div className="border-t border-border/40 bg-card/30">
        <div className="container-narrow px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14">
            <a href="tel:+33675264358" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 group cursor-pointer text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300 shrink-0">
                <Phone className="text-accent" size={17} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Président</p>
                <p className="font-display font-bold text-sm text-foreground group-hover:text-accent transition-colors duration-200">
                  06 75 26 43 58
                </p>
              </div>
            </a>

            <div className="hidden sm:block w-px h-10 bg-border/50" />

            <a href="mailto:vyhandball@gmail.com" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 group cursor-pointer text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300 shrink-0">
                <Mail className="text-accent" size={17} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Email</p>
                <p className="font-display font-bold text-sm text-foreground group-hover:text-accent transition-colors duration-200">
                  vyhandball@gmail.com
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;

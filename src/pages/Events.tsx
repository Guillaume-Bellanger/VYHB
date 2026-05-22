import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserPlus, Home, Trophy, Info, Recycle,
  CalendarDays, MapPin, ArrowRight, ExternalLink,
  Clock,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EvenementCategorie = "recrutement" | "evenement" | "tournoi" | "info" | "autre";

interface Evenement {
  id: string;
  titre: string;
  categorie: EvenementCategorie;
  date_debut: string;
  date_fin: string | null;
  lieu: string | null;
  description: string;
  photo_url: string | null;
  lien_cta: string | null;
  label_cta: string | null;
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIE_CONFIG: Record<EvenementCategorie, {
  tag: string;
  tagClass: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
  border: string;
  gradientBar: string;
}> = {
  recrutement: {
    tag: "Recrutement",
    tagClass: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
    icon: UserPlus,
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    gradientBar: "var(--gradient-accent)",
  },
  evenement: {
    tag: "Événement",
    tagClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    icon: Home,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    gradientBar: "linear-gradient(135deg, hsl(152 70% 45%), hsl(160 65% 40%))",
  },
  tournoi: {
    tag: "Tournoi",
    tagClass: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
    icon: Trophy,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    gradientBar: "linear-gradient(135deg, hsl(215 80% 55%), hsl(225 75% 50%))",
  },
  info: {
    tag: "Info",
    tagClass: "bg-white/10 text-white/50 border border-white/15",
    icon: Info,
    accent: "text-white/50",
    bg: "bg-white/[0.06]",
    border: "border-white/[0.08]",
    gradientBar: "linear-gradient(135deg, hsl(0 0% 55%), hsl(0 0% 45%))",
  },
  autre: {
    tag: "Autre",
    tagClass: "bg-violet-500/15 text-violet-400 border border-violet-500/25",
    icon: Recycle,
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    gradientBar: "linear-gradient(135deg, hsl(265 75% 55%), hsl(280 70% 50%))",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(debut: string, fin: string | null): string {
  const d = new Date(debut);
  if (isNaN(d.getTime())) return debut;
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  if (!fin || debut === fin) return fmt(debut);
  return `${fmt(debut)} – ${fmt(fin)}`;
}

function isExternal(url: string | null): boolean {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
}

// ── Fallback data (statique si Supabase indisponible) ─────────────────────────

const FALLBACK_EVENTS: Evenement[] = [
  {
    id: "recrutement",
    titre: "Recrutement ouvert — Saison 2026/2027",
    categorie: "recrutement",
    date_debut: "Dès maintenant — Saison 2026/2027",
    date_fin: null,
    lieu: "Gymnase Municipal, Boussy-Saint-Antoine",
    photo_url: null,
    description:
      "Le Val d'Yerres Handball ouvre officiellement les inscriptions pour la saison 2026/2027 ! Toutes les catégories sont ouvertes à de nouveaux licenciés, du Baby Hand (dès 5 ans) jusqu'aux Seniors et à l'équipe Loisirs.\n\nVous souhaitez découvrir le handball ou reprendre après une pause ? Profitez de nos 2 séances d'essai gratuites, sans engagement. C'est l'occasion parfaite pour voir si le club vous convient avant de vous inscrire officiellement.\n\nLe club propose un cadre bienveillant, des entraîneurs diplômés et une atmosphère familiale unique. Que vous soyez compétiteur ou joueur loisir, débutant ou confirmé, il y a forcément une place pour vous chez nous.",
    lien_cta: "/inscriptions",
    label_cta: "S'inscrire maintenant",
  },
  {
    id: "portes-ouvertes",
    titre: "Portes ouvertes — Mai 2026",
    categorie: "evenement",
    date_debut: "01 Mai – 31 Mai 2026 · Tous les week-ends",
    date_fin: null,
    lieu: "Gymnase Municipal, Boussy-Saint-Antoine",
    photo_url: null,
    description:
      "Tout au long du mois de mai 2026, le Val d'Yerres Handball vous ouvre grand les portes de son gymnase ! C'est l'occasion idéale pour venir découvrir l'univers du handball en famille, essayer quelques gestes techniques avec nos entraîneurs, et rencontrer les joueurs et joueuses du club.\n\nCes journées portes ouvertes s'adressent à tous : enfants dès 5 ans, adolescents, adultes débutants ou anciens joueurs qui souhaitent reprendre une activité sportive. Pas besoin de matériel ni de licence — venez simplement avec vos chaussures de sport !\n\nDes créneaux d'initiation sont organisés chaque samedi matin pour les plus jeunes (5–12 ans) et chaque vendredi soir pour les adultes. L'entrée est gratuite et ouverte à tous.",
    lien_cta: "/contact",
    label_cta: "Y participer — C'est gratuit",
  },
  {
    id: "assemblee-generale",
    titre: "Assemblée Générale Annuelle 2026",
    categorie: "info",
    date_debut: "Juin 2026 — Date exacte à confirmer",
    date_fin: null,
    lieu: "Gymnase Municipal, Boussy-Saint-Antoine",
    photo_url: null,
    description:
      "L'Assemblée Générale Ordinaire du Val d'Yerres Handball se tiendra en juin 2026. Cet événement annuel incontournable réunit l'ensemble des membres du club — joueurs, parents, entraîneurs et bénévoles — pour dresser le bilan de la saison écoulée et préparer la suivante.\n\nAu programme : présentation du rapport moral du Président, rapport financier de la Trésorière, bilan sportif de chaque équipe, et vote des nouvelles orientations pour la saison 2026/2027. C'est également l'occasion d'élire les membres du Conseil d'Administration si des postes sont à renouveler.\n\nTous les licenciés et parents de licenciés sont invités à y participer. La présence de chacun est précieuse pour que la vie associative du club soit le reflet de sa communauté. Un pot de clôture de saison sera organisé à l'issue de l'assemblée !",
    lien_cta: "/contact",
    label_cta: "Confirmer ma présence",
  },
  {
    id: "collecte-bouchons",
    titre: "Collecte de bouchons plastiques",
    categorie: "autre",
    date_debut: "Toute la saison 2026/2027",
    date_fin: null,
    lieu: "À apporter lors des entraînements",
    photo_url: null,
    description:
      "Le Val d'Yerres Handball s'engage pour une cause solidaire : la collecte de bouchons plastiques ! Tout au long de la saison, le club collecte des bouchons de bouteilles en plastique afin de les reverser à des associations caritatives qui les recycleront pour financer du matériel médical ou sportif pour des personnes en situation de handicap.\n\nBouchons de bouteilles d'eau, de jus de fruits, de lait, de produits ménagers… tous les bouchons en plastique sont bons à collecter ! Apportez-les lors de vos entraînements ou lors des matchs à domicile. Des sacs de collecte sont mis à votre disposition dans les vestiaires.\n\nPetits gestes, grands impacts : en participant à cette collecte, vous contribuez non seulement à valoriser les déchets plastiques, mais également à aider des associations qui œuvrent pour l'autonomie des personnes handicapées.",
    lien_cta: "/contact",
    label_cta: "En savoir plus",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Events = () => {
  const { hash } = useLocation();
  const [events, setEvents] = useState<Evenement[]>(FALLBACK_EVENTS);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) return;

    const today = new Date().toISOString().split("T")[0];
    fetch(
      `${url}/rest/v1/evenements?actif=eq.true&or=(expire_le.is.null,expire_le.gte.${today})&order=ordre.asc,date_debut.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Evenement[]) => {
        if (data.length > 0) setEvents(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [hash, events]);

  return (
    <>
      {/* Page Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[420px] h-[420px] bg-emerald-600/10 top-[-100px] right-[-80px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[280px] h-[280px] bg-orange-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "18s", animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Événements <span className="gradient-text">&amp; Actus</span>
            </h1>
            <p className="text-white/45 text-lg max-w-2xl leading-relaxed mx-auto">
              Recrutement, portes ouvertes, assemblée générale et initiatives solidaires — toute la vie du club.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events list */}
      <section className="pb-24">
        <div className="container-narrow px-4 md:px-6 max-w-4xl space-y-6">
          {events.map((ev, i) => {
            const cfg = CATEGORIE_CONFIG[ev.categorie] ?? CATEGORIE_CONFIG.autre;
            const Icon = cfg.icon;
            const paragraphs = ev.description.split("\n\n").filter(Boolean);
            const external = isExternal(ev.lien_cta);

            return (
              <motion.article
                key={ev.id}
                id={ev.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`glass-premium rounded-3xl overflow-hidden border ${cfg.border}`}
                style={{ scrollMarginTop: "5rem" }}
              >
                {/* Colored top bar */}
                <div className="h-1 w-full" style={{ background: cfg.gradientBar }} />

                {/* Photo */}
                {ev.photo_url && (
                  <img
                    src={ev.photo_url}
                    alt={ev.titre}
                    style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                )}

                <div className="p-8 md:p-10">
                  {/* Header */}
                  <div className="flex flex-wrap items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={28} className={cfg.accent} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider mb-2 ${cfg.tagClass}`}>
                        {cfg.tag}
                      </span>
                      <h2 className="font-display font-black text-white text-xl md:text-2xl leading-tight">
                        {ev.titre}
                      </h2>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 mb-7">
                    <div className="flex items-center gap-2 text-sm text-white/40">
                      <CalendarDays size={14} className={cfg.accent} />
                      <span>{formatDate(ev.date_debut, ev.date_fin)}</span>
                    </div>
                    {ev.lieu && (
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <MapPin size={14} className={cfg.accent} />
                        <span>{ev.lieu}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-4 mb-8">
                    {paragraphs.map((p, j) => (
                      <p key={j} className="text-white/50 leading-relaxed text-sm md:text-base">{p}</p>
                    ))}
                  </div>

                  {/* CTA */}
                  {ev.lien_cta && ev.label_cta && (
                    <div className="flex flex-wrap gap-3">
                      {external ? (
                        <a
                          href={ev.lien_cta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary gap-2"
                        >
                          {ev.label_cta}
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        <Link to={ev.lien_cta} className="btn-primary gap-2">
                          {ev.label_cta}
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-10 text-center overflow-hidden border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-orange-600/[0.08] blur-3xl pointer-events-none" />
            <Clock size={28} className="text-orange-400 mx-auto mb-4" />
            <h3 className="font-display font-black text-white text-xl mb-3">
              Un événement à proposer ?
            </h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Tournoi, initiative solidaire ou soirée club — contactez-nous pour en discuter.
            </p>
            <Link to="/contact" className="btn-primary gap-2">
              Nous contacter <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Events;

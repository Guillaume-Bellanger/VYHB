import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CalendarDays, MapPin, Clock, ExternalLink, ArrowRight,
  UserPlus, Home, Trophy, Info, Recycle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EvenementCategorie = "recrutement" | "evenement" | "tournoi" | "info" | "autre";

export interface Evenement {
  id: string;
  titre: string;
  categorie: EvenementCategorie;
  date_debut: string;
  date_fin: string | null;
  heure_debut: string | null;
  heure_fin: string | null;
  lieu: string | null;
  description: string;
  photo_url: string | null;
  photo_url_2: string | null;
  lien_cta: string | null;
  label_cta: string | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

export const CATEGORIE_CONFIG: Record<EvenementCategorie, {
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
    tagClass: "bg-blue-900 text-blue-100 border border-blue-700",
    icon: Info,
    accent: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-700",
    gradientBar: "linear-gradient(135deg, hsl(215 70% 25%), hsl(220 65% 20%))",
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

export function formatDate(debut: string, fin: string | null): string {
  const d = new Date(debut);
  if (isNaN(d.getTime())) return debut;
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  if (!fin || debut === fin) return fmt(debut);
  return `${fmt(debut)} – ${fmt(fin)}`;
}

function formatHeure(h: string): string {
  const [hours, minutes] = h.split(":");
  return minutes === "00" ? `${hours}h` : `${hours}h${minutes}`;
}

function isExternal(url: string | null): boolean {
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EvenementCard({ ev, index = 0 }: { ev: Evenement; index?: number }) {
  const cfg = CATEGORIE_CONFIG[ev.categorie] ?? CATEGORIE_CONFIG.autre;
  const Icon = cfg.icon;
  const external = isExternal(ev.lien_cta);

  return (
    <motion.article
      id={ev.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`glass-premium rounded-3xl overflow-hidden border ${cfg.border}`}
      style={{ scrollMarginTop: "5rem" }}
    >
      {/* Colored top bar */}
      <div className="h-1 w-full" style={{ background: cfg.gradientBar }} />

      {/* Photo(s) */}
      {ev.photo_url && ev.photo_url_2 ? (
        <div className="grid grid-cols-2">
          <img src={ev.photo_url} alt={ev.titre} style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />
          <img src={ev.photo_url_2} alt={ev.titre} style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />
        </div>
      ) : ev.photo_url ? (
        <img src={ev.photo_url} alt={ev.titre} style={{ width: "100%", height: "auto", display: "block" }} loading="lazy" />
      ) : null}

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
          {(ev.heure_debut || ev.heure_fin) && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Clock size={14} className={cfg.accent} />
              <span>
                {ev.heure_debut ? formatHeure(ev.heure_debut) : ""}
                {ev.heure_debut && ev.heure_fin ? " – " : ""}
                {ev.heure_fin ? formatHeure(ev.heure_fin) : ""}
              </span>
            </div>
          )}
          {ev.lieu && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <MapPin size={14} className={cfg.accent} />
              <span>{ev.lieu}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-white/50 leading-relaxed text-sm md:text-base" style={{ whiteSpace: "pre-wrap" }}>
            {ev.description}
          </p>
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
                {ev.label_cta} <ExternalLink size={15} />
              </a>
            ) : (
              <Link to={ev.lien_cta} className="btn-primary gap-2">
                {ev.label_cta} <ArrowRight size={15} />
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight, ArrowRight, Star, Megaphone, Calendar, Users,
  Trophy, Clock, Heart, Phone, Mail, MapPin,
} from "lucide-react";
import heroImage from "@/assets/hero-handball.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const news = [
  {
    tag: "Recrutement",
    tagColor: "bg-accent/15 text-accent",
    icon: "🤾",
    title: "Recrutement ouvert — Saison 2025–2026",
    desc: "Le club recrute sur toutes les catégories ! Seniors, -18, -16, École de Hand… Venez essayer gratuitement.",
    date: "Avril 2026",
  },
  {
    tag: "Événement",
    tagColor: "bg-emerald-500/15 text-emerald-400",
    icon: "🏆",
    title: "Tournoi de printemps — 26 & 27 avril",
    desc: "Grand tournoi inter-clubs au Gymnase Municipal. Venez encourager nos équipes et partager ce week-end festif !",
    date: "26–27 Avr 2026",
  },
  {
    tag: "Événement",
    tagColor: "bg-emerald-500/15 text-emerald-400",
    icon: "🎉",
    title: "Assemblée générale annuelle",
    desc: "L'AG du club se tiendra en juin. Tous les licenciés et parents sont invités à participer.",
    date: "Juin 2026",
  },
  {
    tag: "Info",
    tagColor: "bg-blue-500/15 text-blue-400",
    icon: "📋",
    title: "Nouvelle plateforme d'inscription",
    desc: "Les inscriptions et renouvellements pour la saison 2026–2027 seront accessibles dès septembre.",
    date: "Septembre 2026",
  },
];

const stats = [
  { value: "320+", label: "Licenciés", icon: Users },
  { value: "12", label: "Équipes", icon: Trophy },
  { value: "39", label: "Années d'existence", icon: Clock },
  { value: "45", label: "Bénévoles actifs", icon: Heart },
];

const collectifsList = [
  { name: "Seniors Masculins", icon: "🏆", slug: "seniors-masculins" },
  { name: "Seniors Féminines", icon: "⭐", slug: "seniors-feminines" },
  { name: "Jeunes (-18 / -16)", icon: "🔥", slug: "-18-garcons" },
  { name: "École de Hand", icon: "🤾", slug: "-14-mixte" },
  { name: "Baby Hand", icon: "👶", slug: "baby-hand" },
  { name: "Loisirs Adultes", icon: "🎯", slug: "loisirs-adultes" },
];

const Index = () => {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <img
          src={heroImage}
          alt="Match de handball en action"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative container-narrow px-4 py-32 md:py-0">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-display font-semibold uppercase tracking-widest"
              style={{ background: "hsl(18 100% 58% / 0.15)", color: "hsl(18 100% 65%)" }}
            >
              <Star size={14} />
              Saison 2025–2026
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-primary-foreground mb-6"
            >
              Bienvenue au
              <br />
              <span className="gradient-text">Val d'Yerres HB</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-10 leading-relaxed"
            >
              Un club convivial et ambitieux. Du baby hand aux seniors, il y a une place pour chacun sur le terrain.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/inscriptions" className="btn-primary text-base py-4 px-8">
                Rejoindre le club
                <ChevronRight size={18} />
              </Link>
              <Link to="/collectifs" className="btn-secondary text-base py-4 px-8">
                Nos collectifs
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Bannière annonce ─── */}
      <section className="relative -mt-1">
        <div className="container-narrow px-4">
          <div
            className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
            style={{ background: "var(--gradient-accent)" }}
          >
            <div className="flex items-center gap-3">
              <Calendar className="text-accent-foreground shrink-0" size={22} />
              <p className="font-display font-bold text-accent-foreground text-sm md:text-base">
                🏆 Tournoi de printemps — 26 & 27 avril — Venez encourager nos équipes !
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-accent-foreground font-display font-bold text-xs uppercase tracking-wider hover:bg-white/30 transition-colors"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Actualités ─── */}
      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeader
            title="Actualités"
            subtitle="Recrutements, événements, infos du club"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-sport p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-0.5 text-xs font-display font-bold uppercase ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Notre histoire ─── */}
      <section className="section-padding bg-muted/50">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-black text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                Plus qu'un club,
                <br />
                <span className="gradient-text">une famille</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fondé il y a bientôt 40 ans, le Val d'Yerres Handball Club est un pilier de la vie sportive locale. Nous accueillons joueurs et joueuses de tous niveaux dans un esprit de convivialité, de respect et de dépassement de soi.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Que vous soyez débutant ou confirmé, enfant ou adulte, compétiteur ou joueur loisir : il y a toujours une place pour vous chez nous.
              </p>
              <Link to="/club?tab=historique" className="btn-primary">
                Découvrir notre histoire
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <div key={i} className="card-sport p-6 text-center">
                  <stat.icon className="mx-auto mb-3 text-accent" size={28} />
                  <div className="font-display font-black text-3xl text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Nos collectifs ─── */}
      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeader title="Nos collectifs" subtitle="Du baby hand aux seniors, trouvez votre catégorie" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectifsList.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/collectifs/${c.slug}`}
                  className="card-sport p-6 flex items-center gap-4 group cursor-pointer block"
                >
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <div className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      Voir le collectif <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/collectifs" className="btn-primary">
              Tous nos collectifs
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Nous contacter ─── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-dark)" }} />
        <div className="relative container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Megaphone className="mx-auto mb-6 text-accent" size={40} />
            <h2 className="font-display font-black text-3xl md:text-5xl text-primary-foreground mb-6 leading-tight">
              Une question ? Venez nous voir !
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Notre secrétariat est ouvert les mardi et jeudi de 18h à 20h, et le samedi de 10h à 12h.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/inscriptions" className="btn-primary text-base py-4 px-8">
                S'inscrire
                <ChevronRight size={18} />
              </Link>
              <Link to="/contact" className="btn-secondary text-base py-4 px-8">
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Coordonnées du club ─── */}
      <section className="section-padding bg-primary/90">
        <div className="container-narrow">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Phone className="text-accent" size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-primary-foreground text-sm mb-1">Président du club</p>
                <a
                  href="tel:+33123456789"
                  className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  01 23 45 67 89
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Mail className="text-accent" size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-primary-foreground text-sm mb-1">Email du club</p>
                <a
                  href="mailto:contact@vyhb.fr"
                  className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  contact@vyhb.fr
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <MapPin className="text-accent" size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-primary-foreground text-sm mb-1">Gymnase</p>
                <p className="text-primary-foreground/70 text-sm">
                  Gymnase Municipal<br />Val d'Yerres
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

const SectionHeader = ({
  title,
  subtitle,
  light,
}: {
  title: string;
  subtitle: string;
  light?: boolean;
}) => (
  <div className="text-center mb-12">
    <h2
      className={`font-display font-black text-3xl md:text-4xl mb-3 ${
        light ? "text-primary-foreground" : "text-foreground"
      }`}
    >
      {title}
    </h2>
    <p
      className={`text-base max-w-lg mx-auto ${
        light ? "text-primary-foreground/60" : "text-muted-foreground"
      }`}
    >
      {subtitle}
    </p>
  </div>
);

export default Index;

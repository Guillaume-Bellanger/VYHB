import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { MapPin, Clock, User, ChevronRight, ArrowLeft } from "lucide-react";
import { collectifs } from "@/data/collectifs";

const CollectifDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const collectif = collectifs.find((c) => c.slug === slug);

  if (!collectif) return <Navigate to="/collectifs" replace />;

  return (
    <>
      {/* Hero avec gradient de couleur propre au collectif */}
      <section
        className={`relative section-padding bg-gradient-to-br ${collectif.gradient} text-white overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container-narrow">
          <Link
            to="/collectifs"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Retour aux collectifs
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5"
          >
            <span className="text-7xl drop-shadow-lg">{collectif.icon}</span>
            <div>
              <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-display font-bold uppercase tracking-wider mb-3">
                {collectif.age}
              </span>
              <h1 className="font-display font-black text-4xl md:text-5xl leading-tight mb-2">
                {collectif.name}
              </h1>
              <p className="text-white/70 text-base">{collectif.level}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Description */}
            <div>
              <p className="text-muted-foreground text-lg leading-relaxed">{collectif.desc}</p>
            </div>

            {/* Infos pratiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Entraîneurs */}
              <div className="card-sport p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User size={18} className="text-accent" />
                  <span className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                    Entraîneur{collectif.coaches.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="space-y-1">
                  {collectif.coaches.map((coach, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{coach}</li>
                  ))}
                </ul>
              </div>

              {/* Horaires */}
              <div className="card-sport p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-accent" />
                  <span className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                    Horaires
                  </span>
                </div>
                <ul className="space-y-1">
                  {collectif.schedule.map((slot, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{slot}</li>
                  ))}
                </ul>
              </div>

              {/* Lieu */}
              <div className="card-sport p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-accent" />
                  <span className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
                    Lieu
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{collectif.location}</p>
              </div>
            </div>

            {/* CTA Inscription */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "var(--gradient-accent)" }}
            >
              <h2 className="font-display font-black text-2xl text-accent-foreground mb-3">
                Rejoindre ce collectif ?
              </h2>
              <p className="text-accent-foreground/80 mb-6 text-sm leading-relaxed">
                Venez essayer gratuitement avant de vous engager. Consultez les modalités d'inscription pour en savoir plus.
              </p>
              <Link to="/inscriptions" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display font-bold text-sm text-accent hover:bg-white/90 transition-colors">
                Voir les inscriptions <ChevronRight size={16} />
              </Link>
            </div>

            {/* Lien retour */}
            <div className="pt-2">
              <Link
                to="/collectifs"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Voir tous les collectifs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CollectifDetail;

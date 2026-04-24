import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { MapPin, Clock, User, ChevronRight, ArrowLeft, Star, Zap, Trophy, Flame, Crown, Users, Heart, Sparkles } from "lucide-react";
import { collectifs } from "@/data/collectifs";

const collectifIcons: Record<string, React.ElementType> = {
  "baby-hand": Heart,
  "-7": Star,
  "-9": Zap,
  "-11f": Sparkles,
  "-11m": Trophy,
  "-13f": Flame,
  "-15-18f": Flame,
  "-15-18m": Trophy,
  "seniors-feminines": Crown,
  "seniors-masculins": Trophy,
  "loisirs": Users,
};

const CollectifDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const collectif = collectifs.find((c) => c.slug === slug);

  if (!collectif) return <Navigate to="/collectifs" replace />;

  const Icon = collectifIcons[collectif.slug] ?? Star;

  return (
    <>
      {/* Hero avec gradient collectif */}
      <section className={`relative min-h-[40vh] flex items-end pb-12 bg-gradient-to-br ${collectif.gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/55" />
        {/* Orb de fond */}
        <div className="absolute top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full bg-white/[0.04] blur-3xl" />
        {/* Gros icon de fond */}
        <div className="absolute right-8 bottom-8 opacity-5">
          <Icon size={200} className="text-white" />
        </div>

        <div className="relative container-narrow px-4 md:px-6 w-full">
          <Link
            to="/collectifs"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Retour aux collectifs
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Icon size={40} className="text-white" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-3">
                {collectif.age}
              </span>
              <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-1">
                {collectif.name}
              </h1>
              <p className="text-white/60 text-base font-medium">{collectif.level}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16">
        <div className="container-narrow px-4 md:px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-8"
          >
            {/* Description */}
            <p className="text-white/55 text-lg leading-relaxed">{collectif.desc}</p>

            {/* Infos pratiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-premium rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <User size={16} className="text-orange-400" />
                  </div>
                  <span className="font-display font-bold text-xs text-white/60 uppercase tracking-wider">
                    Entraîneur{collectif.coaches.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="space-y-1">
                  {collectif.coaches.map((coach, i) => (
                    <li key={i} className="text-sm text-white font-medium">{coach}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-premium rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock size={16} className="text-blue-400" />
                  </div>
                  <span className="font-display font-bold text-xs text-white/60 uppercase tracking-wider">Horaires</span>
                </div>
                <ul className="space-y-1">
                  {collectif.schedule.map((slot, i) => (
                    <li key={i} className="text-sm text-white font-medium">{slot}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-premium rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MapPin size={16} className="text-emerald-400" />
                  </div>
                  <span className="font-display font-bold text-xs text-white/60 uppercase tracking-wider">Lieu</span>
                </div>
                <p className="text-sm text-white font-medium leading-relaxed">{collectif.location}</p>
              </div>
            </div>

            {/* CTA Inscription */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl p-8 text-center overflow-hidden"
              style={{ background: "var(--gradient-accent)" }}
            >
              <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full bg-white/[0.08] blur-2xl" />
              <h2 className="font-display font-black text-2xl text-white mb-3">
                Rejoindre ce collectif ?
              </h2>
              <p className="text-white/75 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
                Venez essayer gratuitement avant de vous engager. Consultez les modalités d'inscription pour en savoir plus.
              </p>
              <Link
                to="/inscriptions"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display font-bold text-sm text-orange-600 hover:bg-white/90 transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Voir les inscriptions <ChevronRight size={16} />
              </Link>
            </motion.div>

            {/* Retour */}
            <Link
              to="/collectifs"
              className="inline-flex items-center gap-2 text-white/40 hover:text-orange-400 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Voir tous les collectifs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CollectifDetail;

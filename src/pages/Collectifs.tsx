import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Zap, Trophy, Flame, Crown, Users, Heart, Sparkles } from "lucide-react";
import { collectifs } from "@/data/collectifs";
import SEO from "@/components/SEO";

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

const Collectifs = () => (
  <>
    <SEO
      title="Nos équipes"
      description="Baby Hand, -7, -9, -11F, -11M, -13F, -15/-18F, -15/-18M, Seniors, Loisirs — les 11 équipes du Val d'Yerres Handball en Essonne. Trouvez votre catégorie !"
      canonical="/collectifs"
      breadcrumb={[
        { name: "Accueil", url: "/" },
        { name: "Nos Collectifs", url: "/collectifs" },
      ]}
    />

    {/* Page Hero */}
    <section className="relative pb-12 overflow-hidden">
      <div className="hero-orb w-[420px] h-[420px] bg-orange-600/12 top-[-100px] right-[-80px]" style={{ animationDuration: "13s" }} />
      <div className="hero-orb w-[280px] h-[280px] bg-red-800/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "17s", animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="eyebrow mb-5 inline-flex">Val d'Yerres Handball</span>
          <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Nos <span className="gradient-text">Collectifs</span>
          </h1>
          <p className="text-white/45 text-lg max-w-2xl leading-relaxed mx-auto">
            Du Baby Hand aux Seniors, trouvez votre catégorie et rejoignez l'aventure.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Grid */}
    <section className="pb-24">
      <div className="container-narrow px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collectifs.map((c, i) => {
            const Icon = collectifIcons[c.slug] ?? Star;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/collectifs/${c.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-white/[0.07] hover:border-orange-500/30 transition-all duration-400 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {/* Gradient header */}
                  <div className={`relative h-48 bg-gradient-to-br ${c.gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/30" />
                    {/* Big background letter */}
                    <span className="absolute right-4 bottom-2 font-display font-black text-[80px] text-white/5 leading-none select-none">
                      {c.shortName.charAt(0)}
                    </span>
                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={30} className="text-white" />
                    </div>
                    {/* Age badge */}
                    <div className="absolute bottom-3 left-4">
                      <span className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-display font-bold text-white uppercase tracking-wider">
                        {c.age}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display font-black text-lg text-white group-hover:text-orange-400 transition-colors mb-1">
                      {c.name}
                    </h3>
                    <p className="text-xs text-orange-400 font-display font-semibold uppercase tracking-wider mb-3">{c.level}</p>
                    <p className="text-sm text-white/40 line-clamp-2 leading-relaxed mb-4">{c.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-orange-400 group-hover:gap-3 transition-all duration-300">
                      Voir le collectif <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  </>
);

export default Collectifs;

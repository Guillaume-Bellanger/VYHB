import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { collectifs } from "@/data/collectifs";

const Collectifs = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-4xl md:text-5xl mb-4"
        >
          Nos Collectifs
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Du Baby Hand aux Seniors, trouvez votre catégorie et rejoignez l'aventure.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectifs.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={`/collectifs/${c.slug}`}
                className="group block rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
              >
                {/* Photo / Gradient placeholder */}
                <div
                  className={`relative h-44 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}
                >
                  <span className="text-6xl drop-shadow-lg">{c.icon}</span>
                  <div className="absolute bottom-3 left-4">
                    <span className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-display font-bold text-white uppercase tracking-wider">
                      {c.age}
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-5 bg-card">
                  <h3 className="font-display font-black text-lg text-foreground group-hover:text-accent transition-colors mb-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-accent font-display font-semibold uppercase mb-2">{c.level}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{c.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-display font-bold text-accent group-hover:gap-2.5 transition-all">
                    Voir le collectif <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Collectifs;

import { motion } from "framer-motion";
import { Calendar, MapPin, Tag } from "lucide-react";

const news = [
  {
    type: "Match",
    date: "5 avril 2026",
    title: "Victoire éclatante des Seniors M1 face au PSG Handball B",
    excerpt: "Nos seniors masculins ont signé une victoire convaincante 32-28 à domicile. Une performance collective remarquable.",
  },
  {
    type: "Événement",
    date: "26-27 avril 2026",
    title: "Tournoi de printemps — Inscriptions ouvertes",
    excerpt: "Le traditionnel tournoi de printemps revient ! Catégories jeunes et seniors, ambiance festive garantie.",
  },
  {
    type: "Club",
    date: "1er avril 2026",
    title: "Assemblée Générale — Bilan positif pour la saison",
    excerpt: "L'AG a confirmé la bonne santé du club : effectifs en hausse, résultats sportifs encourageants et finances saines.",
  },
  {
    type: "Match",
    date: "29 mars 2026",
    title: "Les -18 Garçons qualifiés pour les phases finales",
    excerpt: "Belle qualification de nos -18 garçons qui se sont imposés 30-22 face à Nantes HB. Rendez-vous en demi-finale !",
  },
  {
    type: "Partenaire",
    date: "15 mars 2026",
    title: "Nouveau partenariat avec Décathlon",
    excerpt: "Le club signe un accord de partenariat avec Décathlon pour l'équipement de toutes les équipes jeunes.",
  },
];

const typeColors: Record<string, string> = {
  Match: "bg-accent/10 text-accent",
  Événement: "bg-success/10 text-success",
  Club: "bg-primary/10 text-primary",
  Partenaire: "bg-muted text-muted-foreground",
};

const News = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl mb-4">
          Actualités
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Matchs, événements, vie du club : restez informés.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow max-w-3xl space-y-6">
        {news.map((n, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-sport p-6"
          >
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-display font-bold uppercase ${typeColors[n.type]}`}>
                <Tag size={12} /> {n.type}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} /> {n.date}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">{n.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>
          </motion.article>
        ))}
      </div>
    </section>
  </>
);

export default News;

import { motion } from "framer-motion";

const teamsList = [
  { category: "Seniors", teams: [
    { name: "Seniors Masculins 1", level: "Pré-nationale", coach: "Jean Dupont", training: "Mar & Jeu 20h-22h" },
    { name: "Seniors Masculins 2", level: "Départementale 1", coach: "Pierre Martin", training: "Lun & Mer 20h-22h" },
    { name: "Seniors Féminines 1", level: "Régionale 1", coach: "Sophie Leclerc", training: "Mar & Jeu 19h-21h" },
    { name: "Seniors Féminines 2", level: "Départementale 2", coach: "Marie Durand", training: "Lun & Mer 19h-21h" },
  ]},
  { category: "Jeunes", teams: [
    { name: "-18 Garçons", level: "Régional", coach: "Thomas Bernard", training: "Mer 17h-19h & Ven 18h-20h" },
    { name: "-18 Filles", level: "Départemental", coach: "Julie Moreau", training: "Mer 15h-17h & Ven 17h-19h" },
    { name: "-16 Garçons", level: "Départemental", coach: "Marc Petit", training: "Mer 14h-16h & Sam 10h-12h" },
    { name: "-16 Filles", level: "Départemental", coach: "Laura Simon", training: "Mer 14h-16h & Sam 14h-16h" },
  ]},
  { category: "École de Hand", teams: [
    { name: "-14 Mixte", level: "Départemental", coach: "Nicolas Roux", training: "Mer 13h-15h" },
    { name: "-12 Mixte", level: "Plateau", coach: "Camille Blanc", training: "Sam 10h-12h" },
    { name: "Baby Hand (5-7 ans)", level: "Éveil", coach: "Emma Garnier", training: "Sam 9h-10h" },
  ]},
  { category: "Loisirs", teams: [
    { name: "Loisirs Adultes Mixte", level: "Non-compétitif", coach: "Club", training: "Ven 20h-22h" },
  ]},
];

const Teams = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl mb-4">
          Nos Équipes
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          12 équipes, tous niveaux, tous âges. Trouvez la vôtre.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow space-y-12">
        {teamsList.map((cat, ci) => (
          <div key={ci}>
            <h2 className="font-display font-black text-2xl text-foreground mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 rounded-full bg-accent inline-block" />
              {cat.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.teams.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card-sport p-5"
                >
                  <h3 className="font-display font-bold text-foreground mb-1">{t.name}</h3>
                  <span className="inline-block rounded-full bg-accent/10 text-accent px-3 py-0.5 text-xs font-display font-bold uppercase mb-3">
                    {t.level}
                  </span>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>🎯 Entraîneur : {t.coach}</p>
                    <p>🕐 {t.training}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default Teams;

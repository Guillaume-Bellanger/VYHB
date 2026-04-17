import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Données Bureau ─── */
const bureau = [
  { prenom: "Jean", role: "Président", initiale: "J", desc: "Pilote la vie du club et représente le Val d'Yerres HB auprès des instances sportives." },
  { prenom: "Marie", role: "Vice-présidente", initiale: "M", desc: "Assure la coordination des événements et le lien entre les équipes et le bureau." },
  { prenom: "Pierre", role: "Secrétaire", initiale: "P", desc: "Gestion administrative, inscriptions et correspondance officielle du club." },
  { prenom: "Sophie", role: "Trésorière", initiale: "S", desc: "Gestion financière, cotisations et suivi du budget annuel." },
  { prenom: "Thomas", role: "Responsable sportif", initiale: "T", desc: "Coordination des entraîneurs, planification sportive et suivi des équipes." },
  { prenom: "Lucie", role: "Responsable communication", initiale: "L", desc: "Réseaux sociaux, site internet et communication avec les licenciés." },
];

/* ─── Données Entraîneurs & Bénévoles ─── */
const entraineurs = [
  { prenom: "Jean", role: "Entraîneur Seniors M1", initiale: "J", categorie: "Entraîneur" },
  { prenom: "Pierre", role: "Entraîneur Seniors M2", initiale: "P", categorie: "Entraîneur" },
  { prenom: "Sophie", role: "Entraîneuse Seniors F1", initiale: "S", categorie: "Entraîneur" },
  { prenom: "Marie", role: "Entraîneuse Seniors F2", initiale: "M", categorie: "Entraîneur" },
  { prenom: "Thomas", role: "Entraîneur -18 Garçons", initiale: "T", categorie: "Entraîneur" },
  { prenom: "Julie", role: "Entraîneuse -18 Filles", initiale: "J", categorie: "Entraîneur" },
  { prenom: "Marc", role: "Entraîneur -16 Garçons", initiale: "M", categorie: "Entraîneur" },
  { prenom: "Laura", role: "Entraîneuse -16 Filles", initiale: "L", categorie: "Entraîneur" },
  { prenom: "Nicolas", role: "Entraîneur -14 Mixte", initiale: "N", categorie: "Entraîneur" },
  { prenom: "Camille", role: "Entraîneuse -12 Mixte", initiale: "C", categorie: "Entraîneur" },
  { prenom: "Emma", role: "Éducatrice Baby Hand", initiale: "E", categorie: "Entraîneur" },
  { prenom: "Alex", role: "Intendant matériel", initiale: "A", categorie: "Bénévole" },
  { prenom: "Nathalie", role: "Gestion des licences", initiale: "N", categorie: "Bénévole" },
  { prenom: "Rémi", role: "Arbitre officiel", initiale: "R", categorie: "Bénévole" },
  { prenom: "Isabelle", role: "Responsable buvette", initiale: "I", categorie: "Bénévole" },
];

const VALID_TABS = ["historique", "bureau", "entraineurs"] as const;
type TabValue = (typeof VALID_TABS)[number];

const Club = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab: TabValue = VALID_TABS.includes(rawTab as TabValue)
    ? (rawTab as TabValue)
    : "historique";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (VALID_TABS.includes(t as TabValue)) setActiveTab(t as TabValue);
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as TabValue);
    setSearchParams({ tab: val });
  };

  return (
    <>
      {/* Hero */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-4xl md:text-5xl mb-4"
          >
            Le Club
          </motion.h1>
          <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
            Histoire, bureau dirigeant, entraîneurs et bénévoles du Val d'Yerres HB.
          </p>
        </div>
      </section>

      {/* Onglets */}
      <section className="section-padding">
        <div className="container-narrow">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full sm:w-auto mb-10 grid grid-cols-3 sm:inline-flex gap-1 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="historique" className="font-display font-semibold text-sm">
                Historique
              </TabsTrigger>
              <TabsTrigger value="bureau" className="font-display font-semibold text-sm">
                Le Bureau
              </TabsTrigger>
              <TabsTrigger value="entraineurs" className="font-display font-semibold text-sm">
                Entraîneurs & Bénévoles
              </TabsTrigger>
            </TabsList>

            {/* ─── Historique ─── */}
            <TabsContent value="historique">
              <div className="max-w-3xl">
                <h2 className="font-display font-black text-2xl md:text-3xl text-foreground mb-8">
                  Notre histoire
                </h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  <p>
                    Fondé il y a bientôt 40 ans par une poignée de passionnés, le Val d'Yerres Handball Club a su grandir au fil des décennies pour devenir un acteur majeur du handball local et régional.
                  </p>
                  <p>
                    D'abord constitué d'une seule équipe senior masculine, le club compte aujourd'hui plus de 320 licenciés répartis dans 12 équipes — des plus jeunes (dès 5 ans) aux seniors les plus expérimentés.
                  </p>
                  <p>
                    Notre mission reste inchangée : offrir à chacun la possibilité de pratiquer le handball dans les meilleures conditions, dans un esprit de convivialité, d'exigence sportive et de respect mutuel.
                  </p>
                  <p>
                    Au fil des années, le club a remporté plusieurs titres départementaux et régionaux, et a formé de nombreux joueurs qui évoluent aujourd'hui à des niveaux supérieurs. Nous sommes fiers de cette tradition de formation et de notre ancrage dans la vie locale.
                  </p>
                  <p>
                    Aujourd'hui, le Val d'Yerres HB continue d'écrire son histoire avec la même passion qu'à ses débuts — portée par ses bénévoles, ses entraîneurs dévoués et la communauté de familles qui font vivre le club au quotidien.
                  </p>
                </div>

                {/* Valeurs */}
                <div className="mt-12">
                  <h3 className="font-display font-bold text-xl text-foreground mb-6">Nos valeurs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { emoji: "🤝", title: "Convivialité", text: "Un club où chacun se sent chez soi, dans le respect et la bonne humeur." },
                      { emoji: "🎯", title: "Ambition", text: "Progresser ensemble, se dépasser à chaque entraînement et chaque match." },
                      { emoji: "👥", title: "Esprit d'équipe", text: "Le collectif avant tout. Sur le terrain comme en dehors." },
                      { emoji: "🌱", title: "Formation", text: "Accompagner les jeunes joueurs vers l'excellence sportive et humaine." },
                    ].map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="card-sport p-5 flex items-start gap-4"
                      >
                        <span className="text-2xl">{v.emoji}</span>
                        <div>
                          <h4 className="font-display font-bold text-foreground mb-1">{v.title}</h4>
                          <p className="text-sm text-muted-foreground">{v.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ─── Bureau ─── */}
            <TabsContent value="bureau">
              <div className="max-w-4xl">
                <h2 className="font-display font-black text-2xl md:text-3xl text-foreground mb-3">
                  Le Bureau
                </h2>
                <p className="text-muted-foreground mb-10">
                  Le bureau est composé de bénévoles élus lors de l'assemblée générale annuelle. Ils assurent la gestion et le développement du club.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bureau.map((person, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="card-sport p-6 flex flex-col items-center text-center"
                    >
                      {/* Photo placeholder */}
                      <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mb-4">
                        <span className="font-display font-black text-2xl text-accent">
                          {person.initiale}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-lg">{person.prenom}</h3>
                      <span className="inline-block mt-1 mb-3 rounded-full bg-accent/10 text-accent px-3 py-0.5 text-xs font-display font-bold uppercase">
                        {person.role}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{person.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ─── Entraîneurs & Bénévoles ─── */}
            <TabsContent value="entraineurs">
              <div className="max-w-4xl">
                <h2 className="font-display font-black text-2xl md:text-3xl text-foreground mb-3">
                  Entraîneurs & Bénévoles
                </h2>
                <p className="text-muted-foreground mb-10">
                  Nos entraîneurs et bénévoles sont le cœur battant du club. Merci à tous pour leur engagement au quotidien.
                </p>

                {/* Entraîneurs */}
                <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-accent inline-block" />
                  Entraîneurs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                  {entraineurs
                    .filter((p) => p.categorie === "Entraîneur")
                    .map((person, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="card-sport p-5 flex flex-col items-center text-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-primary/30 border border-white/10 flex items-center justify-center mb-3">
                          <User size={22} className="text-accent" />
                        </div>
                        <p className="font-display font-bold text-foreground text-sm">{person.prenom}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-tight">{person.role}</p>
                      </motion.div>
                    ))}
                </div>

                {/* Bénévoles */}
                <h3 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-emerald-500 inline-block" />
                  Bénévoles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {entraineurs
                    .filter((p) => p.categorie === "Bénévole")
                    .map((person, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="card-sport p-5 flex flex-col items-center text-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                          <User size={22} className="text-emerald-400" />
                        </div>
                        <p className="font-display font-bold text-foreground text-sm">{person.prenom}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-tight">{person.role}</p>
                      </motion.div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default Club;

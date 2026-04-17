import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle, ArrowRight, AlertCircle, ChevronDown, ChevronUp,
  Calendar, Euro, FileText, RefreshCw,
} from "lucide-react";
import { useState } from "react";

const tarifs = [
  { category: "Baby Hand (5–7 ans)", price: "80 €", note: "" },
  { category: "École de Hand -12 / -14", price: "130 €", note: "" },
  { category: "-16 / -18 ans", price: "150 €", note: "" },
  { category: "Seniors Compétition", price: "180 €", note: "" },
  { category: "Loisirs Adultes", price: "150 €", note: "" },
];

const planning = [
  { categorie: "Baby Hand (5–7 ans)", horaires: "Samedi 9h–10h", lieu: "Gymnase Municipal" },
  { categorie: "École de Hand -12", horaires: "Samedi 10h–12h", lieu: "Gymnase Municipal" },
  { categorie: "École de Hand -14", horaires: "Mercredi 13h–15h", lieu: "Gymnase Municipal" },
  { categorie: "-16 Garçons", horaires: "Mer 14h–16h · Sam 10h–12h", lieu: "Gymnase Municipal" },
  { categorie: "-16 Filles", horaires: "Mer 14h–16h · Sam 14h–16h", lieu: "Gymnase Municipal" },
  { categorie: "-18 Garçons", horaires: "Mer 17h–19h · Ven 18h–20h", lieu: "Gymnase Municipal" },
  { categorie: "-18 Filles", horaires: "Mer 15h–17h · Ven 17h–19h", lieu: "Gymnase Municipal" },
  { categorie: "Seniors Masculins 1", horaires: "Mar & Jeu 20h–22h", lieu: "Gymnase Municipal" },
  { categorie: "Seniors Masculins 2", horaires: "Lun & Mer 20h–22h", lieu: "Gymnase Municipal" },
  { categorie: "Seniors Féminines 1", horaires: "Mar & Jeu 19h–21h", lieu: "Gymnase Municipal" },
  { categorie: "Seniors Féminines 2", horaires: "Lun & Mer 19h–21h", lieu: "Gymnase Municipal" },
  { categorie: "Loisirs Adultes Mixte", horaires: "Vendredi 20h–22h", lieu: "Gymnase Municipal" },
];

const docsMineurs = [
  "Certificat médical de non contre-indication à la pratique du handball (moins de 3 mois) — 1re inscription uniquement",
  "Questionnaire de santé QS-SPORT signé par le médecin",
  "Copie du livret de famille ou acte de naissance",
  "Autorisation parentale signée par les deux parents (ou tuteur légal)",
  "Photo d'identité récente",
  "Chèque(s) de cotisation à l'ordre du « Val d'Yerres HB »",
];

const docsMajeurs = [
  "Certificat médical de non contre-indication à la pratique du handball (moins de 3 mois) — 1re inscription uniquement",
  "Questionnaire de santé QS-SPORT complété et signé",
  "Pièce d'identité (copie)",
  "Photo d'identité récente",
  "Chèque(s) de cotisation à l'ordre du « Val d'Yerres HB »",
];

const stepsInscription = [
  { step: "1", title: "Essai gratuit", desc: "Venez essayer 2 séances gratuitement sans engagement. Contactez-nous pour convenir d'une date." },
  { step: "2", title: "Constituer le dossier", desc: "Rassemblez les documents requis selon votre catégorie (mineur ou majeur). Voir la liste ci-dessous." },
  { step: "3", title: "Déposer le dossier", desc: "Apportez votre dossier complet au secrétariat lors des permanences (Mar/Jeu 18h–20h, Sam 10h–12h)." },
  { step: "4", title: "Régler la cotisation", desc: "Paiement possible en 1 ou 3 chèques. Réductions famille disponibles sur demande." },
  { step: "5", title: "Obtenir la licence FFHB", desc: "Une fois le dossier validé, vous recevez votre licence Fédérale. Vous pouvez alors participer aux entraînements et compétitions." },
];

const stepsReinscription = [
  { step: "1", title: "Vérifier le questionnaire de santé", desc: "Remplir le QS-SPORT. Si vous répondez OUI à une question, un certificat médical est nécessaire." },
  { step: "2", title: "Confirmer la réinscription", desc: "Informer le secrétariat de votre intention de vous réinscrire avant fin août." },
  { step: "3", title: "Régler la cotisation", desc: "Déposer le(s) chèque(s) de cotisation au secrétariat lors de la rentrée sportive." },
  { step: "4", title: "Renouvellement de la licence", desc: "Le club transmet les dossiers à la FFHB. Votre licence est renouvelée pour la nouvelle saison." },
];

const reglementSections = [
  {
    title: "Article 1 – Adhésion",
    content: "Toute personne souhaitant pratiquer le handball au sein du Val d'Yerres HB doit être en possession d'une licence FFHB valide et avoir réglé sa cotisation annuelle. L'adhésion implique l'acceptation du présent règlement intérieur.",
  },
  {
    title: "Article 2 – Respect et comportement",
    content: "Les licenciés s'engagent à respecter les autres membres du club, les entraîneurs, les arbitres et les adversaires. Tout comportement irrespectueux, violent ou discriminatoire pourra faire l'objet d'une sanction pouvant aller jusqu'à l'exclusion du club.",
  },
  {
    title: "Article 3 – Ponctualité et assiduité",
    content: "La ponctualité aux entraînements et aux matchs est exigée. En cas d'absence prévisible, le licencié (ou ses parents pour les mineurs) doit en informer l'entraîneur dans les meilleurs délais.",
  },
  {
    title: "Article 4 – Équipements et installations",
    content: "Les licenciés s'engagent à respecter le matériel et les installations mis à disposition. Les équipements doivent être utilisés conformément à leur destination. Toute dégradation volontaire pourra entraîner une demande de remboursement.",
  },
  {
    title: "Article 5 – Image du club",
    content: "Sur les réseaux sociaux et en dehors du club, les licenciés sont ambassadeurs du Val d'Yerres HB. Ils s'engagent à ne pas porter atteinte à l'image du club ni à celle de ses membres.",
  },
  {
    title: "Article 6 – Cotisations",
    content: "La cotisation est due pour la saison entière, quelle que soit la date d'inscription. Aucun remboursement ne sera effectué sauf cas de force majeure (blessure grave sur certificat médical), à la discrétion du bureau.",
  },
  {
    title: "Article 7 – Photos et droits à l'image",
    content: "En adhérant au club, les licenciés autorisent le club à utiliser leur image dans le cadre de la communication officielle du club (site internet, réseaux sociaux, presse locale). Les parents peuvent s'y opposer par écrit.",
  },
];

const AccordionItem = ({ title, content }: { title: string; content: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-card hover:bg-muted/50 transition-colors"
      >
        <span className="font-display font-semibold text-sm text-foreground">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-accent shrink-0 ml-2" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground shrink-0 ml-2" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-card/50">
          <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
      <Icon size={20} className="text-accent" />
    </div>
    <h2 className="font-display font-black text-2xl text-foreground">{title}</h2>
  </div>
);

const Registration = () => (
  <>
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-narrow text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-black text-4xl md:text-5xl mb-4"
        >
          Inscriptions
        </motion.h1>
        <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
          Tout ce qu'il faut savoir pour rejoindre ou renouveler votre licence au Val d'Yerres HB.
        </p>
      </div>
    </section>

    <section className="section-padding">
      <div className="container-narrow space-y-16 max-w-5xl">

        {/* ─── Planning des entraînements ─── */}
        <div>
          <SectionTitle icon={Calendar} title="Planning des entraînements" />
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-5 py-3 font-display font-bold text-foreground">Catégorie</th>
                  <th className="text-left px-5 py-3 font-display font-bold text-foreground">Horaires</th>
                  <th className="text-left px-5 py-3 font-display font-bold text-foreground hidden sm:table-cell">Lieu</th>
                </tr>
              </thead>
              <tbody>
                {planning.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-card/60"}`}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{row.categorie}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.horaires}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{row.lieu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Tarifs ─── */}
        <div>
          <SectionTitle icon={Euro} title="Tarifs saison 2025–2026" />
          <div className="space-y-3 max-w-lg">
            {tarifs.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-sport p-4 flex items-center justify-between"
              >
                <span className="font-medium text-foreground">{t.category}</span>
                <span className="font-display font-black text-accent text-lg">{t.price}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-lg">
            * Cotisation annuelle, licence FFHB incluse. Paiement en 1 ou 3 chèques possible. Réductions famille disponibles sur demande auprès du bureau.
          </p>
        </div>

        {/* ─── Documents requis ─── */}
        <div>
          <SectionTitle icon={FileText} title="Documents requis" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mineurs */}
            <div className="card-sport p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-display font-black text-foreground text-base">Inscription Mineurs</span>
                <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-xs font-display font-bold uppercase">–18 ans</span>
              </div>
              <ul className="space-y-3">
                {docsMineurs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Majeurs */}
            <div className="card-sport p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-display font-black text-foreground text-base">Inscription Majeurs</span>
                <span className="rounded-full bg-blue-500/10 text-blue-400 px-2 py-0.5 text-xs font-display font-bold uppercase">+18 ans</span>
              </div>
              <ul className="space-y-3">
                {docsMajeurs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle size={16} className="text-accent shrink-0 mt-0.5" />
            <p>Pour les renouvellements, le certificat médical n'est requis que si vous répondez OUI à l'une des questions du questionnaire de santé QS-SPORT.</p>
          </div>
        </div>

        {/* ─── Étapes ─── */}
        <div>
          <SectionTitle icon={ArrowRight} title="Comment s'inscrire ?" />
          <div className="space-y-4">
            {stepsInscription.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-black text-accent-foreground text-sm shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="font-display font-bold text-foreground mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Réinscription ─── */}
        <div>
          <SectionTitle icon={RefreshCw} title="Renouvellement de licence" />
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
            Vous êtes déjà licencié(e) ? Voici la procédure simplifiée pour renouveler votre inscription pour la prochaine saison.
          </p>
          <div className="space-y-4">
            {stepsReinscription.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display font-black text-foreground text-sm shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="font-display font-bold text-foreground mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Règlement intérieur ─── */}
        <div>
          <SectionTitle icon={FileText} title="Règlement intérieur" />
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
            Ce règlement s'applique à tous les licenciés du Val d'Yerres HB. En vous inscrivant, vous vous engagez à le respecter. Il est signé par chaque licencié (ou parent pour les mineurs) lors de l'adhésion.
          </p>
          <div className="space-y-2">
            {reglementSections.map((section, i) => (
              <AccordionItem key={i} title={section.title} content={section.content} />
            ))}
          </div>
        </div>

        {/* ─── CTA Contact ─── */}
        <div className="card-sport p-8 text-center">
          <h3 className="font-display font-black text-xl text-foreground mb-3">
            Des questions sur les inscriptions ?
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Notre secrétariat est disponible pour vous accompagner. N'hésitez pas à nous contacter.
          </p>
          <Link to="/contact" className="btn-primary">
            Nous contacter <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  </>
);

export default Registration;

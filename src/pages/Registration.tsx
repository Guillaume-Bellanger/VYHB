import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle, ArrowRight, AlertCircle,
  Calendar, Euro, FileText, RefreshCw, Mail, UserCheck, UserPlus,
} from "lucide-react";
import SEO from "@/components/SEO";
import Accordion from "@/components/Accordion";
import { reglementInterieur } from "@/data/reglementInterieur";
import { useCollectifsPublic } from "@/hooks/useCollectifs";
import { formatHoraires, formatLieux } from "@/lib/collectifFormat";
import { useTarifs } from "@/hooks/useTarifs";
import { Skeleton } from "@/components/ui/skeleton";

// Dégradé décoratif par ligne — cyclique, pas de correspondance figée avec un libellé
const TARIF_ACCENTS = [
  "from-yellow-500/20 to-amber-600/10",
  "from-lime-500/20 to-green-600/10",
  "from-violet-500/20 to-purple-600/10",
  "from-orange-500/20 to-red-600/10",
  "from-indigo-500/20 to-blue-600/10",
];


const docsMineurs = [
  "Certificat médical de non contre-indication à la pratique du handball (1ère inscription uniquement, ou si réponse OUI au QS-SPORT)",
  "Questionnaire de santé QS-SPORT complété et signé",
  "Copie de la pièce d'identité ou extrait d'acte de naissance",
  "Autorisation parentale signée par les parents ou tuteur légal",
  "Photo d'identité récente",
  "Attestation de paiement (Pass'sport, LABAZ, chèque mairie, ANCV)",
];

const docsMajeurs = [
  "Certificat médical de non contre-indication à la pratique du handball (1ère inscription uniquement, ou si réponse OUI au QS-SPORT)",
  "Questionnaire de santé QS-SPORT complété et signé",
  "Copie de la pièce d'identité",
  "Photo d'identité récente",
  "Attestation de paiement (Pass'sport, LABAZ, chèque mairie, ANCV)",
];

const stepsInscription = [
  { step: "1", title: "Essai gratuit", desc: "Venez essayer 2 séances gratuitement sans engagement. Contactez-nous pour convenir d'une date." },
  { step: "2", title: "Inscription", desc: "Contactez-nous par email à vyhandball@gmail.com. Nous vous transmettrons le formulaire d'inscription et vous guiderons pour les pièces à fournir." },
  { step: "3", title: "Paiement", desc: "Réglez votre cotisation. Moyens acceptés : Pass'sport · LABAZ · Chèque mairie · ANCV." },
  { step: "4", title: "Validation de la licence FFHB", desc: "Une fois le dossier validé par la trésorière, vous recevez votre licence Fédérale. Vous pouvez alors participer aux entraînements et compétitions." },
];

const stepsReinscription = [
  { step: "1", title: "Vérifier le questionnaire de santé", desc: "Remplir le QS-SPORT. Si vous répondez OUI à une question, un certificat médical est nécessaire." },
  { step: "2", title: "Renouvellement", desc: "Contactez-nous par email à vyhandball@gmail.com pour lancer votre renouvellement et joignez les pièces éventuellement requises." },
  { step: "3", title: "Paiement", desc: "Réglez votre cotisation. Moyens acceptés : Pass'sport · LABAZ · Chèque mairie · ANCV." },
  { step: "4", title: "Renouvellement de la licence", desc: "La trésorière transmet les dossiers à la FFHB. Votre licence est renouvelée pour la nouvelle saison." },
];

const SectionHeader = ({ icon: Icon, title, accent = "text-orange-400", bg = "bg-orange-500/10" }: { icon: React.ElementType; title: string; accent?: string; bg?: string }) => (
  <div className="flex items-center justify-center gap-4 mb-8 text-center">
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon size={22} className={accent} />
    </div>
    <h2 className="font-display font-black text-2xl text-white">{title}</h2>
  </div>
);

const Steps = ({ steps, accent = "var(--gradient-accent)" }: { steps: typeof stepsInscription; accent?: string }) => (
  <div className="space-y-6">
    {steps.map((s, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.08 }}
        className="flex items-start gap-5"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-white text-sm shrink-0 mt-0.5"
          style={{ background: accent }}
        >
          {s.step}
        </div>
        <div className="pt-1">
          <p className="font-display font-bold text-white mb-1">{s.title}</p>
          <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

const ContactEmailBlock = () => (
  <div
    className="mt-8 p-6 rounded-2xl border border-orange-500/20"
    style={{ background: "rgba(249,115,22,0.05)" }}
  >
    <p className="text-white/70 text-sm leading-relaxed mb-4">
      Pour vous inscrire, contactez-nous directement par email à{" "}
      <strong className="text-orange-400">vyhandball@gmail.com</strong>{" "}
      ou venez nous retrouver lors de nos séances d'essai gratuites.
    </p>
    <a
      href="mailto:vyhandball@gmail.com"
      className="btn-primary gap-2 inline-flex"
    >
      <Mail size={15} />
      Envoyer un email
    </a>
  </div>
);

function PlanningSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

const Registration = () => {
  const { data: collectifs = [], isLoading: collectifsLoading } = useCollectifsPublic();
  const planning = collectifs.map((c) => ({
    categorie: `${c.nom} (${c.tranche_age})`,
    horaires: formatHoraires(c.horaires),
    lieu: formatLieux(c.lieux),
  }));

  const { data: tarifs = [], isLoading: tarifsLoading } = useTarifs();
  const saisonTarifs = tarifs[0]?.saison;

  return (
  <>
    <SEO
      title="Inscriptions 2026/2027"
      description="Inscrivez-vous au Val d'Yerres Handball pour la saison 2026/2027. Contactez-nous à vyhandball@gmail.com. Tarifs, documents requis et règlement intérieur."
      canonical="/inscriptions"
      breadcrumb={[
        { name: "Accueil", url: "/" },
        { name: "Inscriptions", url: "/inscriptions" },
      ]}
    />

    {/* Page Hero */}
    <section className="relative pb-12 overflow-hidden">
      <div className="hero-orb w-[450px] h-[450px] bg-orange-600/12 top-[-120px] right-[-100px]" style={{ animationDuration: "13s" }} />
      <div className="hero-orb w-[300px] h-[300px] bg-red-800/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "17s", animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="eyebrow mb-5 inline-flex">Saison 2026/2027</span>
          <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            <span className="gradient-text">Inscriptions</span>
          </h1>
          <p className="text-white/45 text-lg max-w-2xl leading-relaxed mx-auto">
            Tout ce qu'il faut savoir pour rejoindre ou renouveler votre licence au Val d'Yerres Handball.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Content */}
    <section className="pb-24">
      <div className="container-narrow px-4 md:px-6 max-w-5xl space-y-20">

        {/* ─── Planning ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={Calendar} title="Planning des entraînements" />

          {collectifsLoading ? (
            <PlanningSkeleton />
          ) : (
            <>
              {/* Mobile cards — lieu visible */}
              <div className="sm:hidden space-y-2">
                {planning.map((row, i) => (
                  <div key={i} className="glass-premium rounded-xl p-4 border border-white/[0.06]">
                    <p className="font-display font-semibold text-white text-sm">{row.categorie}</p>
                    <p className="text-sm text-orange-400 font-medium mt-1 whitespace-pre-line">{row.horaires}</p>
                    <p className="text-xs text-white/55 mt-0.5 whitespace-pre-line">{row.lieu}</p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block rounded-2xl overflow-hidden border border-white/[0.07]">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                      <th className="text-left px-6 py-4 font-display font-bold text-white/60 text-xs uppercase tracking-[0.15em]">Catégorie</th>
                      <th className="text-left px-6 py-4 font-display font-bold text-white/60 text-xs uppercase tracking-[0.15em]">Horaires</th>
                      <th className="text-left px-6 py-4 font-display font-bold text-white/60 text-xs uppercase tracking-[0.15em]">Lieu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planning.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-white">{row.categorie}</td>
                        <td className="px-6 py-4 text-orange-400 font-display font-semibold whitespace-pre-line">{row.horaires}</td>
                        <td className="px-6 py-4 text-white/40 whitespace-pre-line">{row.lieu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* ─── Tarifs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader
            icon={Euro}
            title={saisonTarifs ? `Tarifs saison ${saisonTarifs}` : "Tarifs"}
            accent="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          {tarifsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-[68px] rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {tarifs.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative rounded-2xl p-5 flex items-center justify-between overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${TARIF_ACCENTS[i % TARIF_ACCENTS.length]} opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  <span className="relative font-medium text-white/80 text-sm mr-3">{t.libelle}</span>
                  <span className="relative font-display font-black text-xl text-orange-400 shrink-0">{Number(t.montant)} €</span>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-5 space-y-1.5 max-w-2xl">
            <p className="text-xs text-white/30">* Cotisation annuelle, licence FFHB incluse.</p>
            <p className="text-sm text-orange-400 font-display font-bold">
              Pass'sport accepté · LABAZ · Chèque mairie · ANCV
            </p>
          </div>
        </motion.div>

        {/* ─── Documents ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={FileText} title="Documents requis" accent="text-blue-400" bg="bg-blue-500/10" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mineurs */}
            <div className="glass-premium rounded-2xl p-6 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-5">
                <UserPlus size={18} className="text-orange-400" />
                <span className="font-display font-black text-white">Inscription Mineurs</span>
                <span className="rounded-full bg-orange-500/10 text-orange-400 px-2.5 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider">–18 ans</span>
              </div>
              <ul className="space-y-3">
                {docsMineurs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-orange-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/45 leading-relaxed">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Majeurs */}
            <div className="glass-premium rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-5">
                <UserCheck size={18} className="text-blue-400" />
                <span className="font-display font-black text-white">Inscription Majeurs</span>
                <span className="rounded-full bg-blue-500/10 text-blue-400 px-2.5 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider">+18 ans</span>
              </div>
              <ul className="space-y-3">
                {docsMajeurs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/45 leading-relaxed">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 text-sm text-white/40 max-w-2xl">
            <AlertCircle size={16} className="text-orange-400 shrink-0 mt-0.5" />
            <p>Pour les renouvellements, le certificat médical n'est requis que si vous répondez OUI à l'une des questions du questionnaire de santé QS-SPORT.</p>
          </div>
        </motion.div>

        {/* ─── Nouvelle inscription ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={UserPlus} title="Première inscription" />
          <p className="text-white/45 text-sm mb-8 max-w-2xl leading-relaxed mx-auto text-center">
            Venez essayer nos séances gratuitement, puis contactez-nous pour finaliser votre inscription.
          </p>
          <Steps steps={stepsInscription} />
          <ContactEmailBlock />
        </motion.div>

        {/* ─── Renouvellement ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={RefreshCw} title="Renouvellement de licence" accent="text-violet-400" bg="bg-violet-500/10" />
          <p className="text-white/45 text-sm mb-8 max-w-2xl leading-relaxed mx-auto text-center">
            Vous êtes déjà licencié(e) ? Voici la procédure simplifiée pour renouveler votre inscription pour la prochaine saison.
          </p>
          <Steps steps={stepsReinscription} accent="hsl(265 85% 55%)" />
          <ContactEmailBlock />
        </motion.div>

        {/* ─── Règlement intérieur ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={FileText} title="Règlement intérieur" accent="text-white/60" bg="bg-white/[0.05]" />
          <p className="text-white/45 text-sm mb-3 max-w-2xl mx-auto text-center">
            Le présent Règlement Intérieur s'applique à tous les membres de l'association du VYHB ainsi qu'aux représentants légaux des membres mineurs. En vous inscrivant, vous vous engagez à le respecter.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {["Dispositions Générales (Art. 1–11)", "Activités Sportives (Art. 12–15)", "Bonne Conduite (Art. 16–17)", "Données & Droits (Art. 18–21)"].map((tag) => (
              <span key={tag} className="eyebrow text-[10px]">{tag}</span>
            ))}
          </div>
          <Accordion items={reglementInterieur} />
        </motion.div>

        {/* ─── CTA Contact ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-10 text-center overflow-hidden border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-orange-600/[0.08] blur-3xl" />
          <h3 className="font-display font-black text-2xl text-white mb-3">
            Des questions sur les inscriptions ?
          </h3>
          <p className="text-white/45 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Notre trésorière est disponible pour vous accompagner. N'hésitez pas à nous contacter.
          </p>
          <Link to="/contact" className="btn-primary gap-2">
            Nous contacter <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </section>
  </>
  );
};

export default Registration;

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Landmark, Briefcase, Mail } from "lucide-react";
import SEO from "@/components/SEO";

const partnersList = [
  {
    name: "Mairie de Boussy-Saint-Antoine",
    type: "Institutionnel",
    desc: "Soutien aux infrastructures sportives et aux activités du club. Mise à disposition du gymnase municipal.",
    icon: Landmark,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    name: "Mairie de Quincy-sous-Sénart",
    type: "Institutionnel",
    desc: "Partenaire institutionnel du Val d'Yerres Handball. Soutien logistique aux déplacements.",
    icon: Landmark,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    name: "Mairie d'Épinay-sous-Sénart",
    type: "Institutionnel",
    desc: "Partenaire institutionnel du Val d'Yerres Handball. Engagement pour le sport local.",
    icon: Landmark,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    name: "Confort Service",
    type: "Entreprise",
    desc: "Partenaire privé du Val d'Yerres Handball. Soutien financier aux équipes du club.",
    icon: Briefcase,
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
];

const formules = [
  { tier: "Bronze", desc: "Visibilité sur le site web, mention dans les communications.", price: "Sur devis" },
  { tier: "Argent", desc: "Logo sur les maillots, affichage au gymnase, communication réseaux sociaux.", price: "Sur devis" },
  { tier: "Or", desc: "Partenariat premium : logo maillots, naming événement, contenu dédié.", price: "Sur devis" },
];

const Partners = () => (
  <>
    <SEO
      title="Partenaires"
      description="Partenaires du Val d'Yerres Handball : Mairie de Boussy-Saint-Antoine, Quincy-sous-Sénart, Épinay-sous-Sénart et Confort Service. Rejoignez notre réseau en Essonne."
      canonical="/partenaires"
      breadcrumb={[
        { name: "Accueil", url: "/" },
        { name: "Partenaires", url: "/partenaires" },
      ]}
    />

    {/* Page Hero */}
    <section className="relative pb-12 overflow-hidden">
      <div className="hero-orb w-[400px] h-[400px] bg-blue-600/10 top-[-100px] right-[-80px]" style={{ animationDuration: "16s" }} />
      <div className="hero-orb w-[280px] h-[280px] bg-orange-600/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "20s", animationDelay: "3s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="eyebrow mb-5 block w-fit">Val d'Yerres Handball</span>
          <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Nos <span className="gradient-text">Partenaires</span>
          </h1>
          <p className="text-white/45 text-lg max-w-lg leading-relaxed">
            Ils nous accompagnent et rendent possible notre aventure sportive.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Partenaires */}
    <section className="pb-20">
      <div className="container-narrow px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 max-w-3xl">
          {partnersList.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`glass-premium rounded-2xl p-6 border ${p.border} hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={p.accent} />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[10px] font-display font-bold uppercase tracking-[0.2em] ${p.accent} block mb-1`}>{p.type}</span>
                    <h3 className="font-display font-bold text-white text-base leading-tight mb-2">{p.name}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Devenir partenaire */}
    <section className="relative py-20 overflow-hidden" style={{ background: "hsl(220 30% 4%)" }}>
      <div className="hero-orb w-[400px] h-[400px] bg-orange-600/[0.07] top-[-100px] left-[-80px]" style={{ animationDuration: "18s" }} />
      <div className="hero-orb w-[300px] h-[300px] bg-blue-600/[0.06] bottom-[-80px] right-[-60px]" style={{ animationDuration: "22s", animationDelay: "4s" }} />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "var(--gradient-accent)", opacity: 0.3 }} />

      <div className="relative container-narrow px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="eyebrow mb-4 block w-fit mx-auto">Partenariat</span>
          <h2 className="font-display font-black text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Associez votre image au club
          </h2>
          <p className="text-white/45 max-w-lg mx-auto leading-relaxed">
            Le Val d'Yerres Handball, c'est 245 licenciés, des familles engagées et une visibilité locale forte. Plusieurs formules de partenariat sont disponibles selon vos objectifs.
          </p>
        </motion.div>

        {/* Formules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12 max-w-3xl mx-auto">
          {formules.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-premium rounded-2xl p-6 text-center border ${
                i === 2
                  ? "border-orange-500/35 shadow-[0_0_30px_rgba(249,115,22,0.1)]"
                  : "border-white/[0.06]"
              }`}
            >
              {i === 2 && (
                <span className="eyebrow text-[10px] mb-3 block">Premium</span>
              )}
              <p className={`font-display font-black text-xl mb-2 ${
                i === 2 ? "gradient-text" : "text-white"
              }`}>{f.tier}</p>
              <p className="text-sm text-white/40 leading-relaxed mb-4">{f.desc}</p>
              <span className="text-xs font-display font-bold text-white/25 uppercase tracking-wider">{f.price}</span>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            <Mail size={16} />
            Nous contacter pour un partenariat
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default Partners;

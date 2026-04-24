import { motion } from "framer-motion";
import { ShoppingBag, Shirt, Package, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ghostProducts = [
  { icon: Shirt, label: "Maillot domicile", sub: "Collection 2026/2027" },
  { icon: Shirt, label: "Maillot extérieur", sub: "Collection 2026/2027" },
  { icon: Package, label: "Survêtement", sub: "Tenue officielle" },
  { icon: Package, label: "Sac de sport", sub: "Equipement club" },
];

const Shop = () => (
  <>
    {/* Page Hero */}
    <section className="relative pb-12 overflow-hidden">
      <div className="hero-orb w-[420px] h-[420px] bg-orange-600/12 top-[-100px] right-[-80px]" style={{ animationDuration: "14s" }} />
      <div className="hero-orb w-[280px] h-[280px] bg-red-800/10 bottom-[-60px] left-[-40px]" style={{ animationDuration: "18s", animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      <div className="relative container-narrow px-4 md:px-6 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="eyebrow mb-5 block w-fit">Val d'Yerres Handball</span>
          <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            La <span className="gradient-text">Boutique</span>
          </h1>
          <p className="text-white/45 text-lg max-w-lg leading-relaxed">
            Équipez-vous aux couleurs du Val d'Yerres Handball.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Coming soon */}
    <section className="pb-24">
      <div className="container-narrow px-4 md:px-6">

        {/* Badge + Message principal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative rounded-3xl p-10 md:p-14 text-center mb-12 overflow-hidden border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-orange-600/[0.06] blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-red-600/[0.05] blur-3xl" />

          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={38} className="text-orange-400" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-orange-500/20"
              style={{ background: "rgba(249,115,22,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider">Bientôt disponible</span>
            </div>

            <h2 className="font-display font-black text-white mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              Boutique en ligne à venir
            </h2>
            <p className="text-white/45 leading-relaxed mb-3 max-w-md mx-auto">
              Maillots, survêtements et accessoires aux couleurs du club seront bientôt disponibles en ligne.
            </p>
            <p className="text-sm text-white/30 max-w-md mx-auto">
              En attendant, contactez-nous directement pour toute commande d'équipement ou de maillot.
            </p>
          </div>
        </motion.div>

        {/* Ghost product grid */}
        <div className="mb-14">
          <p className="text-xs font-display font-bold text-white/20 uppercase tracking-[0.2em] text-center mb-6">Aperçu de la collection</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ghostProducts.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/[0.05] p-6 flex flex-col items-center text-center opacity-40"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Icon size={26} className="text-white/40" />
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/[0.07] mb-2" />
                  <div className="w-3/4 h-2 rounded-full bg-white/[0.04]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-orange-500/20"
          style={{ background: "rgba(249,115,22,0.05)" }}
        >
          <div>
            <p className="font-display font-black text-white text-lg mb-1">Commander maintenant ?</p>
            <p className="text-white/45 text-sm">Contactez-nous par email pour toute commande d'équipement.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="mailto:vyhandball@gmail.com?subject=Commande équipement"
              className="btn-primary gap-2"
            >
              <Mail size={16} />
              Envoyer un email
            </a>
            <Link to="/contact" className="btn-secondary gap-2">
              Formulaire de contact
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  </>
);

export default Shop;

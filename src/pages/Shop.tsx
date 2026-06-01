import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ShoppingBag, ArrowRight } from "lucide-react"
import SEO from "@/components/SEO"

const Shop = () => {
  return (
    <>
      <SEO
        title="Boutique"
        description="La boutique officielle du Val d'Yerres Handball arrive bientôt. Maillots, équipements, accessoires aux couleurs du club."
        canonical="/boutique"
      />

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="hero-orb w-[500px] h-[500px] bg-orange-600/15 top-[-120px] right-[-100px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[400px] h-[400px] bg-red-700/10 bottom-[-80px] left-[-80px]" style={{ animationDuration: "18s", animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative container-narrow px-4 md:px-6 text-center">

          {/* Icône animée */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex items-center justify-center mb-10"
          >
            <div className="relative w-28 h-28 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ShoppingBag size={52} className="text-orange-400" />
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl border border-orange-500/30"
              />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-orange-500/20"
            style={{ background: "rgba(249,115,22,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider">Bientôt disponible !</span>
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="font-display font-black mb-5"
            style={{ fontSize: "clamp(3rem, 9vw, 6rem)" }}
          >
            <span className="gradient-text">Boutique</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-white/50 text-lg max-w-md mx-auto leading-relaxed mb-10"
          >
            La boutique officielle du Val d'Yerres Handball arrive très bientôt.
            Maillots, équipements, accessoires… restez connectés !
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Link to="/contact" className="btn-primary gap-2">
              Nous contacter <ArrowRight size={15} />
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  )
}

export default Shop

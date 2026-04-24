import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Shield, RotateCcw } from "lucide-react"
import SEO from "../components/SEO"
import ProductCard from "../components/ProductCard"
import { produits } from "../data/produits"

type Categorie = 'tout' | 'maillot' | 'tenue' | 'accessoire'

const FILTRES: { label: string; value: Categorie }[] = [
  { label: "Tout", value: "tout" },
  { label: "Maillots", value: "maillot" },
  { label: "Tenues", value: "tenue" },
  { label: "Accessoires", value: "accessoire" },
]

const Shop = () => {
  const [categorie, setCategorie] = useState<Categorie>("tout")

  const produitsFiltres = categorie === "tout"
    ? produits
    : produits.filter(p => p.categorie === categorie)

  return (
    <>
      <SEO
        title="Boutique"
        description="La boutique officielle du Val d'Yerres Handball. Maillots, tenues et accessoires aux couleurs du club. Saison 2026/2027."
        canonical="/boutique"
      />

      {/* Hero */}
      <section className="relative pb-12 overflow-hidden">
        <div className="hero-orb w-[500px] h-[500px] bg-red-700/15 top-[-120px] right-[-100px]" style={{ animationDuration: "14s" }} />
        <div className="hero-orb w-[300px] h-[300px] bg-orange-600/10 bottom-[-60px] left-[-60px]" style={{ animationDuration: "18s", animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />

        <div className="relative container-narrow px-4 md:px-6 pt-12 pb-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border border-orange-500/20" style={{ background: "rgba(249,115,22,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider">Nouvelles collections 2026/2027</span>
            </div>
            <h1 className="font-display font-black mb-4" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              La <span className="gradient-text">Boutique</span> VYHB
            </h1>
            <p className="text-white/45 text-lg max-w-lg leading-relaxed">
              Portez les couleurs du club. Équipements officiels, tenues techniques et accessoires pour toute la famille.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filtres */}
      <section className="container-narrow px-4 md:px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {FILTRES.map(f => (
            <button
              key={f.value}
              onClick={() => setCategorie(f.value)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                categorie === f.value
                  ? "bg-red-600 border-red-600 text-white shadow-[0_4px_16px_rgba(204,0,0,0.35)]"
                  : "border-white/10 text-white/55 hover:text-white hover:border-white/20 bg-white/[0.03]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Grille produits */}
      <section className="container-narrow px-4 md:px-6 mb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={categorie}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {produitsFiltres.map(p => (
              <ProductCard key={p.id} produit={p} />
            ))}
          </motion.div>
        </AnimatePresence>

        {produitsFiltres.length === 0 && (
          <p className="text-white/30 text-center py-16">Aucun produit dans cette catégorie.</p>
        )}
      </section>

      {/* Bannière avantages */}
      <section className="container-narrow px-4 md:px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
            <div className="flex items-center gap-3 sm:pr-4 pb-4 sm:pb-0">
              <Package size={20} className="text-orange-400 shrink-0" />
              <span className="text-white/60 text-sm">Livraison offerte dès <strong className="text-white">80 €</strong> d'achat</span>
            </div>
            <div className="flex items-center gap-3 sm:px-4 py-4 sm:py-0">
              <RotateCcw size={20} className="text-orange-400 shrink-0" />
              <span className="text-white/60 text-sm">Retours acceptés sous <strong className="text-white">30 jours</strong></span>
            </div>
            <div className="flex items-center gap-3 sm:pl-4 pt-4 sm:pt-0">
              <Shield size={20} className="text-orange-400 shrink-0" />
              <span className="text-white/60 text-sm"><strong className="text-white">Paiement sécurisé</strong> — bientôt disponible</span>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  )
}

export default Shop

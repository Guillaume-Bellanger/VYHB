import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, ChevronRight, AlertCircle, Minus, Plus } from "lucide-react"
import SEO from "../components/SEO"
import ProductCard from "../components/ProductCard"
import { produits } from "../data/produits"
import { useCartStore } from "../store/cartStore"

export default function ProduitDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)

  const produit = produits.find(p => p.id === id)

  const [imageIdx, setImageIdx] = useState(0)
  const [taille, setTaille] = useState<string | undefined>(produit?.tailles?.[0])
  const [couleur, setCouleur] = useState<string | undefined>(produit?.couleurs?.[0])
  const [quantite, setQuantite] = useState(1)

  if (!produit) {
    return (
      <div className="container-narrow px-4 py-24 text-center">
        <p className="text-white/40 mb-4">Produit introuvable.</p>
        <button onClick={() => navigate("/boutique")} className="btn-primary">
          Retour à la boutique
        </button>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantite; i++) {
      addItem(produit, taille, couleur)
    }
  }

  const suggestions = produits
    .filter(p => p.categorie === produit.categorie && p.id !== produit.id)
    .slice(0, 3)

  const BADGE_STYLES: Record<string, string> = {
    Nouveau: "bg-red-600 text-white",
    Promo: "bg-orange-500 text-white",
    Bestseller: "bg-yellow-500 text-black",
  }

  return (
    <>
      <SEO
        title={produit.nom}
        description={produit.description}
        canonical={`/boutique/${produit.id}`}
        breadcrumb={[
          { name: "Accueil", url: "/" },
          { name: "Boutique", url: "/boutique" },
          { name: produit.nom, url: `/boutique/${produit.id}` },
        ]}
      />

      <section className="container-narrow px-4 md:px-6 pt-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-white/35 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <Link to="/boutique" className="hover:text-white transition-colors">Boutique</Link>
          <ChevronRight size={12} />
          <span className="text-white/60 line-clamp-1">{produit.nom}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galerie images */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-white/[0.07] mb-3">
              <img
                src={produit.images[imageIdx]}
                alt={produit.nom}
                className="w-full h-full object-cover"
              />
              {produit.badge && (
                <span className={`absolute top-4 left-4 text-xs font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full ${BADGE_STYLES[produit.badge]}`}>
                  {produit.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {produit.images.length > 1 && (
              <div className="flex gap-2">
                {produit.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      imageIdx === i ? "border-red-500" : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Infos produit */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <span className="text-xs font-display font-bold uppercase tracking-[0.18em] text-orange-400 mb-3">
              {produit.categorie}
            </span>

            <h1 className="font-display font-black text-white mb-4" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
              {produit.nom}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-black text-white text-3xl">{produit.prix.toFixed(2)} €</span>
              {produit.prixBarre && (
                <span className="text-white/35 text-xl line-through">{produit.prixBarre.toFixed(2)} €</span>
              )}
              {produit.prixBarre && (
                <span className="text-orange-400 text-sm font-bold">
                  -{Math.round((1 - produit.prix / produit.prixBarre) * 100)}%
                </span>
              )}
            </div>

            <p className="text-white/55 leading-relaxed mb-8 text-sm">
              {produit.description}
            </p>

            {/* Sélecteur taille */}
            {produit.tailles && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
                  Taille : <span className="text-white">{taille}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {produit.tailles.map(t => (
                    <button
                      key={t}
                      onClick={() => setTaille(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                        taille === t
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sélecteur couleur */}
            {produit.couleurs && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">
                  Couleur : <span className="text-white">{couleur}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {produit.couleurs.map(c => (
                    <button
                      key={c}
                      onClick={() => setCouleur(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                        couleur === c
                          ? "bg-red-600 border-red-600 text-white"
                          : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">Quantité</p>
              <div className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-2">
                <button
                  onClick={() => setQuantite(q => Math.max(1, q - 1))}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-white font-bold w-6 text-center">{quantite}</span>
                <button
                  onClick={() => setQuantite(q => q + 1)}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Stock limité */}
            {produit.stock < 10 && (
              <div className="flex items-center gap-2 mb-4 text-orange-400 text-xs font-semibold">
                <AlertCircle size={14} />
                Stock limité — plus que {produit.stock} disponible{produit.stock > 1 ? "s" : ""}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-bold text-base transition-all shadow-[0_8px_24px_rgba(204,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(204,0,0,0.55)] mt-auto"
            >
              <ShoppingCart size={20} />
              Ajouter au panier — {(produit.prix * quantite).toFixed(2)} €
            </button>
          </motion.div>
        </div>
      </section>

      {/* Vous aimerez aussi */}
      {suggestions.length > 0 && (
        <section className="container-narrow px-4 md:px-6 pb-20">
          <h2 className="font-display font-black text-white text-xl mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(p => (
              <ProductCard key={p.id} produit={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

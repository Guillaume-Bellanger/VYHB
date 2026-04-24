import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Produit } from "../data/produits"
import { useCartStore } from "../store/cartStore"

const BADGE_STYLES: Record<string, string> = {
  Nouveau: "bg-red-600 text-white",
  Promo: "bg-orange-500 text-white",
  Bestseller: "bg-yellow-500 text-black",
}

interface ProductCardProps {
  produit: Produit
}

export default function ProductCard({ produit }: ProductCardProps) {
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(produit, produit.tailles?.[0])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(`/boutique/${produit.id}`)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03] hover:border-white/20 transition-all duration-300 hover:shadow-[0_20px_48px_rgba(0,0,0,0.45)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={produit.images[0]}
          alt={produit.nom}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {produit.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BADGE_STYLES[produit.badge]}`}>
            {produit.badge}
          </span>
        )}

        {/* Stock limité */}
        {produit.stock < 10 && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold text-orange-400 bg-orange-500/15 border border-orange-500/25 px-2 py-0.5 rounded-full">
            Stock limité
          </span>
        )}

        {/* Bouton panier au hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            <ShoppingCart size={16} />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
          {produit.categorie}
        </p>
        <h3 className="font-display font-bold text-white text-sm leading-snug mb-2 group-hover:text-orange-400 transition-colors">
          {produit.nom}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-white text-base">
            {produit.prix.toFixed(2)} €
          </span>
          {produit.prixBarre && (
            <span className="text-white/35 text-sm line-through">
              {produit.prixBarre.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

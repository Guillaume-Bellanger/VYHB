import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { useCartStore } from "../store/cartStore"

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantite, total, totalItems } = useCartStore()

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-white/[0.08] bg-[#0d0d0f] [&>button:first-of-type]:hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-white/[0.08] bg-red-600/90 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-white font-display font-black flex items-center gap-2">
            <ShoppingBag size={20} />
            Mon Panier
            {totalItems() > 0 && (
              <span className="ml-1 text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">
                {totalItems()}
              </span>
            )}
          </SheetTitle>
          <button
            onClick={toggleCart}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </SheetHeader>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                <ShoppingBag size={28} className="text-white/25" />
              </div>
              <p className="text-white/40 text-sm">Votre panier est vide</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item, idx) => (
                <li key={`${item.produit.id}-${item.taille ?? idx}`} className="flex gap-3 pb-4 border-b border-white/[0.06] last:border-0">
                  {/* Image miniature */}
                  <img
                    src={item.produit.images[0]}
                    alt={item.produit.nom}
                    className="w-16 h-20 object-cover rounded-xl border border-white/[0.06] shrink-0"
                  />

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
                          {item.produit.nom}
                        </p>
                        {item.taille && (
                          <p className="text-white/40 text-xs mt-0.5">Taille : {item.taille}</p>
                        )}
                        {item.couleur && (
                          <p className="text-white/40 text-xs">Couleur : {item.couleur}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.produit.id, item.taille)}
                        className="text-white/30 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Contrôle quantité */}
                      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04]">
                        <button
                          onClick={() => updateQuantite(item.produit.id, item.taille, item.quantite - 1)}
                          className="px-2 py-1 text-white/60 hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white text-sm font-semibold w-4 text-center">{item.quantite}</span>
                        <button
                          onClick={() => updateQuantite(item.produit.id, item.taille, item.quantite + 1)}
                          className="px-2 py-1 text-white/60 hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-white font-bold text-sm">
                        {(item.produit.prix * item.quantite).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/[0.08] bg-white/[0.02]">
            {/* Bannière livraison */}
            {total() < 80 && (
              <p className="text-[11px] text-white/40 text-center mb-4">
                Plus que <span className="text-orange-400 font-bold">{(80 - total()).toFixed(2)} €</span> pour la livraison offerte
              </p>
            )}
            {total() >= 80 && (
              <p className="text-[11px] text-green-400 text-center mb-4 font-semibold">
                Livraison offerte !
              </p>
            )}

            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-sm">Total</span>
              <span className="text-white font-display font-black text-xl">{total().toFixed(2)} €</span>
            </div>

            <button
              disabled
              className="w-full py-3.5 rounded-xl bg-white/10 text-white/40 font-semibold text-sm cursor-not-allowed mb-3 border border-white/[0.06]"
            >
              Commander — Bientôt disponible
            </button>

            <button
              onClick={toggleCart}
              className="w-full py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-sm font-semibold transition-all"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

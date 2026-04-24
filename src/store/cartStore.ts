import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Produit } from '../data/produits'

export interface CartItem {
  produit: Produit
  quantite: number
  taille?: string
  couleur?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (produit: Produit, taille?: string, couleur?: string) => void
  removeItem: (id: string, taille?: string) => void
  updateQuantite: (id: string, taille: string | undefined, quantite: number) => void
  clearCart: () => void
  toggleCart: () => void
  total: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (produit, taille, couleur) => {
        const existing = get().items.find(i => i.produit.id === produit.id && i.taille === taille)
        if (existing) {
          set(state => ({
            items: state.items.map(i =>
              i.produit.id === produit.id && i.taille === taille
                ? { ...i, quantite: i.quantite + 1 }
                : i
            )
          }))
        } else {
          set(state => ({ items: [...state.items, { produit, quantite: 1, taille, couleur }] }))
        }
        set({ isOpen: true })
      },
      removeItem: (id, taille) => set(state => ({
        items: state.items.filter(i => !(i.produit.id === id && i.taille === taille))
      })),
      updateQuantite: (id, taille, quantite) => set(state => ({
        items: quantite === 0
          ? state.items.filter(i => !(i.produit.id === id && i.taille === taille))
          : state.items.map(i => i.produit.id === id && i.taille === taille ? { ...i, quantite } : i)
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      total: () => get().items.reduce((sum, i) => sum + i.produit.prix * i.quantite, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantite, 0),
    }),
    { name: 'vyhb-cart' }
  )
)

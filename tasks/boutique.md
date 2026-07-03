# TÂCHE – Boutique en ligne POC | Val d'Yerres Handball
# Route : /boutique | Intégrée au site existant

---

## CONTEXTE

Ajouter une boutique en ligne **POC** (données fictives) au site Val d'Yerres Handball.
Stack existante : React 18 + TypeScript + Tailwind CSS + shadcn/ui + React Router v6.
La boutique doit être **moderne, premium, donner envie** — s'inspirer des meilleures boutiques de clubs sportifs (PSG Store, Nike, Foot Locker).
Tout est fictif : produits, prix, stock. Aucun vrai paiement.

---

## PLAN

### 1. Lire avant de toucher
- Lire `src/App.tsx` pour voir le routeur
- Lire `src/components/Header.tsx` pour ajouter l'icône panier
- Lire `src/pages/Shop.tsx` s'il existe déjà
- Lire `src/data/collectifs.ts` pour comprendre le format des données

### 2. Fichiers à créer
```
src/data/produits.ts          → données fictives des produits
src/store/cartStore.ts        → état global du panier (zustand ou Context)
src/pages/Shop.tsx            → page principale boutique
src/pages/ProduitDetail.tsx   → page détail produit
src/components/CartDrawer.tsx → panier latéral (drawer)
src/components/ProductCard.tsx → carte produit réutilisable
```

### 3. Ajouter la route dans App.tsx
```
/boutique          → Shop.tsx
/boutique/:id      → ProduitDetail.tsx
```

---

## DONNÉES PRODUITS

Créer `src/data/produits.ts` avec ces produits fictifs :

```ts
export interface Produit {
  id: string
  nom: string
  categorie: 'maillot' | 'tenue' | 'accessoire'
  prix: number
  prixBarre?: number  // prix barré pour les promos
  images: string[]    // URLs placeholder
  description: string
  tailles?: string[]
  couleurs?: string[]
  stock: number
  badge?: 'Nouveau' | 'Promo' | 'Bestseller'
}

export const produits: Produit[] = [
  {
    id: "maillot-domicile-2026",
    nom: "Maillot Domicile 2026/2027",
    categorie: "maillot",
    prix: 49.90,
    images: [
      "https://placehold.co/600x700/cc0000/ffffff?text=Maillot+Domicile",
      "https://placehold.co/600x700/cc0000/ffffff?text=Maillot+Dos"
    ],
    description: "Le maillot officiel domicile du Val d'Yerres Handball pour la saison 2026/2027. Tissu technique respirant, coupe ajustée, broderie du logo du club.",
    tailles: ["XS", "S", "M", "L", "XL", "XXL"],
    couleurs: ["Rouge/Blanc"],
    stock: 50,
    badge: "Nouveau"
  },
  {
    id: "maillot-exterieur-2026",
    nom: "Maillot Extérieur 2026/2027",
    categorie: "maillot",
    prix: 49.90,
    images: [
      "https://placehold.co/600x700/ffffff/cc0000?text=Maillot+Extérieur",
    ],
    description: "Le maillot officiel extérieur du Val d'Yerres Handball. Blanc immaculé avec les détails rouges emblématiques du club.",
    tailles: ["XS", "S", "M", "L", "XL", "XXL"],
    couleurs: ["Blanc/Rouge"],
    stock: 35,
    badge: "Nouveau"
  },
  {
    id: "survetement-club",
    nom: "Survêtement Club VYHB",
    categorie: "tenue",
    prix: 89.90,
    prixBarre: 109.90,
    images: [
      "https://placehold.co/600x700/1a1a1a/cc0000?text=Survêtement",
    ],
    description: "Survêtement officiel du club, veste zippée + pantalon. Idéal pour l'échauffement et les déplacements. Logo VYHB brodé.",
    tailles: ["S", "M", "L", "XL", "XXL"],
    couleurs: ["Noir/Rouge"],
    stock: 20,
    badge: "Promo"
  },
  {
    id: "short-entrainement",
    nom: "Short d'Entraînement",
    categorie: "tenue",
    prix: 29.90,
    images: [
      "https://placehold.co/600x700/cc0000/ffffff?text=Short",
    ],
    description: "Short technique pour l'entraînement. Tissu léger et respirant, coupe sport.",
    tailles: ["S", "M", "L", "XL", "XXL"],
    couleurs: ["Rouge", "Noir"],
    stock: 40
  },
  {
    id: "sac-sport-vyhb",
    nom: "Sac de Sport VYHB",
    categorie: "accessoire",
    prix: 39.90,
    images: [
      "https://placehold.co/600x700/1a1a1a/ffffff?text=Sac+Sport",
    ],
    description: "Sac de sport spacieux aux couleurs du club. Compartiment chaussures séparé, bandoulière réglable. Volume 45L.",
    stock: 25,
    badge: "Bestseller"
  },
  {
    id: "gourde-vyhb",
    nom: "Gourde VYHB 750ml",
    categorie: "accessoire",
    prix: 19.90,
    images: [
      "https://placehold.co/600x700/cc0000/ffffff?text=Gourde",
    ],
    description: "Gourde officielle du club, 750ml, sans BPA. Idéale pour l'entraînement et les matchs.",
    stock: 60,
    badge: "Bestseller"
  },
  {
    id: "bonnet-vyhb",
    nom: "Bonnet VYHB",
    categorie: "accessoire",
    prix: 24.90,
    images: [
      "https://placehold.co/600x700/cc0000/ffffff?text=Bonnet",
    ],
    description: "Bonnet tricoté aux couleurs du club. 100% acrylique, taille unique.",
    couleurs: ["Rouge/Blanc", "Noir/Rouge"],
    stock: 30
  },
  {
    id: "kit-junior",
    nom: "Kit Junior VYHB",
    categorie: "tenue",
    prix: 59.90,
    prixBarre: 79.90,
    images: [
      "https://placehold.co/600x700/cc0000/ffffff?text=Kit+Junior",
    ],
    description: "Kit complet pour les jeunes joueurs : maillot + short + chaussettes. Disponible de 6 à 14 ans.",
    tailles: ["6 ans", "8 ans", "10 ans", "12 ans", "14 ans"],
    couleurs: ["Rouge/Blanc"],
    stock: 15,
    badge: "Promo"
  },
]
```

---

## ÉTAT DU PANIER

Installer zustand pour la gestion d'état :
```bash
npm install zustand
```

Créer `src/store/cartStore.ts` :
```ts
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
  removeItem: (id: string) => void
  updateQuantite: (id: string, quantite: number) => void
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
      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.produit.id !== id) })),
      updateQuantite: (id, quantite) => set(state => ({
        items: quantite === 0
          ? state.items.filter(i => i.produit.id !== id)
          : state.items.map(i => i.produit.id === id ? { ...i, quantite } : i)
      })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      total: () => get().items.reduce((sum, i) => sum + i.produit.prix * i.quantite, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantite, 0),
    }),
    { name: 'vyhb-cart' }
  )
)
```

---

## COMPOSANT PRODUCTCARD

Créer `src/components/ProductCard.tsx` :
- Image produit avec effet hover (zoom léger)
- Badge (Nouveau / Promo / Bestseller) en overlay
- Nom du produit
- Prix (et prix barré si promo)
- Bouton "Ajouter au panier" qui apparaît au hover
- Animation fluide
- Clic sur la carte → navigate vers `/boutique/:id`

---

## COMPOSANT CARTDRAWER

Créer `src/components/CartDrawer.tsx` (drawer latéral droit) :
- S'ouvre automatiquement quand on ajoute un produit
- Liste des articles avec image miniature, nom, taille, quantité, prix
- Contrôles +/- pour modifier la quantité
- Bouton supprimer (×)
- Total en bas
- Bouton "Commander" (désactivé avec mention "Bientôt disponible")
- Bouton "Continuer mes achats" pour fermer
- Utiliser le composant `Sheet` de shadcn/ui

---

## PAGE SHOP (/boutique)

### Hero section
- Fond sombre avec image ou dégradé rouge/noir
- Titre : "La Boutique VYHB"
- Sous-titre : "Portez les couleurs du club"
- Badge "Nouvelles collections 2026/2027"

### Filtres
- Tabs ou boutons filtres : Tout | Maillots | Tenues | Accessoires
- Animation de filtrage fluide (framer-motion si disponible)

### Grille produits
- Grid responsive : 1 col mobile / 2 col tablet / 3 col desktop
- Composant `ProductCard` pour chaque produit
- Animation d'entrée au scroll

### Bannière promo
- Entre la grille et le footer de la page
- "Livraison offerte dès 80€ d'achat | Retours sous 30 jours | Paiement sécurisé"

### SEO
```tsx
<SEO
  title="Boutique"
  description="La boutique officielle du Val d'Yerres Handball. Maillots, tenues et accessoires aux couleurs du club. Saison 2026/2027."
  canonical="/boutique"
/>
```

---

## PAGE PRODUIT DÉTAIL (/boutique/:id)

### Layout
- Images : galerie à gauche (image principale + thumbnails)
- Infos à droite :
  - Badge catégorie
  - Nom du produit (H1)
  - Prix (et prix barré si promo)
  - Description
  - Sélecteur de taille (si applicable) — boutons toggle
  - Sélecteur de couleur (si applicable) — cercles colorés
  - Sélecteur de quantité (+/-)
  - Bouton "Ajouter au panier" (grand, rouge, pleine largeur)
  - Mention "Stock limité" si stock < 10
- Breadcrumb : Accueil > Boutique > [Nom produit]

### Section "Vous aimerez aussi"
- 3 produits aléatoires de la même catégorie

### SEO dynamique
```tsx
<SEO
  title={produit.nom}
  description={produit.description}
  canonical={`/boutique/${produit.id}`}
/>
```

---

## HEADER – ICÔNE PANIER

Dans `src/components/Header.tsx` :
- Ajouter une icône panier (ShoppingCart de lucide-react)
- Badge rouge avec le nombre d'articles si panier non vide
- Clic → ouvre le CartDrawer
- Visible sur desktop et mobile

---

## ROUTING

Dans `src/App.tsx`, ajouter :
```tsx
<Route path="/boutique" element={<Shop />} />
<Route path="/boutique/:id" element={<ProduitDetail />} />
```

---

## DESIGN GUIDELINES

- **Couleurs** : rouge `#cc0000`, noir `#1a1a1a`, blanc, gris clair
- **Typographie** : bold pour les titres produits, clean pour les prix
- **Cards** : coins arrondis, ombre légère, fond blanc
- **Hover effects** : zoom image, apparition bouton, élévation de la card
- **Badges** : coins arrondis, couleurs distinctes (rouge = Nouveau, orange = Promo, or = Bestseller)
- **Bouton panier** : rouge plein, blanc au hover, transition fluide
- **Drawer panier** : fond blanc, ombre gauche prononcée, header rouge

---

## CHECKLIST

- [ ] `npm install zustand`
- [ ] `src/data/produits.ts` créé
- [ ] `src/store/cartStore.ts` créé
- [ ] `src/components/ProductCard.tsx` créé
- [ ] `src/components/CartDrawer.tsx` créé
- [ ] `src/pages/Shop.tsx` créé
- [ ] `src/pages/ProduitDetail.tsx` créé
- [ ] Routes ajoutées dans `App.tsx`
- [ ] Icône panier ajoutée dans `Header.tsx`
- [ ] `CartDrawer` intégré dans `Layout.tsx` ou `App.tsx`
- [ ] Lien "Boutique" ajouté dans la navigation
- [ ] Build sans erreur : `npm run build`
- [ ] Test manuel : ajout produit → panier s'ouvre → total correct

**Commit :** `feat(boutique): POC boutique complète - produits, panier, détail`
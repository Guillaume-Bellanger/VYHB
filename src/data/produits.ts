export interface Produit {
  id: string
  nom: string
  categorie: 'maillot' | 'tenue' | 'accessoire'
  prix: number
  prixBarre?: number
  images: string[]
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
      "https://placehold.co/600x700/cc0000/ffffff?text=Vue+de+face",
      "https://placehold.co/600x700/cc0000/ffffff?text=Vue+de+dos"
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
      "https://placehold.co/600x700/ffffff/cc0000?text=Maillot+Ext%C3%A9rieur",
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
      "https://placehold.co/600x700/1a1a1a/cc0000?text=Surv%C3%AAtement",
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

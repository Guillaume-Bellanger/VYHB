# Refonte navigation & contenu — 2026-04-14

## Terminé ✅

- [x] App.tsx : nouvelles routes (/collectifs, /collectifs/:slug, /boutique)
- [x] Header.tsx : Accueil · Le Club · Nos Collectifs · Partenaires · Inscriptions · Boutique · Contact
- [x] Footer.tsx : liens mis à jour
- [x] Index.tsx : actualités, histoire → /club?tab=historique, nous contacter, coordonnées bas de page
- [x] Club.tsx : 3 sous-onglets via ?tab= (historique, bureau, entraineurs)
- [x] Collectifs.tsx + CollectifDetail.tsx : grille cartes + détail par slug avec CTA inscription
- [x] src/data/collectifs.ts : données centralisées
- [x] Registration.tsx : planning + tarifs + docs mineurs/majeurs + règlement (accordion) + notice réinscription
- [x] Shop.tsx : page boutique "coming soon"
- [x] Build vérifié : 0 erreur TypeScript, build OK en 2s

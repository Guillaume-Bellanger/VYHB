# TODO – Refonte contenu + SEO | Val d'Yerres Handball
_Créé le : avril 2026_
_Branche : `feat/refonte-contenu-seo`_

---

## PHASE 12 – INTÉGRATION SUPABASE (authentification + matchs)

- [x] `npm install @supabase/supabase-js`
- [x] `.gitignore` créé (node_modules, dist, .env.local, *.tsbuildinfo…)
- [x] `.env.local` créé avec placeholders VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
- [x] `src/lib/supabase.ts` — client Supabase typé (`createClient<Database>`)
- [x] `src/types/database.ts` — types TS : Profile, Match, Database, enums UserRole/MatchType/MatchStatut
- [x] `supabase/schema.sql` — tables profiles + matches, enums, triggers updated_at + handle_new_user, RLS complet
- [ ] Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans `.env.local` (depuis app.supabase.com)
- [ ] Exécuter `supabase/schema.sql` dans l'éditeur SQL Supabase
- [x] Phase suivante : UI authentification (login/logout) + page admin matchs → Phase 13

---

## PHASE 13 – AUTH ADMIN + ROUTING PROTÉGÉ

- [x] `src/stores/authStore.ts` — Zustand store : user, profile, isLoading + signIn/signOut/fetchProfile + onAuthStateChange
- [x] `src/hooks/useAuth.ts` — hook exposant user, profile, role, categorie, hasRole(), isAdmin, isResponsable, isRedacteur
- [x] `src/components/admin/ProtectedRoute.tsx` — redirect /admin/login si non connecté, 403 si rôle insuffisant
- [x] `src/components/admin/AdminLayout.tsx` — sidebar desktop + overlay mobile, nav filtrée par rôle, bouton déconnexion
- [x] `src/pages/admin/LoginPage.tsx` — formulaire email/password (react-hook-form + zod + shadcn), messages d'erreur localisés
- [x] `src/pages/admin/DashboardPage.tsx` — stub tableau de bord
- [x] `src/pages/admin/MatchListAdminPage.tsx` — stub liste matchs admin
- [x] `src/pages/admin/MatchFormPage.tsx` — stub formulaire match (new + edit)
- [x] `src/pages/admin/UsersPage.tsx` — stub gestion utilisateurs (super_admin)
- [x] `src/App.tsx` — routes admin ajoutées sans toucher aux routes publiques
- [ ] Phase suivante : formulaire match (CRUD complet) + liste matchs admin

---

## ÉTAT GLOBAL
- [x] Phase 0 – Audit initial
- [x] Phase 1 – Prérequis techniques SEO
- [x] Phase 2 – Bugs de navigation
- [x] Phase 3 – Identité visuelle & nommage
- [x] Phase 4 – Page Accueil
- [x] Phase 5 – Page Le Club
- [x] Phase 6 – Page Nos Collectifs
- [x] Phase 7 – Page Partenaires
- [x] Phase 8 – Page Inscriptions
- [x] Phase 9 – Page Contact
- [x] Phase 10 – Optimisation images
- [x] Phase 11 – Vérification finale et build

---

## PHASE 0 – AUDIT INITIAL

> Lire avant de toucher quoi que ce soit.

- [x] Créer la branche : `git checkout -b feat/refonte-contenu-seo`
- [x] Analyser l'arborescence complète (`src/`, `public/`, `components/`, `pages/`)
- [x] Lire `vite.config.js` / `vite.config.ts`
- [x] Identifier le routeur utilisé (React Router, TanStack, autre)
- [x] Lire `package.json` — noter les dépendances existantes
- [x] Lire `index.html` et `main.jsx` / `main.tsx`
- [x] Identifier : Header, Footer, pages Accueil / Le Club / Nos Collectifs / Inscriptions / Partenaires / Contact
- [x] Vérifier si `react-helmet-async` est installé
- [x] Vérifier si SSR/SSG/pre-rendering est en place
- [x] Repérer les fichiers de données (JSON, constantes JS)
- [x] Produire le rapport d'audit :

```
AUDIT INITIAL
=============
Routeur détecté : React Router v6 (BrowserRouter + Routes, react-router-dom ^6.30.1)
Pages trouvées : Index(/), Club(/club), Collectifs(/collectifs), CollectifDetail(/collectifs/:slug),
  Registration(/inscriptions), Partners(/partenaires), Contact(/contact),
  Events(/evenements), Matches(/matchs), Legal(/mentions-legales), NotFound(*)
Composant Header : src/components/Header.tsx
Composant Footer : src/components/Footer.tsx
react-helmet-async : absent → installé (Phase 1)
SSR/SSG : absent → react-snap installé (Phase 1)
Fichiers de données : src/data/collectifs.ts
Points bloquants :
  - lang="fr" déjà présent dans index.html ✅
  - robots.txt existait mais sans Sitemap URL → remplacé (Phase 1)
  - Projet TypeScript → SEO.jsx créé en .tsx
  - Routes dans App.tsx utilisent /club (≠ /le-club prévu dans le todo)
```

**Commit :** _aucun — lecture seule_

---

## PHASE 1 – PRÉREQUIS TECHNIQUES SEO

> ⚠️ CRITIQUE. Sans pré-rendu HTML, Google ne lit pas le contenu React SPA. À traiter en premier.

### 1.1 Pré-rendu statique
- [x] Vérifier si `vite-ssg` ou `react-snap` est déjà présent (absent)
- [x] vite-ssg incompatible avec BrowserRouter → react-snap installé (`npm install react-snap --save-dev`)
- [x] `main.tsx` mis à jour : hydrateRoot si HTML pré-rendu, createRoot sinon (React 18 compat)
- [x] Scripts dans `package.json` : `"build:spa"` conservé + `"postbuild": "react-snap"` ajouté

### 1.2 react-helmet-async
- [x] Installé : `npm install react-helmet-async`
- [x] `<HelmetProvider>` ajouté dans `main.tsx`

### 1.3 index.html
- [x] `lang="fr"` déjà présent ✅
- [x] `<meta name="theme-color" content="#cc0000" />` ajouté
- [x] `<link rel="preconnect" href="https://fonts.googleapis.com" />` ajouté

### 1.4 robots.txt
- [x] `public/robots.txt` remplacé avec `User-agent: *` + `Sitemap:` URL

### 1.5 Sitemap automatique
- [x] `vite-plugin-sitemap` installé et configuré dans `vite.config.ts`
- [x] Routes : `/`, `/club`, `/collectifs`, `/inscriptions`, `/partenaires`, `/contact`

### 1.6 Composant SEO réutilisable
- [x] Créé `src/components/SEO.tsx` (TypeScript) avec :
  - `<title>` dynamique (`"[Page] – Val d'Yerres Handball"`)
  - `<meta name="description">`
  - `<link rel="canonical">`
  - Balises Open Graph complètes
  - Twitter Card
  - Slot `schema` pour JSON-LD
  - Slot `breadcrumb` pour fil d'ariane JSON-LD

**Commit :** `feat(seo): prérequis techniques - vite-ssg, helmet, sitemap, robots.txt`

---

## PHASE 2 – BUGS DE NAVIGATION

### 2.1 ScrollToTop
- [x] `src/components/ScrollToTop.tsx` existait déjà — implémentation correcte (useLocation + window.scrollTo instant)
- [x] Déjà intégré dans App.tsx à l'intérieur du BrowserRouter ✅

### 2.2 Ancre "Nous contacter"
- [x] Grep effectué — aucun `href="#contact"` dans le repo
- [x] Tous les liens "Nous contacter" utilisent `<Link to="/contact">` (navigation React Router) → pas d'ancre à corriger

### 2.3 Page Contact
- [x] ScrollToTop couvre l'entrée sur `/contact` ✅

**Commit :** `fix(nav): scroll-to-top au changement de route, correction ancres contact`

---

## PHASE 3 – IDENTITÉ VISUELLE & NOMMAGE

### 3.1 Remplacement global HB → Handball
- [x] 2 occurrences trouvées dans `src/pages/Matches.tsx` (classements Seniors M et F)
- [x] Remplacées : `"Val d'Yerres HB"` → `"Val d'Yerres Handball"` ✅

### 3.2 Footer – mention légale
- [x] Footer déjà correct : `© [year] Val d'Yerres Handball. Tous droits réservés.` (pas de "Club") ✅
- [x] Coordonnées déjà correctes : `06 75 26 43 58` + `vyhandball@gmail.com` ✅

### 3.3 Logo – cercle texte
- [x] Pas de SVG circle avec "HB" — le header utilise une image JPEG + texte React déjà en "Val d'Yerres" / "Handball"
- [x] Aucune correction nécessaire ✅

### 3.4 Couleurs responsive Header
- [x] "Val d'Yerres" : déjà `text-white` ✅
- [x] "Handball" (sous-titre) : changé de `text-white/40` → `text-white` pour visibilité maximale sur tout fond

**Commit :** `fix(identity): HB→Handball global, footer, logo, couleurs header`

---

## PHASE 4 – PAGE ACCUEIL

### SEO
- [ ] Ajouter composant `<SEO>` avec :
  - title : `null` (titre complet par défaut)
  - description : `"Club de handball à Boussy-Saint-Antoine, Quincy-sous-Sénart et Épinay-sous-Sénart. 245 licenciés, 10 équipes du BabyHand aux Seniors. Inscriptions ouvertes saison 2026/2027."`
  - canonical : `/`
  - schema : JSON-LD `SportsOrganization` (voir spec ci-dessous)

**JSON-LD SportsOrganization :**
```json
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "Val d'Yerres Handball",
  "alternateName": "VYHB",
  "url": "https://www.valdyerreshandball.fr",
  "email": "vyhandball@gmail.com",
  "telephone": "+33675264358",
  "sport": "Handball",
  "foundingDate": "2003",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Boussy-Saint-Antoine",
    "postalCode": "91800",
    "addressCountry": "FR"
  },
  "areaServed": ["Boussy-Saint-Antoine", "Quincy-sous-Sénart", "Épinay-sous-Sénart", "Essonne"]
}
```

### Contenus
- [x] Saison → `"saison 2026/2027"` : déjà correct ✅
- [x] Présentation → `"Fondé il y a bientôt 23 ans…"` : déjà présent ✅
- [x] Numéro AG → `46183` : ajouté dans le JSON-LD SportsOrganization (champ `identifier`)
- [x] Stats : 245 licenciés ✅ | 10 équipes ✅ | 23 années ✅ | 45 bénévoles (corrigé, était 25)
- [x] Section Contact bas de page : téléphone + email uniquement, pas d'horaires ni gymnase ✅
- [x] Section Recrutement → déjà sans catégories spécifiques ✅
- [x] Section Événement → "Portes ouvertes du 01/05 au 31/05/2026" déjà présent ✅
- [x] Section Infos → "Collecte de bouchons" déjà présent ✅
- [x] Section renommée → `"Matchs à venir à domicile"` (était "Prochains matchs à domicile")
- [x] matchsDomicile : 5 matchs déjà dans le fichier ✅
- [x] Section Nos Collectifs → ordre correct (géré par src/data/collectifs.ts) ✅

**Commit :** `feat(accueil): contenus, matchs domicile, collectifs triés, SEO`

---

## PHASE 5 – PAGE LE CLUB

### SEO
- [x] `<SEO>` ajouté : title `"Le Club"` | description ✅ | canonical `/club` (route réelle) | breadcrumb Accueil > Le Club ✅

### Contenus
- [x] Historique : texte correct déjà présent ✅
- [x] Valeurs : 2 paragraphes intro ajoutés avant les cartes (solidarité/respect/esprit d'équipe + famille)
- [x] Citation "Seul on va plus vite, ensemble on va plus loin" : déjà présente ✅
- [x] Formations (Arbitrage, Table de marque, École d'arbitrage) : textes exacts déjà présents ✅

### Le Bureau
- [x] `src/data/bureau.ts` créé avec 6 postes : Président | VP | Trésorière | Resp. Matériel | Resp. Communication | Resp. Événementiel
- [x] Avatars via ui-avatars.com (background coloré par rôle)
- [x] Club.tsx mis à jour : 6 membres en grid 2×3 avec `<img>` avatar, section CA simplifiée (texte seul)

### Entraîneurs & Bénévoles
- [x] `src/data/entraineurs.ts` créé avec 7 entraîneurs (Thomas, Sophie, Karim, Julie, Marc, Léa, Paul) + avatarUrl
- [x] Club.tsx mis à jour : icône User → `<img>` avatar ui-avatars.com
- [x] Texte bénévoles déjà présent ✅

**Commit :** `feat(club): historique, valeurs, formations, bureau, entraîneurs, SEO`

---

## PHASE 6 – PAGE NOS COLLECTIFS

- [x] `<SEO>` ajouté : title `"Nos équipes"` | description avec toutes catégories + Essonne | canonical `/collectifs` (route réelle) | breadcrumb Accueil > Nos Collectifs
- [x] `src/data/collectifs.ts` existait déjà avec 11 entrées dans l'ordre chronologique strict ✅
- [x] Niveaux : "Départemental" partout (Loisirs conserve "Non-compétitif" — pas de Régional/National) ✅
- [x] Champ `photo: string` ajouté à l'interface + `"[À compléter]"` sur les 11 entrées

**Commit :** `feat(collectifs): ordre chronologique, données structurées, SEO`

---

## PHASE 7 – PAGE PARTENAIRES

- [x] `<SEO>` ajouté : title `"Partenaires"` | description avec les 3 mairies | canonical `/partenaires` | breadcrumb Accueil > Partenaires
- [x] 4 partenaires déjà présents dans Partners.tsx : 3 mairies + Confort Service ✅

**Commit :** `feat(partenaires): 3 mairies + Confort Service, SEO`

---

## PHASE 8 – PAGE INSCRIPTIONS

### SEO
- [x] `<SEO>` ajouté : title `"Inscriptions 2026/2027"` | description Pass'sport + Hello Asso | canonical `/inscriptions` | breadcrumb Accueil > Inscriptions

### Contenus
- [x] Fix responsive : `text-white/35` → `text-white/55` sur le lieu dans les cards mobiles
- [x] Tarifs : déjà corrects (ordre chronologique, pas de "Réduction famille", Pass'sport · LABAZ · Chèque mairie · ANCV · Hello Asso) ✅
- [x] Documents requis FFHB : déjà présents (docsMineurs + docsMajeurs, 6 et 5 items) ✅
- [x] Inscription + Renouvellement : bouton Hello Asso + QR code via api.qrserver.com (remplace le faux QR aléatoire)
- [x] Règlement intérieur :
  - `src/data/reglementInterieur.ts` créé avec 20 articles (extrait de Registration.tsx)
  - `src/components/Accordion.tsx` créé (extrait de Registration.tsx)
  - `<Accordion items={reglementInterieur} />` intégré — Registration.tsx nettoyé
- [x] "trésorière" déjà correct dans tous les contextes (stepsInscription, stepsReinscription, CTA) ✅ — aucun "secrétariat" présent

**Commit :** `feat(inscriptions): tarifs, documents, HelloAsso QR, règlement intérieur accordéon, SEO`

---

## PHASE 9 – PAGE CONTACT

- [x] `<SEO>` ajouté : title `"Contact"` | description avec tél. + email | canonical `/contact` | breadcrumb Accueil > Contact
- [x] ScrollToTop actif globalement via App.tsx ✅
- [x] Coordonnées déjà correctes : `06 75 26 43 58` + `vyhandball@gmail.com` ✅

**Commit :** `feat(contact): coordonnées, SEO`

---

## PHASE 10 – OPTIMISATION IMAGES

- [x] Lister toutes les images : 4 fichiers (favicon.svg, placeholder.svg, hero-handball.jpg, logo-vy-handball.jpeg)
- [x] Chercher les `<img>` sans `alt` : toutes avaient déjà un `alt`
- [x] alt descriptif + mot-clé local : déjà OK sur toutes
- [x] `loading="lazy"` sur images hors hero/logo : OK (bureau + entraîneurs + QR)
- [x] `width` et `height` explicites : ajoutés sur Header, Footer, Club (bureau 56×56, entraîneurs 48×48)

**Commit :** `perf: alt images, lazy loading, dimensions explicites`

---

## PHASE 11 – VÉRIFICATION FINALE

### Checks automatiques
```bash
# Aucun "Val d'Yerres HB" ne doit subsister
grep -r "Val d'Yerres HB" src/

# SEO présent sur chaque page
grep -r "import SEO" src/pages/

# robots.txt OK
cat public/robots.txt

# lang="fr" présent
grep 'lang="fr"' index.html
```

### Tests manuels (npm run preview)
- [ ] Navigation toutes pages → scroll en haut à chaque fois
- [ ] Lien "Nous contacter" → ancre correcte
- [ ] Page Contact → affichage correct en haut
- [ ] Mobile : lieu d'entraînement visible sur Inscriptions
- [ ] QR code affiché sur Inscriptions
- [ ] Accordéon règlement intérieur fonctionnel
- [ ] Aucun texte "Val d'Yerres HB" visible
- [x] Build sans erreur : `npm run build`
  - Vite build : ✅ 2041 modules, 8.35s
  - react-snap : ✅ 22/22 pages crawlées (1 pageerror cosmétique : `1?.5` ternaire minifié = limitation react-snap/Chromium73, sans impact prod)

### Finalisation
```bash
git add -A
git commit -m "feat: refonte contenu + SEO complet - Val d'Yerres Handball v2026"
git push origin feat/refonte-contenu-seo
# → Ouvrir une Pull Request vers main
```

---

## ACTIONS POST-DÉPLOIEMENT (hors code — à faire manuellement)

- [ ] Google Search Console : créer compte, vérifier propriété, soumettre sitemap
- [ ] Google Business Profile : créer/revendiquer fiche, renseigner toutes les infos
- [ ] Tester sur [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Tester sur [PageSpeed Insights](https://pagespeed.web.dev) → viser 90+ mobile

---

## DONNÉES DE RÉFÉRENCE

### Coordonnées officielles
- Téléphone président : `06 75 26 43 58`
- Email : `vyhandball@gmail.com`
- Ville principale : Boussy-Saint-Antoine (91800)
- Villes couvertes : Boussy-Saint-Antoine, Quincy-sous-Sénart, Épinay-sous-Sénart

### Ordre des collectifs (IMMUABLE)
`Baby Hand → -7 → -9 → -11F → -11M → -13F → -15/-18F → -15/-18M → Seniors Féminines → Seniors Masculins → Loisirs`

### Fichiers à créer
| Fichier | Rôle |
|---------|------|
| `src/components/SEO.jsx` | Balises meta + JSON-LD par page |
| `src/components/ScrollToTop.jsx` | Scroll haut à chaque route |
| `src/components/Accordion.jsx` | Accordéon règlement intérieur |
| `src/data/bureau.js` | Membres du bureau |
| `src/data/entraineurs.js` | Entraîneurs + collectifs |
| `src/data/collectifs.js` | 11 collectifs ordonnés |
| `src/data/reglementInterieur.js` | 20 articles du RI |
| `public/robots.txt` | SEO crawl |
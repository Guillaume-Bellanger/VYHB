# Récapitulatif Projet — Site Club de Handball

> Projet : Site vitrine pour le Val d'Yerres Handball (VYHB)  
> URL : https://www.valdyerreshandball.fr  
> Date : avril 2026

---

## 1. Stack technique

| Couche | Outil | Version |
|--------|-------|---------|
| Framework UI | React | 18.3 |
| Language | TypeScript | 5.8 |
| Build tool | Vite (plugin SWC) | 7.3 |
| Styles | Tailwind CSS | 3.4 |
| Composants | shadcn/ui + Radix UI | — |
| Routing | React Router DOM | 6.30 |
| Animations | Framer Motion | 11 |
| Fonts | Montserrat (display) + Inter (body) | — |

**Mode de rendu** : SPA avec pré-rendu statique via `react-snap` (génère du HTML pour chaque route → meilleur SEO sans serveur Node).

---

## 2. Dépendances clés

### Ajoutées manuellement (hors scaffolding initial)

| Package | Rôle |
|---------|------|
| `react-helmet-async` | Gestion des balises `<head>` (titre, meta, SEO) par page |
| `react-snap` (devDep) | Pré-rendu statique de toutes les routes au build |
| `vite-plugin-sitemap` | Génération automatique du sitemap.xml au build |
| `zustand` | State management (panier boutique, état global) |
| `framer-motion` | Animations (slide-up, fade-in, etc.) |
| `react-hook-form` + `zod` | Formulaires avec validation typée |
| `@tanstack/react-query` | Fetching de données async |
| `recharts` | Graphiques |
| `sonner` | Toasts / notifications |
| `embla-carousel-react` | Carrousels |
| `date-fns` | Manipulation de dates |

### Inclus par shadcn/ui (scaffolding)
Tous les `@radix-ui/react-*` (accordion, dialog, dropdown, select, tabs, toast…), `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `cmdk`, `vaul`, `next-themes`.

---

## 3. Structure du projet

```
handball-club-site/
├── src/
│   ├── pages/          # Une page par route (Index, Club, Collectifs, Contact…)
│   ├── components/     # Composants réutilisables
│   ├── data/           # Données statiques (JSON / TS)
│   ├── hooks/          # Hooks custom
│   ├── lib/            # Utilitaires (cn, etc.)
│   └── store/          # Zustand stores (cartStore.ts…)
├── public/
│   ├── .htaccess       # Config Apache (redirect HTTPS + SPA routing + cache)
│   └── robots.txt
├── tasks/              # Fichiers de travail Claude Code
│   ├── todo.md         # État courant des tâches
│   ├── lessons.md      # Leçons apprises (log d'erreurs)
│   └── recap-projet.md # Ce fichier
├── .github/workflows/
│   └── deploy.yml      # CI/CD GitHub Actions → FTP O2switch
├── CLAUDE.md           # Instructions Claude Code (workflow, principes)
├── vite.config.ts
└── tailwind.config.ts
```

---

## 4. Configuration Claude Code

### CLAUDE.md (à la racine du projet)
Définit le comportement de Claude pour ce projet :
- **Démarrage** : lire `tasks/lessons.md` puis `tasks/todo.md` avant toute action
- **Workflow** : planifier dans `todo.md`, implémenter, marquer terminé, logger dans `lessons.md`
- **Principes** : simplicité, cause racine uniquement, jamais supposer, demander en amont
- **Langue** : toujours répondre en français

### Structure tasks/
- `todo.md` — plan courant + état d'avancement (checklist markdown)
- `lessons.md` — log des erreurs avec format `[date] | problème | règle`
- Ces deux fichiers se créent à la première session si absents

---

## 5. Workflow de déploiement

### GitHub Actions → FTP O2switch

**Fichier** : `.github/workflows/deploy.yml`

**Déclencheur** : push sur la branche `main`

**Étapes** :
1. Checkout du code
2. Setup Node.js 20 avec cache npm
3. `npm ci` — installation des dépendances
4. `npm run build` — Vite build → pré-rendu react-snap → génération sitemap
5. Upload FTP vers O2switch via `SamKirkland/FTP-Deploy-Action@v4.3.5`

**Secrets GitHub requis** :
- `FTP_SERVER` — adresse du serveur FTP O2switch
- `FTP_USERNAME` — identifiant FTP
- `FTP_PASSWORD` — mot de passe FTP

**Dossier cible** : `/v2.vyhb.fr/deploy-vyhb/` (à adapter selon hébergement)

**Option** : `dangerous-clean-slate: true` → supprime tout le contenu distant avant upload (déploiement propre).

### Scripts npm
```json
"build"     → vite build
"postbuild" → react-snap (pré-rendu automatique après le build)
```

---

## 6. Fichiers de config importants

### `vite.config.ts`
- Plugin React SWC (compilation rapide)
- Plugin sitemap avec liste des routes déclarées manuellement
- Build target : `es2015` / `chrome73` (compatibilité large)
- Alias `@` → `./src`
- Port dev : 8080

### `public/.htaccess`
Trois blocs :
1. **Redirect HTTPS** : force tout le trafic HTTP vers HTTPS
2. **SPA routing** : redirige toutes les URLs inconnues vers `index.html`
3. **Cache** : images 1 an, CSS/JS 1 mois
4. **Compression** : gzip via mod_deflate

### `public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://www.valdyerreshandball.fr/sitemap.xml
```

### `tailwind.config.ts`
- Dark mode via classe
- Fonts custom : Montserrat + Inter
- Couleurs sémantiques via variables CSS HSL (primary, secondary, muted…)
- Animations custom : slide-up, fade-in, count-up
- Plugin : `tailwindcss-animate`

### `src/main.tsx`
Support hydratation react-snap :
```tsx
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);  // pré-rendu existant → hydrate
} else {
  createRoot(rootElement).render(app);  // pas de pré-rendu → render normal
}
```

---

## 7. À refaire from scratch pour un projet similaire

### Initialisation
```bash
npm create vite@latest mon-projet -- --template react-ts
cd mon-projet
npx shadcn@latest init
```

### Packages à ajouter manuellement
```bash
# SEO
npm install react-helmet-async
npm install --save-dev react-snap vite-plugin-sitemap

# State & forms
npm install zustand react-hook-form zod @hookform/resolvers

# UI extra
npm install framer-motion sonner embla-carousel-react date-fns
```

### Fichiers à créer / configurer
1. **`vite.config.ts`** — ajouter `vite-plugin-sitemap` avec les routes
2. **`src/main.tsx`** — remplacer `createRoot` par le pattern hydratation + `HelmetProvider`
3. **`public/.htaccess`** — copier le bloc HTTPS + SPA routing + cache + gzip
4. **`public/robots.txt`** — pointer vers le sitemap
5. **`package.json`** — ajouter `"postbuild": "react-snap"` + config reactSnap
6. **`.github/workflows/deploy.yml`** — adapter `server-dir` et ajouter les 3 secrets FTP
7. **`CLAUDE.md`** — copier le template workflow (démarrage, tasks, principes)
8. **`tasks/todo.md`** et **`tasks/lessons.md`** — créer vides au démarrage

### Points d'attention
- `react-snap` nécessite puppeteer → peut échouer en CI sans `--no-sandbox` (configurer dans `reactSnap.puppeteerArgs`)
- Déclarer toutes les routes dans `vite-plugin-sitemap` **et** dans `react-snap` si nécessaire
- Le `dangerous-clean-slate: true` FTP supprime tout → s'assurer que les fichiers uploadés par l'hébergeur (ex: `.htaccess` hôte) sont dans `public/`
- Les variables CSS Tailwind (couleurs HSL) doivent être définies dans `index.css` pour que shadcn/ui fonctionne

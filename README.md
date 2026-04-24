# Val d'Yerres Handball – Site officiel

Site web officiel du club **Val d'Yerres Handball (VYHB)**, club de handball basé en Essonne (91), couvrant les communes de Boussy-Saint-Antoine, Quincy-sous-Sénart et Épinay-sous-Sénart.

🌐 **Site en ligne** : [v2.vyhb.fr](https://v2.vyhb.fr)

---

## Stack technique

- **Framework** : React 18 + TypeScript
- **Build tool** : Vite 7
- **UI** : Tailwind CSS + shadcn/ui
- **Routing** : React Router v6
- **SEO** : react-helmet-async + react-snap (pré-rendu statique) + vite-plugin-sitemap
- **Formulaires** : React Hook Form + Zod
- **Tests** : Vitest + Playwright

---

## Structure du projet

```
src/
├── components/       # Composants réutilisables (Header, Footer, SEO, Accordion...)
│   └── ui/           # Composants shadcn/ui
├── data/             # Données statiques (collectifs, bureau, entraîneurs, règlement)
├── pages/            # Pages de l'application
├── hooks/            # Hooks React personnalisés
├── lib/              # Utilitaires
└── assets/           # Images et médias

public/
├── robots.txt        # Configuration crawlers
├── sitemap.xml       # Généré au build
└── .htaccess         # Configuration Apache (HTTPS, SPA routing, cache)
```

---

## Pages

| Route | Page |
|-------|------|
| `/` | Accueil |
| `/club` | Le Club (histoire, valeurs, bureau, formations) |
| `/collectifs` | Nos collectifs (11 équipes) |
| `/inscriptions` | Inscriptions saison 2026/2027 |
| `/partenaires` | Partenaires |
| `/contact` | Contact |

---

## Installation et développement

### Prérequis
- Node.js 20+
- npm

### Installation
```bash
git clone https://github.com/Guillaume-Bellanger/VYHB.git
cd VYHB
npm install
```

### Développement
```bash
npm run dev
```
Le site est accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
```
Génère le dossier `dist/` avec pré-rendu statique via react-snap.

### Preview du build
```bash
npm run preview
```

---

## Déploiement

Le déploiement est **automatique** via GitHub Actions.

À chaque push sur la branche `main` :
1. GitHub Actions installe les dépendances
2. Build de production (`npm run build`)
3. Déploiement FTP vers O2switch (`V2.vyhb.fr`)

### Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `FTP_SERVER` | Serveur FTP O2switch |
| `FTP_USERNAME` | Identifiant FTP |
| `FTP_PASSWORD` | Mot de passe FTP |

---

## SEO

- Balises `<title>` et `<meta description>` dynamiques par page via `react-helmet-async`
- Données structurées JSON-LD : `SportsOrganization`, `SportsEvent`, `BreadcrumbList`
- Balises Open Graph et Twitter Card
- Sitemap XML généré automatiquement au build
- Pré-rendu statique HTML via react-snap (22 pages crawlées)
- `robots.txt` configuré

---

## Contribuer

1. Crée une branche : `git checkout -b feat/ma-modification`
2. Effectue tes modifications
3. Commite : `git commit -m "feat: description"`
4. Push : `git push origin feat/ma-modification`
5. Ouvre une Pull Request vers `main`

---

## Données à mettre à jour

Les fichiers suivants contiennent des données placeholder à remplacer par les vraies informations :

| Fichier | Contenu |
|---------|---------|
| `src/data/bureau.ts` | Prénoms et photos des membres du bureau |
| `src/data/entraineurs.ts` | Prénoms et photos des entraîneurs |
| `src/data/collectifs.ts` | Horaires, lieux et descriptions des collectifs |

---

## Licence

Projet privé – Val d'Yerres Handball © 2026. Tous droits réservés.

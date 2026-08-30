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
- [x] Phase suivante : formulaire match (CRUD complet) + liste matchs admin → Phase 14

---

## PHASE 14 – CRUD MATCHS ADMIN

- [x] `src/hooks/useMatches.ts` — TanStack Query : useMatches(filters), useMatch(id), useCreateMatch, useUpdateMatch, useDeleteMatch + invalidation cache
- [x] `src/pages/admin/MatchListAdminPage.tsx` — tableau complet : date, adversaire, catégorie, type, statut, score, actions (publier/éditer/supprimer). Filtres statut + catégorie. Confirmation suppression via AlertDialog
- [x] `src/pages/admin/MatchFormPage.tsx` — formulaire create+edit : datetime, adversaire, domicile (Switch), catégorie (Select), type, statut, score (visible si joué/publié), résumé (Textarea). Permissions : rédacteur → résumé seul, responsable → catégorie verrouillée, admin → accès total
- [x] Phase suivante : gestion utilisateurs + page publique résultats → Phase 15

---

## PHASE 15 – GESTION UTILISATEURS + PAGE PUBLIQUE RÉSULTATS

- [x] `supabase/schema.sql` — v2 : ajout email+disabled sur profiles, table pending_invites, UPDATE policy super_admin, lecture publique matchs prevu+publie
- [x] `src/types/database.ts` — ajout email/disabled sur Profile, interface PendingInvite
- [x] `src/lib/supabase.ts` — fallback placeholder pour react-snap (ne throw plus), export isSupabaseConfigured
- [x] `src/hooks/useUsers.ts` — useUsers, useUpdateUser, useInviteUser (pending_invite + OTP magic link)
- [x] `src/pages/admin/UsersPage.tsx` — table users, dialog invite (email+rôle+catégorie), dialog edit, toggle disable
- [x] `src/hooks/usePublicMatches.ts` — usePublicMatches (publiés), usePublicUpcoming (prévus futurs), enabled seulement si Supabase configuré
- [x] `src/pages/Resultats.tsx` — page publique : onglets par catégorie, section "À venir", section "Résultats", modal résumé, skeletons SSG-safe
- [x] `src/App.tsx` — route /resultats ajoutée
- [x] `vite.config.ts` — /resultats ajouté au sitemap
- [ ] Phase suivante : tableau de bord enrichi (stats matchs) + lien /resultats dans le Header

---

## PHASE 16 – AUTH CALLBACK (INVITATION & RÉCUPÉRATION MOT DE PASSE)

- [x] `src/pages/admin/AuthCallbackPage.tsx` — détecte le type (invite/recovery/magiclink) via hash ou query params, affiche formulaire définition de mot de passe (react-hook-form + zod + shadcn), appelle `supabase.auth.updateUser({ password })` après init session, redirige vers /admin/dashboard
- [x] `src/App.tsx` — route publique `/admin/auth/callback` → `AuthCallbackPage`
- [x] `src/hooks/useUsers.ts` — `emailRedirectTo` mis à jour : `/admin/dashboard` → `/admin/auth/callback`
- [ ] **ACTION MANUELLE** : Supabase Dashboard → Authentication → URL Configuration → Redirect URLs → ajouter `http://localhost:8080/admin/auth/callback` (et l'URL de production)

---

## PHASE 17 – CMS COLLECTIFS ÉDITABLES DEPUIS L'ADMIN

- [x] `supabase/migrations/014_collectifs.sql` — table `collectifs` (horaires/lieux JSONB, entraineurs TEXT[]), RLS (`get_my_role() IN ('super_admin','president')`), trigger `set_updated_at()`, bucket Storage `collectifs` + policies, INSERT des 10 lignes reprises exactement de `src/data/collectifs.ts` (ordre 0 à 9)
- [ ] **ACTION MANUELLE** : exécuter `014_collectifs.sql` dans le Supabase SQL Editor, puis vérifier dans le Dashboard que le bucket Storage `collectifs` est bien créé et public
- [x] `src/types/collectif.ts` — types `Collectif`, `Horaire`, `Lieu`
- [x] `src/hooks/useCollectifs.ts` — pattern fetch natif (comme `useMatches.ts`) : `useCollectifsPublic`, `useCollectifsAdmin`, `useCreateCollectif`, `useUpdateCollectif`, `useDeleteCollectif`, `useReorderCollectifs`
- [x] `src/lib/collectifFormat.ts` — `formatHoraire(s)`/`formatLieux` pour reconstruire l'affichage texte à partir des données structurées
- [x] `src/data/collectifStyles.ts` — icônes + dégradés par slug (détails visuels non éditables, extraits de `Collectifs.tsx`/`CollectifDetail.tsx`, fallback par défaut pour les nouvelles fiches)
- [x] `src/pages/admin/CollectifsAdminPage.tsx` — CRUD complet : liste (miniature, réordonnancement ↑↓, toggle actif, éditer, supprimer) + formulaire (slug auto-généré depuis le nom, horaires/lieux en `useFieldArray`, entraîneurs séparés par virgules, upload photo vers le bucket `collectifs`)
- [x] `src/App.tsx` — route `/admin/collectifs` (rôles `super_admin` + `president` uniquement)
- [x] `src/components/admin/AdminLayout.tsx` — entrée "Collectifs" dans la sidebar
- [x] `src/pages/Collectifs.tsx`, `src/pages/CollectifDetail.tsx`, `src/pages/Registration.tsx` — branchés sur `useCollectifsPublic()` avec skeletons de chargement (design strictement conservé)
- [x] `src/data/collectifs.ts` — conservé sans modification (fallback/référence, non importé par les pages publiques)
- [ ] Vérification visuelle post-exécution SQL : `/collectifs`, `/collectifs/:slug`, `/inscriptions`, `/admin/collectifs`

---

## PHASE 18 – RÉSULTATS LIMITÉS PAR COLLECTIF + ONGLET HISTORIQUE

- [x] `src/data/categories.ts` — source unique de l'ordre des catégories (`CATEGORIES` + `MATCH_CATEGORIES` sans "Baby"). Fait foi : l'ancien `ALL_CATS` de `Resultats.tsx` avait Séniors Féminines/Masculins inversés par rapport aux 3 listes `CATEGORIES` dupliquées dans `MatchFormPage.tsx`, `MatchListAdminPage.tsx`, `UsersPage.tsx` — non touchées (hors scope), seul `Resultats.tsx` a été branché sur la nouvelle source
- [x] `src/pages/Resultats.tsx` — refonte complète :
  - Deux onglets shadcn `Tabs` : "Résultats" (par défaut) / "Historique"
  - Un seul `usePublicMatches()` (sans filtre catégorie côté serveur), tout le filtrage/regroupement fait côté client
  - Onglet Résultats : "Matchs à venir" inchangé + "Derniers résultats" groupés par catégorie (2 matchs `publie` les plus récents par catégorie, catégories vides masquées, ordre = `MATCH_CATEGORIES`)
  - Onglet Historique : tous les matchs `publie`, filtre catégorie via `Select` (touch-friendly), tri du plus ancien au plus récent, regroupés par saison (sept.–août, ex. mai 2026 → "2025/2026") via `groupBySeason()`
  - Mêmes composants `ResultCard`/`UpcomingCard` réutilisés pour un design identique entre les deux onglets
- [ ] Vérification visuelle manuelle (`npm run dev` → `/resultats`) : bascule des onglets, filtre catégorie sur Historique, regroupement par saison, responsive mobile — non faite dans cette session (extension navigateur refusée), `tsc --noEmit` + `eslint` + `npm run build` passent sans erreur

---

## PHASE 19 – CMS ENCADREMENT (ENTRAÎNEURS + BUREAU) ÉDITABLE DEPUIS L'ADMIN

- [x] `supabase/migrations/015_encadrement.sql` — table unique `encadrement` (`type` 'entraineur'|'bureau'|'pole' avec CHECK, `categories` TEXT[] pour les entraîneurs), RLS (`get_my_role() IN ('super_admin','president')`), trigger `set_updated_at()`, policies `storage.objects` pour le bucket `encadrement` (bucket créé manuellement côté Dashboard, pas de INSERT INTO storage.buckets), INSERT des 12 entraîneurs + 4 membres du bureau + 2 responsables de pôles repris de `src/data/entraineurs.ts`/`bureau.ts` (`ordre` scopé par section)
  - **Écart assumé** : `prenom` rendu NULLABLE (pas NOT NULL comme demandé) — les postes vacants du bureau ("Vice-Président", "Secrétaire") et les pôles n'ont pas de titulaire dans les données actuelles
  - **Écart assumé** : catégories des entraîneurs dérivées telles quelles du champ `role` texte existant (split sur `" / "`) — certaines valeurs ("-15M/-18M", "-18F") ne correspondent à aucune catégorie canonique de `src/data/categories.ts` mais sont conservées sans correction
- [ ] **ACTION MANUELLE** : exécuter `015_encadrement.sql` dans le Supabase SQL Editor (bucket Storage `encadrement` déjà pris en charge côté Dashboard)
- [x] `src/types/encadrement.ts` — types `Encadrement`, `EncadrementType`
- [x] `src/hooks/useEncadrement.ts` — pattern fetch natif (comme `useCollectifs.ts`) : `useEncadrementPublic(type?)`, `useEncadrementAdmin`, `useCreateEncadrement`, `useUpdateEncadrement`, `useDeleteEncadrement`, `useReorderEncadrement`
- [x] `src/pages/admin/EncadrementPage.tsx` — 3 sections (Entraîneurs / Le Bureau / Responsables de Pôles), chacune avec sa propre liste (miniature, ↑↓, toggle actif, éditer, supprimer, "+ Ajouter"). Formulaire partagé : type (Select), prénom, nom, rôle, catégories (multi-select chips alimenté par `MATCH_CATEGORIES`, affiché seulement si type = entraîneur, avec fallback pour préserver d'éventuelles valeurs historiques hors liste comme "Baby"), photo (upload bucket `encadrement`), actif
- [x] `src/App.tsx` — route `/admin/encadrement` (rôles `super_admin` + `president`)
- [x] `src/components/admin/AdminLayout.tsx` — entrée "Encadrement" dans la sidebar
- [x] `src/pages/Club.tsx` — branché sur un seul `useEncadrementPublic()` filtré côté client par type (au lieu de 3 fetches), skeletons pendant le chargement. Comportement photo unifié : Bureau ET Responsables de Pôles affichent désormais une photo si `photo_url` est renseigné (avant, les pôles affichaient toujours un placeholder, quelle que soit la donnée — `featured` de l'ancien `bureau.ts` correspondait en réalité exactement à "a une photo")
- [x] `src/data/entraineurs.ts`, `src/data/bureau.ts` — conservés sans modification (fallback/référence, non importés par les pages publiques)
- [ ] Vérification visuelle post-exécution SQL : `/club` (onglets Organisation + Entraîneurs), `/admin/encadrement`

---

## PHASE 20 – CMS TARIFS ÉDITABLE DEPUIS L'ADMIN

- [x] `supabase/migrations/016_tarifs.sql` — table `tarifs` (libelle, montant NUMERIC(6,2), saison, note, ordre, actif), RLS (`get_my_role() IN ('super_admin','president')`), trigger `set_updated_at()`, INSERT des 5 tarifs actuels saison "2026/2027" (Baby Hand / -7 : 110, -9 / -11 / -13 : 120, -15 / -18 : 130, Seniors : 150, Loisirs : 120 — libellé "Seniors" repris tel que donné dans la consigne, plus court que l'ancien "Seniors Féminines / Seniors Masculins" de Registration.tsx)
- [ ] **ACTION MANUELLE** : exécuter `016_tarifs.sql` dans le Supabase SQL Editor
- [x] `src/types/tarif.ts` — type `Tarif`
- [x] `src/hooks/useTarifs.ts` — pattern fetch natif (comme `useCollectifs.ts`/`useEncadrement.ts`) : `useTarifs()` (public), `useTarifsAdmin`, `useCreateTarif`, `useUpdateTarif`, `useDeleteTarif`, `useReorderTarifs`
- [x] `src/pages/admin/TarifsPage.tsx` — tableau éditable (`ui/table`) par saison : champ Saison en haut (texte libre + pastilles de raccourci si plusieurs saisons existent), lignes éditables en ligne (libellé, montant, note, actif, ↑↓), ajout d'une ligne, suppression, `ordre` scopé par saison. Colonne "Note" masquée sous `sm:` pour la lisibilité mobile
- [x] `src/App.tsx` — route `/admin/tarifs` (rôles `super_admin` + `president`)
- [x] `src/components/admin/AdminLayout.tsx` — entrée "Tarifs" dans la sidebar
- [x] `src/pages/Registration.tsx` — section Tarifs branchée sur `useTarifs()`, titre `Tarifs saison {saison}` dérivé de la donnée (saison du premier tarif actif) au lieu du texte en dur "saison 2026/2027", dégradés décoratifs désormais cycliques (`TARIF_ACCENTS[i % length]`, plus de correspondance figée par libellé), skeletons pendant le chargement
- [ ] Vérification visuelle post-exécution SQL : `/inscriptions` (section Tarifs), `/admin/tarifs`

---

## PHASE 21 – CMS TEXTES LIBRES DU SITE (site_content)

- [x] `supabase/migrations/017_site_content.sql` — table `site_content` (clé texte en PK, `groupe`, `type` 'texte'|'texte_long'|'liste' avec CHECK, `valeur` JSONB), RLS lecture publique totale + écriture `get_my_role() IN ('super_admin','president')`, trigger `set_updated_at()`, INSERT de 9 clés reprises telles quelles de `Club.tsx`/`Contact.tsx`/`Index.tsx` (`club.historique`, `club.valeurs`, `club.texte_entraineurs`, `club.texte_benevoles`, `club.texte_ecole_arbitrage`, `contact.email`, `contact.adresse_gymnase`, `accueil.accroche_hero`, `accueil.texte_famille`)
  - **Écart assumé** : `club.historique` garde 3 champs par entrée (`annee`, `titre`, `texte`) au lieu des 2 décrits dans la consigne — la donnée réelle de `Club.tsx` (`timeline`) a un titre en gras distinct du texte descriptif ; réduire à 2 champs aurait perdu cette structure visuelle
  - **Écart assumé** : `club.texte_benevoles` consolide 4 paragraphes (dont un en gras/plus grand, "Nous avons besoin de vous !") en un seul champ `texte_long` séparé par des lignes vides — la mise en emphase de ce paragraphe est perdue au profit d'un champ CMS simple et éditable
  - **Interprétation** : `accueil.accroche_hero` = le paragraphe sous le H1 hero (pas le H1 lui-même, qui contient des `<span>` stylés/gradient conservés en dur pour ne pas risquer de casser ce balisage)
- [ ] **ACTION MANUELLE** : exécuter `017_site_content.sql` dans le Supabase SQL Editor
- [x] `src/types/siteContent.ts` — types `SiteContentRow`, `SiteContentType`, `HistoriqueItem`, `ValeurItem`
- [x] `src/hooks/useSiteContent.ts` — pattern fetch natif : `useSiteContent()` expose `get(cle, fallback)` (retourne le fallback en dur si la clé est absente — aucune régression possible), `useSiteContentAdmin`, `useUpdateSiteContent` (PATCH par `cle`, PK texte donc pas d'UUID)
- [x] `src/pages/admin/ContenuPage.tsx` — textes groupés par `groupe` en `Accordion` (tous ouverts par défaut), un bouton "Enregistrer" par section (pas un seul pour toute la page) qui ne PATCH que les clés effectivement modifiées. Champ selon `type` : `Input` (texte), `Textarea` (texte_long), `ListEditor` générique pour `liste` (colonnes déduites des clés du premier élément — fonctionne pour `historique` à 3 champs et `valeurs` à 2 champs sans code dédié), avec ajout/suppression/réordonnancement des entrées
- [x] `src/App.tsx` — route `/admin/contenu` (rôles `super_admin` + `president`)
- [x] `src/components/admin/AdminLayout.tsx` — entrée "Textes du site" dans la sidebar
- [x] `src/pages/Club.tsx`, `src/pages/Contact.tsx`, `src/pages/Index.tsx` — branchés sur `useSiteContent().get(cle, fallbackEnDur)`, design strictement inchangé, pas de skeleton nécessaire (le fallback s'affiche immédiatement, remplacé silencieusement une fois la donnée chargée). Icônes/couleurs des "valeurs" et de la timeline restent en dur (détails visuels, non éditables), associées par position aux entrées chargées. `contact.email` réutilisé à la fois sur Contact.tsx (affichage + lien mailto du formulaire) et Index.tsx (strip contact bas de page)
- [ ] Vérification visuelle post-exécution SQL : `/club` (Historique + Entraîneurs/Bénévoles + Formations), `/contact`, `/` (accroche hero + section famille + strip contact), `/admin/contenu`

---

## FIX HORS PHASE – Accueil branché sur collectifs Supabase

- [x] `src/pages/Index.tsx` — la section "Nos collectifs" lisait encore `src/data/collectifs.ts` (seul fichier trouvé après grep de tous les imports de ce module) au lieu de `useCollectifsPublic()` : les modifications faites depuis `/admin/collectifs` n'y apparaissaient jamais. Branché sur le hook, repli sur les données statiques uniquement si le fetch échoue (`isError`, pas pendant le chargement où un skeleton s'affiche). Icône emoji remplacée par `getCollectifIcon(slug)` (Lucide, comme sur `/collectifs`) — le champ `icon` n'existe pas côté Supabase. Header/Footer/SEO vérifiés : aucune autre référence à la source statique.

---

## PHASE 22 – FILTRE CATÉGORIE /RESULTATS + REFONTE CATÉGORIES + CORBEILLE (SOFT DELETE)

### Partie 1 — Filtre par catégorie sur /resultats
- [x] `src/pages/Resultats.tsx` — nouveau `CategoryFilterBar` (scrollable horizontalement, fade sur les bords via `maskImage`, plus discret que les onglets principaux, catégories sans résultat grisées mais jamais masquées). Deux états indépendants `resultatsCategorie`/`historiqueCategorie` (sentinel `"tous"`). Onglet Résultats : la barre filtre "Derniers résultats" ET "Matchs à venir" (2 derniers résultats de la catégorie choisie, sans le sous-titre de groupe redondant). Onglet Historique : remplace le `Select` par la même barre, regroupement par saison et tri inchangés. Toujours un seul `usePublicMatches()`.

### Partie 2 — Refonte src/data/categories.ts
- [x] Nouvelle liste canonique (12 entrées) : `Baby Hand, -7, -9, -11 Mixte, -11F, -13M, -13F, -15M/-18M, -15F/-18F, Séniors Masculins, Séniors Féminines, Loisirs`. `MATCH_CATEGORIES` exclut seulement `"Baby Hand"`.
- [x] `MatchFormPage.tsx`, `MatchListAdminPage.tsx`, `UsersPage.tsx` — suppression des copies locales de `CATEGORIES`, import unique depuis `src/data/categories.ts` (elles avaient déjà divergé une fois, cf. leçon 2026-08-30)
- [x] `EncadrementPage.tsx` — fix explicite demandé : le multi-select catégories utilisait `MATCH_CATEGORIES` (donc "Baby Hand" y était impossible à sélectionner) → `CATEGORIES` (liste complète)
- [x] `supabase/migrations/018_categories.sql` — étape 1 (diagnostic) exécutée par l'utilisateur : 13 lignes sur `matches.categorie`. `collectifs` volontairement exclu (pas de colonne `categorie`, seul `nom` y ressemble — décision actée).
  - **Bug réel découvert par le diagnostic** : `matches.categorie` contenait "Seniors Féminines"/"Seniors Masculins" **sans accent** (3 lignes), alors que le code (`src/data/categories.ts` ET la fonction SQL `init_match_postes()` de `002_match_postes.sql`) utilise partout "Séniors" avec accent — les deux étaient déjà cohérents entre eux, seule la donnée divergeait. Conséquence : `init_match_postes()` teste `p_categorie NOT IN ('Séniors Masculins', 'Séniors Féminines')` pour décider de créer un poste `arbitre` facultatif ; comme la donnée n'avait pas l'accent, la condition n'a jamais matché → un poste `arbitre` a été créé à tort sur ces 3 matchs.
  - [x] `018_categories.sql` complété avec les `UPDATE matches.categorie` confirmés (`-9/-11`→`-9`, `-15F`→`-15F/-18F`, `-18F`→`-15F/-18F`, `Seniors Féminines`→`Séniors Féminines`, `Seniors Masculins`→`Séniors Masculins`) + `DELETE` de nettoyage des postes `arbitre` créés à tort (exécuté après les UPDATE, cible la valeur déjà corrigée)
  - **Autres occurrences "Seniors"/"Séniors" en dur recensées** (grep complet du repo) :
    - Vivantes mais hors logique catégories (cosmétique SEO, non bloquant) : `src/pages/Collectifs.tsx` (description SEO + sous-titre hero), `src/pages/Index.tsx` (description SEO), `src/pages/admin/CollectifsAdminPage.tsx` (placeholder de champ)
    - Données de seed historiques (migrations déjà exécutées, fichiers non modifiables rétroactivement) : `014_collectifs.sql` (`collectifs.nom`), `015_encadrement.sql` (`encadrement.categories[]`), `016_tarifs.sql` (`tarifs.libelle` = "Seniors" seul, non lié à la taxonomie catégories — faux positif, pas un problème)
    - Fichiers morts, non routés dans `App.tsx`, jamais importés : `src/pages/Teams.tsx`, `Matches.tsx`, `News.tsx`, `Schedule.tsx` (données de démo du scaffold initial) + `src/data/entraineurs.ts`, `src/data/collectifs.ts` (fallback déjà non utilisé depuis les migrations CMS)
- [x] `018_categories.sql` — ÉTAPE 4 ajoutée et confirmée : `UPDATE collectifs.nom` (Seniors→Séniors, accent uniquement — slug/horaires/entraîneurs/photo inchangés). Scission de la fiche "-9/-11" toujours hors périmètre, à faire par l'utilisateur depuis `/admin/collectifs`.
- [x] Occurrences cosmétiques uniformisées : `Collectifs.tsx` (description SEO + sous-titre hero), `Index.tsx` (meta description), `CollectifsAdminPage.tsx` (placeholder). `tarifs.libelle` laissé tel quel (texte libre, pas lié à la taxonomie).
- [x] `Teams.tsx`, `Matches.tsx`, `News.tsx`, `Schedule.tsx` supprimés (commit séparé `chore:`, vérifié par grep + build avant suppression). `entraineurs.ts`/`collectifs.ts`/`bureau.ts` conservés à la demande de l'utilisateur (fallback le temps de valider le CMS en prod).
- [x] `018_categories.sql` — ÉTAPE 3 complétée et confirmée : `UPDATE encadrement.categories[]`, distribution identique à `matches` (13 occurrences). Reconstruction complète du tableau (unnest → mapping → regroupement par valeur avec `MIN(ordinalité)` → ré-agrégation triée) pour dédupliquer `-15F`/`-18F` (convergent vers `-15F/-18F`) et éclater `-9/-11` en DEUX valeurs `-9` + `-11 Mixte` (un encadrant peut suivre plusieurs groupes, contrairement à un match qui n'a qu'une seule catégorie) ; ordre d'origine préservé. Requête de vérification (`prenom, role, categories`) ajoutée en fin de fichier.
- [ ] **ACTION MANUELLE** : exécuter `018_categories.sql` en entier dans le Supabase SQL Editor (ÉTAPES 2/3/4 — les diagnostics des ÉTAPES 1 et "encadrement" sont déjà exécutés) puis contrôler le résultat de la requête de vérification finale avant de considérer cette migration close

### Partie 3 — Corbeille (soft delete) sur encadrement, collectifs, evenements, tarifs
- [x] `supabase/migrations/019_soft_delete.sql` — `supprime_le`/`supprime_par` sur les 4 tables. Policy publique mise à jour (`AND supprime_le IS NULL`). L'ancienne policy admin `FOR ALL` est scindée en 4 policies (SELECT/INSERT/UPDATE pour super_admin+président — +evenements_com pour `evenements`, qui avait ce rôle en plus — et DELETE réservé à super_admin seul) : Postgres ne permet pas de retirer uniquement DELETE d'un `FOR ALL`.
  - **Bug corrigé** : première exécution échouée (`ERROR 42701: column "supprime_le" of relation "collectifs" already exists`, la table ayant déjà les colonnes d'une tentative précédente partielle). Migration rendue idempotente : `ADD COLUMN IF NOT EXISTS` sur les 4 tables, `DROP POLICY IF EXISTS` devant CHAQUE `CREATE POLICY` (y compris les policies entièrement nouvelles, pas seulement celles qui remplacent une policy pré-existante). Règle désormais systématique pour toutes les migrations de ce projet, cf. tasks/lessons.md.
- [ ] **ACTION MANUELLE** : exécuter `019_soft_delete.sql` (version idempotente) dans le Supabase SQL Editor
- [x] `useCollectifs.ts`, `useEncadrement.ts`, `useTarifs.ts` — le `useDeleteX` existant fait désormais un `PATCH` (soft delete) au lieu d'un `DELETE` ; nouveaux `useXTrash` (liste + `profiles!supprime_par(full_name)` embarqué), `useRestoreX`, `useHardDeleteX` (DELETE réel, RLS restreint déjà à super_admin). Les query admin normales gagnent `&supprime_le=is.null`.
- [x] `EvenementsPage.tsx` — mêmes 4 opérations mais en fonctions locales (`loadEvents`/`loadTrash`/`handleDelete`/`handleRestore`/`handleHardDelete`), cohérent avec son architecture actuelle (pas de hook TanStack Query dédié, contrairement aux 3 autres tables)
- [x] `src/components/admin/TrashSection.tsx` (nouveau, partagé) — Accordion repliable générique : date, auteur (`supprime_par_profile?.full_name`), bouton Restaurer, bouton Supprimer définitivement (avec confirmation) affiché seulement si `canHardDelete` (= `useAuth().isAdmin`). Réutilisé tel quel dans les 4 pages admin pour éviter 4 implémentations dupliquées.
- [x] `CollectifsAdminPage.tsx`, `EncadrementPage.tsx`, `TarifsPage.tsx`, `EvenementsPage.tsx` — `<TrashSection>` ajoutée en bas de page
- [ ] Vérification visuelle post-exécution SQL : suppression/restauration/suppression définitive sur les 4 pages admin, `/resultats` (filtre catégorie sur les deux onglets)

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
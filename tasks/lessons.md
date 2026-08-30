## Leçons apprises

[2026-04-23] | Le todo utilise des slugs de routes différents des routes réelles codées dans App.tsx | Toujours vérifier App.tsx avant de corriger des URLs dans les pages — les routes réelles sont :
- `/` → Accueil (Index)
- `/club` → Le Club (≠ `/le-club` dans le todo)
- `/collectifs` → Nos Collectifs (≠ `/nos-collectifs`)
- `/inscriptions` → Inscriptions (≠ `/registration`)
- `/partenaires` → Partenaires (≠ `/partners`)
- `/contact` → Contact
- `/evenements` → Événements
- `/matchs` → Matchs
- `/mentions-legales` → Mentions légales

[2026-05-18 → corrigé 2026-05-22] | Ne JAMAIS mettre de fallback URL dans le client Supabase | Le fallback "https://placeholder.supabase.co" fait pointer le client vers un domaine fictif : le await supabase.from(...).select() accroche indéfiniment, aucune requête HTTP n'est émise, pas d'erreur visible. Fix définitif : supabase.ts ne contient que createClient(url, key) sans fallback ni condition. Si les variables ne sont pas là, le client crashe à la création — ce qui est visible et diagnostiquable.

[2026-05-22] | authStore : remplacer supabase.auth.* par fetch natif | Le client supabase-js instancié au niveau module peut être figé avec une mauvaise URL (cache HMR). onAuthStateChange ne se déclenche jamais → isLoading bloqué indéfiniment. Fix définitif : authStore.ts n'importe plus supabase depuis @/lib/supabase — tout passe par fetch natif vers /auth/v1/* et /rest/v1/profiles. La session est gérée manuellement dans localStorage (clé sb-{ref}-auth-token). Pattern identique à usePublicMatches.ts.

[2026-05-22] | Le localStorage Supabase peut bloquer _init() | Un token sb-*-auth-token expiré ou corrompu dans localStorage peut faire rester isLoading: true (onAuthStateChange attend un refresh qui ne revient jamais). Fix : nettoyer les clés sb-* expirées en début de _init() + safety timeout à 2s + reset complet dans signIn(). Zustand create() ne persiste rien — le problème vient uniquement du localStorage du client Supabase JS, pas du store Zustand.

[2026-05-22] | Le client Supabase JS est figé à l'instanciation du module | createClient() est exécuté une fois au chargement du module. Si Vite sert un module caché avec une mauvaise URL (placeholder ou undefined), le client reste figé même après HMR. Le await supabase.from() ne génère aucune requête HTTP, sans erreur visible. Fix définitif : utiliser fetch natif dans les queryFn (env vars lues à chaque appel, pas à l'import). Ne plus dépendre du client @supabase/supabase-js dans les hooks publics.

[2026-05-18 → corrigé 2026-05-22] | Ne PAS utiliser enabled: isSupabaseConfigured dans les hooks publics | enabled: isSupabaseConfigured désactive la query si les env vars Vite ne sont pas injectées (ex: dev server démarré avant .env.local, ou build sans variables). La query est alors silencieusement disabled → zéro requête réseau, zéro message d'erreur. Fix : supprimer enabled, laisser TanStack Query catcher les erreurs réseau. SSG-safety garantie par les placeholders dans supabase.ts (pas de throw à l'import). isSupabaseConfigured doit se baser sur l'URL résolue (supabaseUrl !== placeholder), pas sur import.meta.env brut.

[2026-05-22] | Ne jamais appeler navigate() ou setState pendant le rendu | Appeler navigate() directement dans le corps d'un composant (hors event handler) déclenche "Cannot update a component while rendering a different component". Toujours entourer dans un useEffect avec les bonnes dépendances.

[2026-05-22] | data ?? [] dans queryFn pour éviter null as Match[] | Supabase peut retourner null pour un résultat vide selon le contexte. Toujours retourner (data ?? []) as Match[] pour garantir un tableau. Et dans le rendu, ne jamais tester results?.length === 0 seul — utiliser isError + results.length (quand data est garanti non-null par le hook).

[2026-05-22] | Une seule query + split client-side > deux queries séparées | Pour une page qui affiche deux sections (résultats + à venir) du même dataset, préférer un seul useQuery avec .in("statut", [...]) et filtrer côté client. Réduit les requêtes réseau et simplifie la gestion des états loading/error.

[2026-05-22] | signIn() doit set user et isLoading explicitement, pas seulement via onAuthStateChange | Si onAuthStateChange arrive tard ou échoue silencieusement, le store reste bloqué (isLoading: true, user: null). Fix : dans signIn(), après fetchProfile(), appeler set({ user, isLoading: false }) explicitement. Ajouter aussi un safety timeout de 5s dans _init() qui force isLoading: false si toujours vrai.

[2026-05-22] | useMatches (admin CRUD) : même pattern fetch natif que usePublicMatches | useMatches.ts utilisait supabase.from() → même bug de client figé en HMR. Fix définitif : helper baseHeaders() qui lit VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY à chaque appel + lit le token depuis localStorage (sb-{ref}-auth-token). Helpers pgList, pgOne, pgInsert, pgPatch, pgDelete couvrent tout le CRUD. Aucun import depuis @/lib/supabase.

[2026-08-30] | Les numéros de migration réels dépassent ceux mentionnés dans une consigne (ex. demande de créer "013_x.sql" alors que 013 existe déjà) | Toujours lister `supabase/migrations/*` avant de nommer un nouveau fichier de migration — ici 013_evenements_photo2.sql existait déjà, la nouvelle migration collectifs est devenue 014_collectifs.sql.

[2026-08-30] | get_my_role() est utilisé dans 011_audit_logs.sql sans être défini dans aucune migration trackée (ni schema.sql) | La fonction existe donc côté Supabase mais a été créée manuellement (hors migration versionnée) à un moment. Avant de réutiliser une fonction SQL "supposée exister", vérifier qu'elle est bien définie dans les fichiers trackés — sinon le prévenir explicitement à l'utilisateur plutôt que de supposer silencieusement. Pattern de repli si la fonction manque vraiment : `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (...))` (utilisé dans 004_evenements.sql, 005_roles.sql).

[2026-08-30] | zodResolver + useFieldArray sur un schéma imbriqué (ex. horaires: [{jour,debut,fin}]) : le type inféré de `data` dans onSubmit peut avoir des propriétés optionnelles même si le schema Zod interne ne les déclare pas `.optional()` | Ne pas passer `data.champArray` tel quel à un payload typé strictement (ex. `CollectifInsert`) — mapper explicitly chaque champ avec un fallback (`h.jour ?? ""`) pour satisfaire le typage strict côté hook/API, indépendamment de la validation Zod à l'exécution.

[2026-08-30] | Validation Zod stricte (`.min(1)`) sur des lignes de useFieldArray sans affichage d'erreur par ligne = échec de soumission silencieux pour l'utilisateur | Pour des listes dynamiques (horaires, lieux) où l'admin peut laisser une ligne vide sans s'en rendre compte, préférer une validation permissive côté schema + filtrage des lignes vides à la soumission (onSubmit) plutôt que de bloquer avec un message d'erreur qui n'est pas rendu visuellement sur chaque sous-champ.

[2026-08-30] | La liste des catégories était dupliquée à l'identique dans 4 fichiers (`Resultats.tsx` ALL_CATS, `MatchFormPage.tsx`, `MatchListAdminPage.tsx`, `UsersPage.tsx` CATEGORIES) mais avec un ordre incohérent : Séniors Féminines/Masculins inversés dans ALL_CATS par rapport aux 3 autres | Avant de "réutiliser une liste existante" sur consigne utilisateur, grep toutes les occurrences plutôt que de faire confiance à la première trouvée — elles peuvent diverger silencieusement. Fix : `src/data/categories.ts` créé comme source unique (`CATEGORIES` avec "Baby", `MATCH_CATEGORIES` sans). Seul `Resultats.tsx` a été migré vers cette source (scope de la tâche) ; les 3 fichiers admin gardent leur copie locale — à dédupliquer si une tâche future les touche.

[2026-08-30] | Extension Claude in Chrome refusée par l'utilisateur pour cette session | Ne plus la proposer/relancer dans la session. Pour vérifier une UI sans elle : `tsc --noEmit` + `eslint` + `npm run build` (garantit l'absence d'erreur de compilation/type), mais dire explicitement à l'utilisateur que le rendu visuel réel n'a pas été vérifié et lui indiquer l'URL locale (`npm run dev`) à checker manuellement.

[2026-08-31] | Un schéma de table demandé avec une colonne `NOT NULL` peut ne pas correspondre aux données réelles à migrer (ex. `prenom TEXT NOT NULL` alors que src/data/bureau.ts a des postes vacants sans titulaire) | Toujours relire les données sources AVANT d'écrire le CREATE TABLE d'une migration de CMS — si une contrainte NOT NULL forcerait à inventer une valeur ou ferait échouer l'INSERT, la relâcher (nullable) et documenter l'écart en tête de fichier de migration plutôt que de suivre la consigne à la lettre.

[2026-08-31] | Un champ booléen "dérivé" dans les anciennes données statiques (`featured` dans bureau.ts) peut être redondant avec un autre champ (ici : `featured` coïncidait à 100% avec "avatarUrl renseigné") | Avant de reproduire un tel champ dans un nouveau schéma CMS, vérifier s'il peut être simplement dérivé d'un champ déjà présent (`photo_url != null`) plutôt que stocké séparément — évite une colonne inutile et un état qui peut diverger de la photo réellement présente. Appliqué à `encadrement` : pas de colonne `featured`, l'affichage photo/placeholder dépend uniquement de `photo_url`.

[2026-08-31] | Un multi-select alimenté par une liste canonique (MATCH_CATEGORIES) peut ne pas couvrir des valeurs historiques présentes dans les données réelles (ex. entraîneur catégorie "Baby", ou "-15M/-18M" qui n'existe dans aucune liste canonique) | Si on restreint un multi-select aux seules options canoniques, toute valeur existante hors-liste est invisible dans le formulaire et disparaît silencieusement à la prochaine sauvegarde. Fix : construire les options affichées comme l'union de la liste canonique ET des valeurs déjà sélectionnées sur la fiche en cours d'édition (`Array.from(new Set([...MATCH_CATEGORIES, ...valeursActuelles]))`).

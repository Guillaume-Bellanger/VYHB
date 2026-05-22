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

[2026-05-18] | supabase.ts ne doit pas throw à l'import | Si les variables d'env Supabase sont absentes (ex: react-snap SSG), un throw à l'import crashe toute l'app. Solution : utiliser des placeholders et exporter isSupabaseConfigured pour conditionner les queries avec enabled.

[2026-05-18] | Les queries publiques doivent être SSG-safe | Toujours ajouter enabled: isSupabaseConfigured aux hooks TanStack Query des pages publiques pour éviter des erreurs réseau pendant le pré-rendu react-snap.

[2026-05-22] | Ne jamais appeler navigate() ou setState pendant le rendu | Appeler navigate() directement dans le corps d'un composant (hors event handler) déclenche "Cannot update a component while rendering a different component". Toujours entourer dans un useEffect avec les bonnes dépendances.

[2026-05-22] | data ?? [] dans queryFn pour éviter null as Match[] | Supabase peut retourner null pour un résultat vide selon le contexte. Toujours retourner (data ?? []) as Match[] pour garantir un tableau. Et dans le rendu, ne jamais tester results?.length === 0 seul — utiliser isError + results.length (quand data est garanti non-null par le hook).

[2026-05-22] | Une seule query + split client-side > deux queries séparées | Pour une page qui affiche deux sections (résultats + à venir) du même dataset, préférer un seul useQuery avec .in("statut", [...]) et filtrer côté client. Réduit les requêtes réseau et simplifie la gestion des états loading/error.

[2026-05-22] | signIn() doit set user et isLoading explicitement, pas seulement via onAuthStateChange | Si onAuthStateChange arrive tard ou échoue silencieusement, le store reste bloqué (isLoading: true, user: null). Fix : dans signIn(), après fetchProfile(), appeler set({ user, isLoading: false }) explicitement. Ajouter aussi un safety timeout de 5s dans _init() qui force isLoading: false si toujours vrai.

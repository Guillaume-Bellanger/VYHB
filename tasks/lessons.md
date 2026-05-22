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

[2026-05-18 → corrigé 2026-05-22] | Ne PAS utiliser enabled: isSupabaseConfigured dans les hooks publics | enabled: isSupabaseConfigured désactive la query si les env vars Vite ne sont pas injectées (ex: dev server démarré avant .env.local, ou build sans variables). La query est alors silencieusement disabled → zéro requête réseau, zéro message d'erreur. Fix : supprimer enabled, laisser TanStack Query catcher les erreurs réseau. SSG-safety garantie par les placeholders dans supabase.ts (pas de throw à l'import). isSupabaseConfigured doit se baser sur l'URL résolue (supabaseUrl !== placeholder), pas sur import.meta.env brut.

[2026-05-22] | Ne jamais appeler navigate() ou setState pendant le rendu | Appeler navigate() directement dans le corps d'un composant (hors event handler) déclenche "Cannot update a component while rendering a different component". Toujours entourer dans un useEffect avec les bonnes dépendances.

[2026-05-22] | data ?? [] dans queryFn pour éviter null as Match[] | Supabase peut retourner null pour un résultat vide selon le contexte. Toujours retourner (data ?? []) as Match[] pour garantir un tableau. Et dans le rendu, ne jamais tester results?.length === 0 seul — utiliser isError + results.length (quand data est garanti non-null par le hook).

[2026-05-22] | Une seule query + split client-side > deux queries séparées | Pour une page qui affiche deux sections (résultats + à venir) du même dataset, préférer un seul useQuery avec .in("statut", [...]) et filtrer côté client. Réduit les requêtes réseau et simplifie la gestion des états loading/error.

[2026-05-22] | signIn() doit set user et isLoading explicitement, pas seulement via onAuthStateChange | Si onAuthStateChange arrive tard ou échoue silencieusement, le store reste bloqué (isLoading: true, user: null). Fix : dans signIn(), après fetchProfile(), appeler set({ user, isLoading: false }) explicitement. Ajouter aussi un safety timeout de 5s dans _init() qui force isLoading: false si toujours vrai.

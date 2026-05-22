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

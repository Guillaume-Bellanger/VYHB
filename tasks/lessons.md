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

// Source unique de l'ordre des catégories — précédemment dupliquée et
// incohérente entre src/pages/admin/MatchFormPage.tsx, MatchListAdminPage.tsx,
// UsersPage.tsx et EncadrementPage.tsx (chacune avec sa propre copie locale,
// EncadrementPage.tsx utilisait même MATCH_CATEGORIES pour son multi-select,
// ce qui rendait "Baby Hand" impossible à sélectionner pour un entraîneur).
// Cette liste fait foi ; toutes les pages ci-dessus importent CATEGORIES ou
// MATCH_CATEGORIES depuis ce fichier plutôt que de la recopier.
//
// -9/-11 scindé en "-9" et "-11 Mixte", ajout de "-13F", "-15M"→"-15M/-18M",
// "-15F"→"-15F/-18F" (les données existantes en base seront réalignées par
// supabase/migrations/018_categories.sql).

export const CATEGORIES = [
  "Baby Hand",
  "-7",
  "-9",
  "-11 Mixte",
  "-11F",
  "-13M",
  "-13F",
  "-15M/-18M",
  "-15F/-18F",
  "Séniors Masculins",
  "Séniors Féminines",
  "Loisirs",
] as const;

// Baby Hand ne joue pas de matchs — catégories utilisées sur /resultats.
export const MATCH_CATEGORIES = CATEGORIES.filter((c) => c !== "Baby Hand");

export type Categorie = (typeof CATEGORIES)[number];

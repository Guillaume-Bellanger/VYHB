// Source unique de l'ordre des catégories — précédemment dupliqué et
// incohérent entre src/pages/admin/MatchFormPage.tsx, MatchListAdminPage.tsx,
// UsersPage.tsx (Séniors Masculins avant Séniors Féminines) et l'ancien
// ALL_CATS de Resultats.tsx (ordre inversé). Cette liste fait foi.

export const CATEGORIES = [
  "Baby",
  "-7",
  "-9/-11",
  "-11F",
  "-13M",
  "-15M",
  "-15F",
  "Séniors Masculins",
  "Séniors Féminines",
  "Loisirs",
] as const;

// Baby Hand ne joue pas de matchs — catégories utilisées sur /resultats.
export const MATCH_CATEGORIES = CATEGORIES.filter((c) => c !== "Baby");

export type Categorie = (typeof CATEGORIES)[number];

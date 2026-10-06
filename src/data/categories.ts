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
//
// Les deux listes ci-dessous divergent volontairement dans les DEUX sens :
// - CATEGORIES : les collectifs d'entraînement (utilisée aussi pour affecter
//   un rôle "encadrement"/utilisateur à une catégorie). Les -15 et -18 s'y
//   entraînent ensemble ("-15M/-18M", "-15F/-18F") : un seul collectif par
//   sexe, pas d'entrée séparée pour les -18.
// - MATCH_CATEGORIES : les catégories utilisées pour un MATCH (formulaire
//   match, liste admin, page publique /resultats, filtre par onglets). Deux
//   différences avec CATEGORIES :
//   - "Baby Hand" en est exclu (cette catégorie ne joue pas de matchs) ;
//   - les collectifs "-15M/-18M" et "-15F/-18F" y sont éclatés en "-15M",
//     "-18M", "-15F" et "-18F" : en championnat, chaque collectif "-15/-18"
//     engage DEUX équipes distinctes (une -15 et une -18), qui doivent donc
//     être sélectionnées séparément comme catégorie de match, alors qu'elles
//     ne forment qu'un seul collectif à l'entraînement. (Aucun match en base
//     n'utilisait les valeurs combinées au moment de l'éclatement.)

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

export const MATCH_CATEGORIES = [
  "-7",
  "-9",
  "-11 Mixte",
  "-11F",
  "-13M",
  "-13F",
  "-15M",
  "-18M",
  "-15F",
  "-18F",
  "Séniors Masculins",
  "Séniors Féminines",
  "Loisirs",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

// Catégories de match couvertes par un collectif : un entraîneur rattaché à
// "-15M/-18M" gère les matchs -15M ET -18M. Miroir SQL :
// match_categories_for() (supabase/migrations/022_entraineur_categories_match.sql).
const MATCH_CATEGORIES_PAR_COLLECTIF: Record<string, readonly string[]> = {
  "-15M/-18M": ["-15M", "-18M"],
  "-15F/-18F": ["-15F", "-18F"],
};

export function matchCategoriesFor(categorie: string): readonly string[] {
  return MATCH_CATEGORIES_PAR_COLLECTIF[categorie] ?? [categorie];
}

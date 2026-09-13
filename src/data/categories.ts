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
//   - "-18M" et "-18F" y sont ajoutées en plus : en championnat, le collectif
//     "-15/-18" engage DEUX équipes distinctes (une -15 et une -18), qui
//     doivent donc pouvoir être sélectionnées séparément comme catégorie de
//     match, alors qu'elles ne forment qu'un seul collectif à l'entraînement.

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
  "-15M/-18M",
  "-18M",
  "-15F/-18F",
  "-18F",
  "Séniors Masculins",
  "Séniors Féminines",
  "Loisirs",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

export type SiteContentType = "texte" | "texte_long" | "liste";

export interface SiteContentRow {
  cle: string;
  libelle: string;
  groupe: string;
  type: SiteContentType;
  valeur: unknown; // string pour texte/texte_long, tableau pour liste
  ordre: number;
  updated_at: string;
}

// Formes connues des entrées de type "liste" utilisées sur le site
export interface HistoriqueItem {
  annee: string;
  titre: string;
  texte: string;
}

export interface ValeurItem {
  titre: string;
  texte: string;
}

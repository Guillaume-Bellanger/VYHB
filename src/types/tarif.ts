export interface Tarif {
  id: string;
  libelle: string;
  montant: number;
  saison: string;
  note: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

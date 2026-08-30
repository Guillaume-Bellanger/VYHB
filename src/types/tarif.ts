export interface Tarif {
  id: string;
  libelle: string;
  montant: number;
  saison: string;
  note: string | null;
  ordre: number;
  actif: boolean;
  supprime_le: string | null;
  supprime_par: string | null;
  created_at: string;
  updated_at: string;
}

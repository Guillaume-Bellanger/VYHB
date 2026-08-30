export interface Horaire {
  jour: string;
  debut: string;
  fin: string;
}

export interface Lieu {
  jour: string;
  lieu: string;
}

export interface Collectif {
  id: string;
  slug: string;
  nom: string;
  sous_titre: string | null;
  tranche_age: string | null;
  description: string | null;
  horaires: Horaire[];
  lieux: Lieu[];
  entraineurs: string[];
  photo_url: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

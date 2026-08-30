export type EncadrementType = "entraineur" | "bureau" | "pole";

export interface Encadrement {
  id: string;
  type: EncadrementType;
  prenom: string | null;
  nom: string | null;
  role: string | null;
  categories: string[] | null;
  photo_url: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

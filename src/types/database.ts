export type UserRole = "super_admin" | "president" | "entraineur" | "evenements_com";
export type MatchType = "championnat" | "coupe" | "amical" | "tournoi";
export type MatchStatut = "prevu" | "joue" | "publie";

export interface Profile {
  id: string;
  role: UserRole;
  categorie: string | null;
  full_name: string;
  email: string | null;
  disabled: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  date: string;
  adversaire: string;
  domicile: boolean;
  score_nous: number | null;
  score_eux: number | null;
  categorie: string;
  type: MatchType;
  statut: MatchStatut;
  resume: string | null;
  lieu: string | null;
  created_by: string;
  updated_at: string;
  created_at: string;
}

export interface PendingInvite {
  email: string;
  role: UserRole;
  categorie: string | null;
  invited_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Match, "id" | "created_at">>;
      };
      pending_invites: {
        Row: PendingInvite;
        Insert: Omit<PendingInvite, "invited_at"> & { invited_at?: string };
        Update: Partial<PendingInvite>;
      };
    };
    Enums: {
      user_role: UserRole;
      match_type: MatchType;
      match_statut: MatchStatut;
    };
  };
}

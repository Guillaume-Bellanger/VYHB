export interface BureauMember {
  prenom?: string;
  role: string;
  avatarUrl?: string;
  featured?: boolean;
}

export const bureau: BureauMember[] = [
  {
    prenom: "Fred",
    role: "Président",
    avatarUrl: "https://ui-avatars.com/api/?name=Fred&background=cc0000&color=fff&size=128&bold=true",
    featured: true,
  },
  {
    role: "Vice-Président",
  },
  {
    prenom: "Véronique",
    role: "Trésorière",
    avatarUrl: "https://ui-avatars.com/api/?name=Veronique&background=059669&color=fff&size=128&bold=true",
    featured: true,
  },
  {
    role: "Secrétaire",
  },
];

export const responsablesPoles: BureauMember[] = [
  { role: "Resp. Matériel" },
  { role: "Resp. Communication" },
];

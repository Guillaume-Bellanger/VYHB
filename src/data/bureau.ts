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
    avatarUrl: "/images/Fred.jpeg",
    featured: true,
  },
  {
    role: "Vice-Président",
  },
  {
    prenom: "Véronique",
    role: "Trésorière",
    avatarUrl: "/images/Vero.jpeg",
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

export interface BureauMember {
  role: string;
  avatarUrl: string;
}

export const bureau: BureauMember[] = [
  {
    role: "Président",
    avatarUrl: "https://ui-avatars.com/api/?name=President&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    role: "Vice-Président",
    avatarUrl: "https://ui-avatars.com/api/?name=Vice+President&background=ea580c&color=fff&size=128&bold=true",
  },
  {
    role: "Trésorière",
    avatarUrl: "https://ui-avatars.com/api/?name=Tresoriere&background=059669&color=fff&size=128&bold=true",
  },
  {
    role: "Resp. Matériel",
    avatarUrl: "https://ui-avatars.com/api/?name=Resp+Materiel&background=2563eb&color=fff&size=128&bold=true",
  },
  {
    role: "Resp. Communication",
    avatarUrl: "https://ui-avatars.com/api/?name=Resp+Communication&background=7c3aed&color=fff&size=128&bold=true",
  },
  {
    role: "Resp. Événementiel",
    avatarUrl: "https://ui-avatars.com/api/?name=Resp+Evenementiel&background=db2777&color=fff&size=128&bold=true",
  },
];

export interface Entraineur {
  prenom: string;
  role: string;
  avatarUrl: string;
}

export const entraineurs: Entraineur[] = [
  {
    prenom: "Thomas",
    role: "Seniors Masculins",
    avatarUrl: "https://ui-avatars.com/api/?name=Thomas&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Sophie",
    role: "Seniors Féminines",
    avatarUrl: "https://ui-avatars.com/api/?name=Sophie&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Karim",
    role: "-15/-18M",
    avatarUrl: "https://ui-avatars.com/api/?name=Karim&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Julie",
    role: "-15/-18F",
    avatarUrl: "https://ui-avatars.com/api/?name=Julie&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Marc",
    role: "-13F",
    avatarUrl: "https://ui-avatars.com/api/?name=Marc&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Léa",
    role: "-11M / -11F",
    avatarUrl: "https://ui-avatars.com/api/?name=Lea&background=cc0000&color=fff&size=128&bold=true",
  },
  {
    prenom: "Paul",
    role: "-9 / -7 / Baby Hand",
    avatarUrl: "https://ui-avatars.com/api/?name=Paul&background=cc0000&color=fff&size=128&bold=true",
  },
];

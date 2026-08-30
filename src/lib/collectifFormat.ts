import type { Horaire, Lieu } from "@/types/collectif";

// ── Affichage horaires ────────────────────────────────────────

export function formatHoraire(h: Horaire): string {
  return `${h.jour} ${h.debut}–${h.fin}`;
}

export function formatHoraires(horaires: Horaire[]): string {
  return horaires.map(formatHoraire).join("\n");
}

// ── Affichage lieux ────────────────────────────────────────────
// Si tous les lieux sont identiques, on affiche une seule ligne.
// Sinon, une ligne "Jour : Lieu" par entrée (même format que l'ancien
// champ `location` de src/data/collectifs.ts).

export function formatLieux(lieux: Lieu[]): string {
  if (lieux.length === 0) return "";
  const distinct = new Set(lieux.map((l) => l.lieu));
  if (distinct.size === 1) return lieux[0].lieu;
  return lieux.map((l) => `${l.jour} : ${l.lieu}`).join("\n");
}

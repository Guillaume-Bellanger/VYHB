import { Star, Zap, Trophy, Flame, Crown, Users, Heart, Sparkles } from "lucide-react";

// Détails purement visuels (icône + dégradé) par slug — non éditables depuis
// l'admin, conservés en dur comme avant la migration Supabase.
// Une nouvelle fiche créée depuis l'admin (slug inconnu ici) retombe sur le
// fallback par défaut ci-dessous.

export const collectifIcons: Record<string, React.ElementType> = {
  "baby-hand": Heart,
  "-7": Star,
  "-9-11": Zap,
  "-11f": Sparkles,
  "-13m": Flame,
  "-15-18f": Flame,
  "-15-18m": Trophy,
  "seniors-feminines": Crown,
  "seniors-masculins": Trophy,
  "loisirs": Users,
};

export const collectifGradients: Record<string, string> = {
  "baby-hand": "from-yellow-900/70 to-yellow-700/40",
  "-7": "from-lime-900/70 to-lime-700/40",
  "-9-11": "from-green-900/70 to-green-700/40",
  "-11f": "from-pink-900/70 to-pink-700/40",
  "-13m": "from-rose-900/70 to-rose-700/40",
  "-15-18m": "from-orange-900/70 to-orange-700/40",
  "-15-18f": "from-purple-900/70 to-purple-700/40",
  "seniors-feminines": "from-violet-900/70 to-violet-700/40",
  "seniors-masculins": "from-blue-900/70 to-blue-700/40",
  "loisirs": "from-indigo-900/70 to-indigo-700/40",
};

export const DEFAULT_ICON = Star;
export const DEFAULT_GRADIENT = "from-slate-900/70 to-slate-700/40";

export function getCollectifIcon(slug: string): React.ElementType {
  return collectifIcons[slug] ?? DEFAULT_ICON;
}

export function getCollectifGradient(slug: string): string {
  return collectifGradients[slug] ?? DEFAULT_GRADIENT;
}

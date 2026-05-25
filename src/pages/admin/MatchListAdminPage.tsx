import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMatches, useDeleteMatch, useUpdateMatch, type MatchFilters } from "@/hooks/useMatches";
import type { Match, MatchStatut } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUT_LABELS: Record<MatchStatut, string> = {
  prevu: "Prévu",
  joue: "Joué",
  publie: "Publié",
};

const STATUT_VARIANTS: Record<MatchStatut, string> = {
  prevu: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  joue: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  publie: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  championnat: "Championnat",
  coupe: "Coupe",
  amical: "Amical",
  tournoi: "Tournoi",
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: MatchStatut }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUT_VARIANTS[statut]}`}>
      {STATUT_LABELS[statut]}
    </span>
  );
}

function Score({ match }: { match: Match }) {
  if (match.statut === "prevu" || match.score_nous == null || match.score_eux == null) {
    return <span className="text-white/25">—</span>;
  }
  return (
    <span className="font-mono font-bold text-white">
      {match.score_nous} – {match.score_eux}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MatchListAdminPage() {
  const navigate = useNavigate();
  const { isAdmin, can, role, categorie } = useAuth();

  const [filters, setFilters] = useState<MatchFilters>({});
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  const { data: matches, isLoading, error } = useMatches(filters);
  const deleteMutation = useDeleteMatch();
  const updateMutation = useUpdateMatch();

  const canCreate = can("manage_own_matches");

  function handlePublish(match: Match) {
    updateMutation.mutate({ id: match.id, data: { statut: "publie" } });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  const showCatFilter = can("manage_all_matches");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-black text-white">Matchs</h1>
          {role === "entraineur" && categorie && (
            <p className="text-white/40 text-sm mt-0.5">Catégorie : {categorie}</p>
          )}
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate("/admin/matches/new")}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
          >
            <Plus size={16} />
            Nouveau match
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select
          value={filters.statut ?? "tous"}
          onValueChange={(v) => setFilters((f) => ({ ...f, statut: v === "tous" ? undefined : v as MatchStatut }))}
        >
          <SelectTrigger className="w-40 bg-white/[0.04] border-white/[0.10] text-white">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="prevu">Prévu</SelectItem>
            <SelectItem value="joue">Joué</SelectItem>
            <SelectItem value="publie">Publié</SelectItem>
          </SelectContent>
        </Select>

        {showCatFilter && (
          <Select
            value={filters.categorie ?? "tous"}
            onValueChange={(v) => setFilters((f) => ({ ...f, categorie: v === "tous" ? undefined : v }))}
          >
            <SelectTrigger className="w-48 bg-white/[0.04] border-white/[0.10] text-white">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Toutes les catégories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* État vide / chargement / erreur */}
      {isLoading && (
        <div className="flex items-center gap-2 text-white/40 py-12 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span>Chargement…</span>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          Erreur : {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && matches?.length === 0 && (
        <p className="text-white/30 text-sm py-12 text-center">
          Aucun match trouvé.{canCreate && " Créez-en un !"}
        </p>
      )}

      {/* Cartes mobile */}
      {!isLoading && matches && matches.length > 0 && (
        <div className="md:hidden space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-semibold text-sm">{match.adversaire}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${match.domicile ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-white/40"}`}>
                      {match.domicile ? "DOM" : "EXT"}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs">
                    {format(new Date(match.date), "d MMM yyyy · HH:mm", { locale: fr })}
                  </p>
                  <p className="text-white/35 text-xs mt-0.5">
                    {match.categorie} · {TYPE_LABELS[match.type]}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <StatutBadge statut={match.statut} />
                  <Score match={match} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                {can("publish_match") && match.statut === "joue" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={updateMutation.isPending}
                    onClick={() => handlePublish(match)}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2.5 text-xs gap-1"
                  >
                    <Eye size={12} />
                    Publier
                  </Button>
                )}
                <div className="ml-auto flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/matches/${match.id}/edit`)}
                    className="text-white/50 hover:text-white hover:bg-white/[0.06] h-8 w-8 p-0"
                  >
                    <Pencil size={13} />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(match)}
                      className="text-white/30 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tableau desktop */}
      {!isLoading && matches && matches.length > 0 && (
        <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40 font-medium">Date</TableHead>
                <TableHead className="text-white/40 font-medium">Adversaire</TableHead>
                <TableHead className="text-white/40 font-medium">Catégorie</TableHead>
                <TableHead className="text-white/40 font-medium">Type</TableHead>
                <TableHead className="text-white/40 font-medium">Statut</TableHead>
                <TableHead className="text-white/40 font-medium">Score</TableHead>
                <TableHead className="text-white/40 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                  <TableCell className="text-white/70 text-sm whitespace-nowrap">
                    {format(new Date(match.date), "d MMM yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-2">
                      <span>{match.adversaire}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${match.domicile ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-white/40"}`}>
                        {match.domicile ? "DOM" : "EXT"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">{match.categorie}</TableCell>
                  <TableCell className="text-white/60 text-sm">{TYPE_LABELS[match.type]}</TableCell>
                  <TableCell><StatutBadge statut={match.statut} /></TableCell>
                  <TableCell><Score match={match} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {can("publish_match") && match.statut === "joue" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updateMutation.isPending}
                          onClick={() => handlePublish(match)}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 px-2 text-xs gap-1"
                        >
                          <Eye size={13} />
                          Publier
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/matches/${match.id}/edit`)}
                        className="text-white/50 hover:text-white hover:bg-white/[0.06] h-8 w-8 p-0"
                      >
                        <Pencil size={14} />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(match)}
                          className="text-white/30 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de confirmation suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#111118] border-white/[0.08] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Supprimer ce match ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              {deleteTarget?.adversaire} — {deleteTarget && format(new Date(deleteTarget.date), "d MMMM yyyy", { locale: fr })}
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.04] border-white/[0.10] text-white hover:bg-white/[0.08]">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const CATEGORIES = [
  "Baby",
  "-7",
  "-9/-11",
  "-11F",
  "-13M",
  "-15M",
  "-15F",
  "Séniors Masculins",
  "Séniors Féminines",
  "Loisirs",
];

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2, Check, X, ArrowUp, ArrowDown, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  useTarifsAdmin,
  useCreateTarif,
  useUpdateTarif,
  useDeleteTarif,
  useReorderTarifs,
} from "@/hooks/useTarifs";
import type { Tarif } from "@/types/tarif";

const DEFAULT_SAISON = "2026/2027";

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  libelle: z.string().min(1, "Libellé requis"),
  montant: z.coerce.number({ invalid_type_error: "Montant requis" }).min(0, "Montant invalide"),
  note: z.string().optional(),
  actif: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TarifsPage() {
  const { data: all = [], isLoading, error: loadError } = useTarifsAdmin();
  const createTarif = useCreateTarif();
  const updateTarif = useUpdateTarif();
  const deleteTarif = useDeleteTarif();
  const reorderTarif = useReorderTarifs();

  const saisons = Array.from(new Set(all.map((t) => t.saison))).sort().reverse();
  const [saison, setSaison] = useState("");
  const currentSaison = saison || saisons[0] || DEFAULT_SAISON;

  useEffect(() => {
    if (!saison && saisons.length > 0) setSaison(saisons[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saisons.join("|")]);

  const list = all
    .filter((t) => t.saison === currentSaison)
    .sort((a, b) => a.ordre - b.ordre);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [formOrdre, setFormOrdre] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { actif: true },
  });

  function changeSaison(value: string) {
    setSaison(value);
    setEditingId(null);
  }

  function openNew() {
    setFormOrdre(list.length);
    reset({ libelle: "", montant: 0, note: "", actif: true });
    setEditingId("new");
  }

  function openEdit(t: Tarif) {
    setFormOrdre(t.ordre);
    reset({ libelle: t.libelle, montant: t.montant, note: t.note ?? "", actif: t.actif });
    setEditingId(t.id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        libelle: data.libelle.trim(),
        montant: data.montant,
        note: data.note?.trim() || null,
        saison: currentSaison,
        ordre: formOrdre,
        actif: data.actif,
      };

      if (editingId === "new") {
        await createTarif.mutateAsync(payload);
      } else if (editingId) {
        await updateTarif.mutateAsync({ id: editingId, data: payload });
      }
      setEditingId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Tarif) {
    if (!confirm(`Supprimer le tarif « ${t.libelle} » ?`)) return;
    setError(null);
    try {
      await deleteTarif.mutateAsync(t.id);
      if (editingId === t.id) setEditingId(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(t: Tarif) {
    setError(null);
    try {
      await updateTarif.mutateAsync({ id: t.id, data: { actif: !t.actif } });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const a = list[index];
    const b = list[target];
    setError(null);
    try {
      await reorderTarif.mutateAsync([
        { id: a.id, ordre: b.ordre },
        { id: b.id, ordre: a.ordre },
      ]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-black text-white">Tarifs</h1>
        <p className="text-white/40 text-sm mt-1">
          Gérez les tarifs affichés sur la page Inscriptions.
        </p>
      </div>

      {(error || loadError) && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          {error ?? (loadError as Error).message}
        </p>
      )}

      {/* Saison */}
      <div className="mb-6 max-w-xs space-y-1.5">
        <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Saison</Label>
        <Input
          value={currentSaison}
          onChange={(e) => changeSaison(e.target.value)}
          placeholder="2026/2027"
          className="bg-white/[0.04] border-white/[0.10] text-white"
        />
        {saisons.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {saisons.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSaison(s)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  s === currentSaison
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                    : "bg-white/[0.03] text-white/40 border-white/[0.10] hover:text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <p className="text-white/30 text-xs">
          Les tarifs listés et modifiés ci-dessous sont ceux de cette saison. Tapez une nouvelle saison pour en créer une.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40 font-medium">Libellé</TableHead>
                <TableHead className="text-white/40 font-medium">Montant</TableHead>
                <TableHead className="text-white/40 font-medium hidden sm:table-cell">Note</TableHead>
                <TableHead className="text-white/40 font-medium w-20">Ordre</TableHead>
                <TableHead className="text-white/40 font-medium">Actif</TableHead>
                <TableHead className="text-white/40 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && editingId !== "new" && (
                <TableRow className="border-white/[0.04] hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center text-white/25 py-10">
                    Aucun tarif pour la saison {currentSaison}.
                  </TableCell>
                </TableRow>
              )}

              {list.map((t, i) =>
                editingId === t.id ? (
                  <TableRow key={t.id} className="border-white/[0.04] bg-white/[0.02]">
                    <TableCell>
                      <Input
                        {...register("libelle")}
                        className="bg-white/[0.04] border-white/[0.10] text-white h-9"
                      />
                      {errors.libelle && <p className="text-red-400 text-xs mt-1">{errors.libelle.message}</p>}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("montant")}
                        className="bg-white/[0.04] border-white/[0.10] text-white h-9 w-24"
                      />
                      {errors.montant && <p className="text-red-400 text-xs mt-1">{errors.montant.message}</p>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Input
                        {...register("note")}
                        placeholder="Optionnel"
                        className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 h-9"
                      />
                    </TableCell>
                    <TableCell className="text-white/20 text-xs">—</TableCell>
                    <TableCell>
                      <Controller
                        name="actif"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={handleSubmit(onSubmit)}
                          disabled={saving}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                          aria-label="Enregistrer"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                          aria-label="Annuler"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={t.id} className={`border-white/[0.04] hover:bg-white/[0.03] ${!t.actif ? "opacity-50" : ""}`}>
                    <TableCell className="text-white font-medium">{t.libelle}</TableCell>
                    <TableCell className="text-orange-400 font-display font-bold">
                      {Number(t.montant).toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-white/40 text-sm hidden sm:table-cell">{t.note ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(i, -1)}
                          disabled={i === 0}
                          className="p-1 rounded text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
                          aria-label="Monter"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMove(i, 1)}
                          disabled={i === list.length - 1}
                          className="p-1 rounded text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
                          aria-label="Descendre"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggle(t)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          t.actif
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                            : "bg-white/[0.05] text-white/30 border-white/[0.10] hover:bg-white/10 hover:text-white/50"
                        }`}
                      >
                        {t.actif ? "Actif" : "Inactif"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => (editingId === t.id ? cancelEdit() : openEdit(t))}
                          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}

              {editingId === "new" && (
                <TableRow className="border-white/[0.04] bg-white/[0.02]">
                  <TableCell>
                    <Input
                      {...register("libelle")}
                      placeholder="Libellé"
                      autoFocus
                      className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 h-9"
                    />
                    {errors.libelle && <p className="text-red-400 text-xs mt-1">{errors.libelle.message}</p>}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("montant")}
                      placeholder="0.00"
                      className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 h-9 w-24"
                    />
                    {errors.montant && <p className="text-red-400 text-xs mt-1">{errors.montant.message}</p>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Input
                      {...register("note")}
                      placeholder="Optionnel"
                      className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 h-9"
                    />
                  </TableCell>
                  <TableCell className="text-white/20 text-xs">—</TableCell>
                  <TableCell>
                    <Controller
                      name="actif"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                        aria-label="Enregistrer"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                        aria-label="Annuler"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && editingId !== "new" && (
        <Button
          type="button"
          variant="ghost"
          onClick={openNew}
          className="w-full mt-3 border border-dashed border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.04] gap-2"
        >
          <Plus size={15} />
          Ajouter un tarif
        </Button>
      )}

      <p className="text-white/20 text-xs mt-6 flex items-center gap-1.5">
        <Euro size={12} />
        Les tarifs inactifs ne s'affichent pas sur la page publique Inscriptions.
      </p>
    </div>
  );
}

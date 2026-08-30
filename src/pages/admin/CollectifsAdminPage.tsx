import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2, Plus, Pencil, Trash2, X, ImageIcon, AlertTriangle,
  ArrowUp, ArrowDown, Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useCollectifsAdmin,
  useCreateCollectif,
  useUpdateCollectif,
  useDeleteCollectif,
  useReorderCollectifs,
  useCollectifsTrash,
  useRestoreCollectif,
  useHardDeleteCollectif,
} from "@/hooks/useCollectifs";
import { useAuth } from "@/hooks/useAuth";
import TrashSection from "@/components/admin/TrashSection";
import type { Collectif } from "@/types/collectif";

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadPhoto(file: File): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  let token: string | undefined;
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (raw) {
      const session = JSON.parse(raw) as { access_token?: string };
      token = session.access_token;
    }
  } catch {}

  if (!token) {
    throw new Error("Session introuvable — reconnectez-vous et réessayez.");
  }

  const prefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${prefix}-${safeName}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/collectifs/${filename}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload échoué (${res.status})${text ? `: ${text}` : ""}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/collectifs/${filename}`;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo

// ── Form schema ───────────────────────────────────────────────────────────────

// Pas de validation stricte par ligne : les lignes vides (créneau/lieu non
// renseigné) sont simplement ignorées à la soumission (cf. onSubmit) plutôt
// que de bloquer le formulaire avec des erreurs invisibles sur les lignes
// dynamiques.
const horaireSchema = z.object({
  jour: z.string(),
  debut: z.string(),
  fin: z.string(),
});

const lieuSchema = z.object({
  jour: z.string(),
  lieu: z.string(),
});

const schema = z.object({
  nom: z.string().min(1, "Nom requis"),
  slug: z.string().min(1, "Slug requis").regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets uniquement"),
  sous_titre: z.string().nullable().optional(),
  tranche_age: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  horaires: z.array(horaireSchema).default([]),
  lieux: z.array(lieuSchema).default([]),
  entraineurs: z.string().optional(),
  ordre: z.coerce.number().int().default(0),
  actif: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children, hint }: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</Label>
      {children}
      {hint && !error && <p className="text-white/30 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── PhotoUpload ───────────────────────────────────────────────────────────────

function PhotoUpload({
  previewUrl,
  onSelect,
  onClear,
  sizeWarning,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  sizeWarning: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onSelect(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img src={previewUrl} alt="Aperçu" className="w-full h-44 object-cover" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-medium hover:bg-black/85 transition-colors">
              Changer
              <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
            </label>
            <button
              type="button"
              onClick={onClear}
              className="px-2.5 py-1 rounded-lg bg-black/70 text-red-400 text-xs font-medium hover:bg-red-900/50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-white/[0.12] rounded-xl cursor-pointer hover:border-white/25 hover:bg-white/[0.02] transition-colors">
          <ImageIcon size={24} className="text-white/25" />
          <span className="text-white/40 text-sm">Choisir une photo</span>
          <span className="text-white/20 text-xs">JPG, PNG, WebP</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>
      )}
      {sizeWarning && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs">
          <AlertTriangle size={12} />
          <span>Image volumineuse (&gt; 2 Mo) — pensez à la compresser avant l'upload.</span>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CollectifsAdminPage() {
  const { data: collectifs = [], isLoading, error: loadError } = useCollectifsAdmin();
  const createCollectif = useCreateCollectif();
  const updateCollectif = useUpdateCollectif();
  const deleteCollectif = useDeleteCollectif();
  const reorderCollectifs = useReorderCollectifs();
  const { data: trash = [], isLoading: trashLoading } = useCollectifsTrash();
  const restoreCollectif = useRestoreCollectif();
  const hardDeleteCollectif = useHardDeleteCollectif();
  const { isAdmin } = useAuth();

  const [formMode, setFormMode] = useState<null | "new" | string>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoCleared, setPhotoCleared] = useState(false);

  const displayPhotoUrl = photoPreview ?? (photoCleared ? null : existingPhotoUrl);
  const photoSizeWarning = photoFile !== null && photoFile.size > MAX_SIZE;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { horaires: [], lieux: [], entraineurs: "", actif: true, ordre: 0 },
  });

  const horairesArray = useFieldArray({ control, name: "horaires" });
  const lieuxArray = useFieldArray({ control, name: "lieux" });

  const nomValue = watch("nom");

  useEffect(() => {
    if (formMode === "new" && !slugTouched) {
      setValue("slug", slugify(nomValue ?? ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomValue, slugTouched, formMode]);

  function resetPhotoState() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setExistingPhotoUrl(null);
    setPhotoCleared(false);
  }

  function handlePhotoSelect(file: File) {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoCleared(false);
  }

  function handlePhotoClear() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoCleared(true);
  }

  function openNew() {
    resetPhotoState();
    setSlugTouched(false);
    reset({
      nom: "",
      slug: "",
      sous_titre: "",
      tranche_age: "",
      description: "",
      horaires: [{ jour: "", debut: "", fin: "" }],
      lieux: [{ jour: "", lieu: "" }],
      entraineurs: "",
      ordre: collectifs.length,
      actif: true,
    });
    setFormMode("new");
  }

  function openEdit(c: Collectif) {
    resetPhotoState();
    setExistingPhotoUrl(c.photo_url ?? null);
    setSlugTouched(true);
    reset({
      nom: c.nom,
      slug: c.slug,
      sous_titre: c.sous_titre ?? "",
      tranche_age: c.tranche_age ?? "",
      description: c.description ?? "",
      horaires: c.horaires?.length ? c.horaires : [{ jour: "", debut: "", fin: "" }],
      lieux: c.lieux?.length ? c.lieux : [{ jour: "", lieu: "" }],
      entraineurs: (c.entraineurs ?? []).join(", "),
      ordre: c.ordre,
      actif: c.actif,
    });
    setFormMode(c.id);
  }

  function closeForm() {
    resetPhotoState();
    setFormMode(null);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError(null);
    try {
      let photo_url: string | null;
      if (photoFile) {
        photo_url = await uploadPhoto(photoFile);
      } else if (photoCleared) {
        photo_url = null;
      } else {
        photo_url = existingPhotoUrl;
      }

      const payload = {
        nom: data.nom,
        slug: data.slug,
        sous_titre: data.sous_titre || null,
        tranche_age: data.tranche_age || null,
        description: data.description || null,
        horaires: data.horaires
          .map((h) => ({ jour: (h.jour ?? "").trim(), debut: (h.debut ?? "").trim(), fin: (h.fin ?? "").trim() }))
          .filter((h) => h.jour && h.debut && h.fin),
        lieux: data.lieux
          .map((l) => ({ jour: (l.jour ?? "").trim(), lieu: (l.lieu ?? "").trim() }))
          .filter((l) => l.jour && l.lieu),
        entraineurs: (data.entraineurs ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        photo_url,
        ordre: data.ordre,
        actif: data.actif,
      };

      if (formMode === "new") {
        await createCollectif.mutateAsync(payload);
      } else {
        await updateCollectif.mutateAsync({ id: formMode as string, data: payload });
      }

      closeForm();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Collectif) {
    if (!confirm(`Supprimer le collectif « ${c.nom} » ?`)) return;
    setError(null);
    try {
      await deleteCollectif.mutateAsync(c.id);
      if (formMode === c.id) closeForm();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(c: Collectif) {
    setError(null);
    try {
      await updateCollectif.mutateAsync({ id: c.id, data: { actif: !c.actif } });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= collectifs.length) return;
    const a = collectifs[index];
    const b = collectifs[target];
    setError(null);
    try {
      await reorderCollectifs.mutateAsync([
        { id: a.id, ordre: b.ordre },
        { id: b.id, ordre: a.ordre },
      ]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleRestore(id: string) {
    setError(null);
    try {
      await restoreCollectif.mutateAsync(id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleHardDelete(id: string) {
    setError(null);
    try {
      await hardDeleteCollectif.mutateAsync(id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-white">Collectifs</h1>
          <p className="text-white/40 text-sm mt-1">
            Gérez les équipes affichées sur les pages publiques (Collectifs, Inscriptions).
          </p>
        </div>
        {formMode === null && (
          <Button
            onClick={openNew}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
          >
            <Plus size={15} />
            Ajouter
          </Button>
        )}
      </div>

      {(error || loadError) && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          {error ?? (loadError as Error).message}
        </p>
      )}

      {/* Formulaire */}
      {formMode !== null && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8 space-y-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-display font-bold text-lg">
              {formMode === "new" ? "Nouveau collectif" : "Modifier le collectif"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Nom" error={errors.nom?.message}>
              <Input
                {...register("nom")}
                placeholder="Séniors Féminines"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            <Field
              label="Slug"
              error={errors.slug?.message}
              hint="Utilisé dans l'URL /collectifs/…"
            >
              <Input
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
                placeholder="seniors-feminines"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Sous-titre" hint="Ex : Départemental">
              <Input
                {...register("sous_titre")}
                placeholder="Départemental"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            <Field label="Tranche d'âge">
              <Input
                {...register("tranche_age")}
                placeholder="Dès 18 ans"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
          </div>

          <Field label="Description" hint="Sauts de ligne conservés à l'affichage">
            <Textarea
              {...register("description")}
              rows={4}
              placeholder="Présentation du collectif…"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 resize-y"
            />
          </Field>

          {/* Horaires */}
          <div className="space-y-2.5">
            <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Horaires</Label>
            {horairesArray.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input
                  {...register(`horaires.${i}.jour` as const)}
                  placeholder="Jour (ex : Mardi)"
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                />
                <Input
                  {...register(`horaires.${i}.debut` as const)}
                  placeholder="Début (ex : 18h30)"
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                />
                <Input
                  {...register(`horaires.${i}.fin` as const)}
                  placeholder="Fin (ex : 20h)"
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                />
                <button
                  type="button"
                  onClick={() => horairesArray.remove(i)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  aria-label="Supprimer ce créneau"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => horairesArray.append({ jour: "", debut: "", fin: "" })}
              className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              + Ajouter un créneau
            </button>
          </div>

          {/* Lieux */}
          <div className="space-y-2.5">
            <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Lieux</Label>
            {lieuxArray.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input
                  {...register(`lieux.${i}.jour` as const)}
                  placeholder="Jour (ex : Mardi)"
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 w-40 shrink-0"
                />
                <Input
                  {...register(`lieux.${i}.lieu` as const)}
                  placeholder="Lieu (ex : Halle des Sports, Boussy-Saint-Antoine)"
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                />
                <button
                  type="button"
                  onClick={() => lieuxArray.remove(i)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  aria-label="Supprimer ce lieu"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => lieuxArray.append({ jour: "", lieu: "" })}
              className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              + Ajouter un lieu
            </button>
          </div>

          <Field label="Entraîneurs" hint="Séparés par des virgules">
            <Input
              {...register("entraineurs")}
              placeholder="Guillaume, Sylvain"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
            />
          </Field>

          <Field label="Photo" hint={displayPhotoUrl ? undefined : "Optionnel"}>
            <PhotoUpload
              previewUrl={displayPhotoUrl}
              onSelect={handlePhotoSelect}
              onClear={handlePhotoClear}
              sizeWarning={photoSizeWarning}
            />
          </Field>

          <Field label="Visibilité">
            <Controller
              name="actif"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span className="text-sm text-white/60">
                    {field.value ? "Actif (visible sur le site)" : "Masqué"}
                  </span>
                </div>
              )}
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving
                ? photoFile ? "Upload en cours…" : "Enregistrement…"
                : formMode === "new" ? "Créer le collectif" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={closeForm}
              className="text-white/50 hover:text-white"
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : collectifs.length === 0 ? (
        <div className="text-center py-16 text-white/25 border border-white/[0.06] rounded-2xl">
          <Users2 size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun collectif. Cliquez sur « Ajouter » pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collectifs.map((c, i) => {
            const actionButtons = (
              <>
                <button
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
                  aria-label="Monter"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleMove(i, 1)}
                  disabled={i === collectifs.length - 1}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
                  aria-label="Descendre"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => handleToggle(c)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    c.actif
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                      : "bg-white/[0.05] text-white/30 border-white/[0.10] hover:bg-white/10 hover:text-white/50"
                  }`}
                >
                  {c.actif ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => (formMode === c.id ? closeForm() : openEdit(c))}
                  className={`p-1.5 rounded-lg transition-all ${
                    formMode === c.id
                      ? "text-orange-400 bg-orange-500/10"
                      : "text-white/30 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  aria-label="Modifier"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </>
            );

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-colors ${
                  c.actif
                    ? "bg-white/[0.03] border-white/[0.08]"
                    : "bg-white/[0.01] border-white/[0.04] opacity-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {c.photo_url ? (
                    <img
                      src={c.photo_url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <ImageIcon size={16} className="text-white/20" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{c.nom}</p>
                    <p className="text-white/35 text-xs mt-0.5 truncate">
                      {c.tranche_age}
                      {c.sous_titre && ` · ${c.sous_titre}`}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {actionButtons}
                  </div>
                </div>

                <div className="flex sm:hidden flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
                  {actionButtons}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Les collectifs inactifs ne s'affichent pas sur le site public.
      </p>

      <TrashSection
        items={trash.map((c) => ({
          id: c.id,
          label: c.nom,
          supprime_le: c.supprime_le as string,
          supprime_par_profile: c.supprime_par_profile,
        }))}
        isLoading={trashLoading}
        canHardDelete={isAdmin}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
      />
    </div>
  );
}

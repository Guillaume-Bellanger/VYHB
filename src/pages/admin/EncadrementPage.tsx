import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2, Plus, Pencil, Trash2, X, ImageIcon, AlertTriangle,
  ArrowUp, ArrowDown, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useEncadrementAdmin,
  useCreateEncadrement,
  useUpdateEncadrement,
  useDeleteEncadrement,
  useReorderEncadrement,
} from "@/hooks/useEncadrement";
import { CATEGORIES } from "@/data/categories";
import type { Encadrement, EncadrementType } from "@/types/encadrement";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<EncadrementType, string> = {
  entraineur: "Entraîneur",
  bureau: "Bureau",
  pole: "Responsable de pôle",
};

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

  const res = await fetch(`${supabaseUrl}/storage/v1/object/encadrement/${filename}`, {
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

  return `${supabaseUrl}/storage/v1/object/public/encadrement/${filename}`;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo

function personLabel(p: Encadrement): string {
  if (p.prenom) return [p.prenom, p.nom].filter(Boolean).join(" ");
  return p.role ?? "—";
}

function personSubtitle(p: Encadrement): string | null {
  if (p.type === "entraineur") return (p.categories ?? []).join(", ") || null;
  return p.prenom ? p.role : null; // évite de répéter le rôle s'il est déjà le libellé principal
}

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z
  .object({
    type: z.enum(["entraineur", "bureau", "pole"]),
    prenom: z.string().optional(),
    nom: z.string().optional(),
    role: z.string().optional(),
    categories: z.array(z.string()).optional(),
    actif: z.boolean().default(true),
  })
  .refine((d) => (d.prenom && d.prenom.trim()) || (d.role && d.role.trim()), {
    message: "Renseignez au moins un prénom ou un rôle",
    path: ["prenom"],
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
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10">
          <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1 bg-black/60">
            <label className="flex-1 text-center cursor-pointer text-[10px] text-white font-medium hover:text-orange-300">
              Changer
              <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
            </label>
            <button
              type="button"
              onClick={onClear}
              className="flex-1 text-[10px] text-red-400 font-medium hover:text-red-300"
            >
              Suppr.
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1 w-24 h-24 border-2 border-dashed border-white/[0.12] rounded-2xl cursor-pointer hover:border-white/25 hover:bg-white/[0.02] transition-colors">
          <ImageIcon size={18} className="text-white/25" />
          <span className="text-white/30 text-[10px] text-center px-1">Photo</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>
      )}
      {sizeWarning && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs">
          <AlertTriangle size={12} />
          <span>Image &gt; 2 Mo — pensez à la compresser.</span>
        </div>
      )}
    </div>
  );
}

// ── Liste d'une section ───────────────────────────────────────────────────────

function EncadrementList({
  list,
  formMode,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onMove,
}: {
  list: Encadrement[];
  formMode: string | null;
  onAdd: () => void;
  onEdit: (p: Encadrement) => void;
  onDelete: (p: Encadrement) => void;
  onToggle: (p: Encadrement) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <div className="text-center py-10 text-white/25 border border-white/[0.06] rounded-2xl">
          <User size={26} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucune fiche pour l'instant.</p>
        </div>
      )}
      {list.map((p, i) => {
        const actionButtons = (
          <>
            <button
              onClick={() => onMove(i, -1)}
              disabled={i === 0}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Monter"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => onMove(i, 1)}
              disabled={i === list.length - 1}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Descendre"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => onToggle(p)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                p.actif
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                  : "bg-white/[0.05] text-white/30 border-white/[0.10] hover:bg-white/10 hover:text-white/50"
              }`}
            >
              {p.actif ? "Actif" : "Inactif"}
            </button>
            <button
              onClick={() => onEdit(p)}
              className={`p-1.5 rounded-lg transition-all ${
                formMode === p.id
                  ? "text-orange-400 bg-orange-500/10"
                  : "text-white/30 hover:text-white hover:bg-white/[0.06]"
              }`}
              aria-label="Modifier"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(p)}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </>
        );

        return (
          <div
            key={p.id}
            className={`p-4 rounded-xl border transition-colors ${
              p.actif
                ? "bg-white/[0.03] border-white/[0.08]"
                : "bg-white/[0.01] border-white/[0.04] opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <User size={16} className="text-white/20" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{personLabel(p)}</p>
                {personSubtitle(p) && (
                  <p className="text-white/35 text-xs mt-0.5 truncate">{personSubtitle(p)}</p>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">{actionButtons}</div>
            </div>

            <div className="flex sm:hidden flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
              {actionButtons}
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        onClick={onAdd}
        className="w-full border border-dashed border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.04] gap-2"
      >
        <Plus size={15} />
        Ajouter
      </Button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EncadrementPage() {
  const { data: all = [], isLoading, error: loadError } = useEncadrementAdmin();
  const createEncadrement = useCreateEncadrement();
  const updateEncadrement = useUpdateEncadrement();
  const deleteEncadrement = useDeleteEncadrement();
  const reorderEncadrement = useReorderEncadrement();

  const entraineurs = all.filter((p) => p.type === "entraineur");
  const bureau = all.filter((p) => p.type === "bureau");
  const poles = all.filter((p) => p.type === "pole");
  const sections: { type: EncadrementType; title: string; list: Encadrement[] }[] = [
    { type: "entraineur", title: "Entraîneurs", list: entraineurs },
    { type: "bureau", title: "Le Bureau", list: bureau },
    { type: "pole", title: "Responsables de Pôles", list: poles },
  ];

  const [formMode, setFormMode] = useState<null | "new" | string>(null);
  const [formOrdre, setFormOrdre] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "entraineur", categories: [], actif: true },
  });

  const watchedType = watch("type");
  const watchedCategories = watch("categories") ?? [];
  const categoryOptions = Array.from(new Set([...CATEGORIES, ...watchedCategories]));

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

  function openNew(type: EncadrementType, sectionList: Encadrement[]) {
    resetPhotoState();
    setFormOrdre(sectionList.length);
    reset({ type, prenom: "", nom: "", role: "", categories: [], actif: true });
    setFormMode("new");
  }

  function openEdit(p: Encadrement) {
    resetPhotoState();
    setExistingPhotoUrl(p.photo_url ?? null);
    setFormOrdre(p.ordre);
    reset({
      type: p.type,
      prenom: p.prenom ?? "",
      nom: p.nom ?? "",
      role: p.role ?? "",
      categories: p.categories ?? [],
      actif: p.actif,
    });
    setFormMode(p.id);
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
        type: data.type,
        prenom: data.prenom?.trim() || null,
        nom: data.nom?.trim() || null,
        role: data.role?.trim() || null,
        categories: data.type === "entraineur" ? (data.categories ?? []) : null,
        photo_url,
        ordre: formOrdre,
        actif: data.actif,
      };

      if (formMode === "new") {
        await createEncadrement.mutateAsync(payload);
      } else {
        await updateEncadrement.mutateAsync({ id: formMode as string, data: payload });
      }

      closeForm();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Encadrement) {
    if (!confirm(`Supprimer « ${personLabel(p)} » ?`)) return;
    setError(null);
    try {
      await deleteEncadrement.mutateAsync(p.id);
      if (formMode === p.id) closeForm();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(p: Encadrement) {
    setError(null);
    try {
      await updateEncadrement.mutateAsync({ id: p.id, data: { actif: !p.actif } });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleMove(sectionList: Encadrement[], index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sectionList.length) return;
    const a = sectionList[index];
    const b = sectionList[target];
    setError(null);
    try {
      await reorderEncadrement.mutateAsync([
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
        <h1 className="text-2xl font-display font-black text-white">Encadrement</h1>
        <p className="text-white/40 text-sm mt-1">
          Gérez les entraîneurs, le bureau et les responsables de pôles affichés sur la page Le Club.
        </p>
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
              {formMode === "new" ? "Nouvelle fiche" : "Modifier la fiche"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <Field label="Type">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as EncadrementType[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Prénom" error={errors.prenom?.message}>
              <Input
                {...register("prenom")}
                placeholder="Fred"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
            <Field label="Nom" hint="Optionnel">
              <Input
                {...register("nom")}
                placeholder="Dupont"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
          </div>

          <Field
            label="Rôle"
            hint={watchedType === "entraineur" ? "Optionnel pour un entraîneur" : "Ex : Président, Trésorière, Resp. Matériel"}
          >
            <Input
              {...register("role")}
              placeholder="Président"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
            />
          </Field>

          {watchedType === "entraineur" && (
            <div className="space-y-2">
              <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Catégories encadrées</Label>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => {
                      const checked = (field.value ?? []).includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const cur = field.value ?? [];
                            field.onChange(checked ? cur.filter((c) => c !== cat) : [...cur, cat]);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            checked
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                              : "bg-white/[0.03] text-white/40 border-white/[0.10] hover:text-white/70 hover:border-white/20"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          )}

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

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving
                ? photoFile ? "Upload en cours…" : "Enregistrement…"
                : formMode === "new" ? "Créer" : "Enregistrer"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm} className="text-white/50 hover:text-white">
              Annuler
            </Button>
          </div>
        </form>
      )}

      {/* Sections */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ type, title, list }) => (
            <div key={type}>
              <h2 className="font-display font-black text-white text-lg mb-4">{title}</h2>
              <EncadrementList
                list={list}
                formMode={formMode}
                onAdd={() => openNew(type, list)}
                onEdit={(p) => (formMode === p.id ? closeForm() : openEdit(p))}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onMove={(index, direction) => handleMove(list, index, direction)}
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Les fiches inactives ne s'affichent pas sur la page publique Le Club.
      </p>
    </div>
  );
}

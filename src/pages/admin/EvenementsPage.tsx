import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2, Plus, Pencil, Trash2, X, CalendarRange, ImageIcon, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Types & helpers ───────────────────────────────────────────────────────────

type EvenementCategorie = "recrutement" | "evenement" | "tournoi" | "info" | "autre";

interface Evenement {
  id: string;
  titre: string;
  categorie: EvenementCategorie;
  date_debut: string;
  date_fin: string | null;
  lieu: string | null;
  description: string;
  photo_url: string | null;
  lien_cta: string | null;
  label_cta: string | null;
  expire_le: string | null;
  actif: boolean;
  ordre: number;
}

function evHeaders(): Record<string, string> {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  let token = key;
  try {
    const ref = new URL(url).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (raw) {
      const s = JSON.parse(raw) as { access_token?: string };
      token = s.access_token ?? key;
    }
  } catch {}
  return { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function evUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

async function uploadPhoto(file: File): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  // Lire le JWT depuis localStorage — même pattern que tous les autres hooks
  let token: string | undefined;
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (raw) {
      const session = JSON.parse(raw) as { access_token?: string };
      token = session.access_token;
    }
  } catch {}

  console.log("[uploadPhoto] token:", token ? `${token.slice(0, 20)}…` : "undefined ⚠️");

  if (!token) {
    throw new Error("Session introuvable — reconnectez-vous et réessayez.");
  }

  const prefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${prefix}-${safeName}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/evenements/${filename}`, {
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

  return `${supabaseUrl}/storage/v1/object/public/evenements/${filename}`;
}

const CATEGORIE_OPTIONS: { value: EvenementCategorie; label: string }[] = [
  { value: "recrutement", label: "Recrutement" },
  { value: "evenement", label: "Événement" },
  { value: "tournoi", label: "Tournoi" },
  { value: "info", label: "Info" },
  { value: "autre", label: "Autre" },
];

const CATEGORIE_COLORS: Record<EvenementCategorie, string> = {
  recrutement: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  evenement: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  tournoi: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  info: "bg-white/10 text-white/50 border-white/15",
  autre: "bg-violet-500/15 text-violet-400 border-violet-500/25",
};

const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  titre: z.string().min(1, "Titre requis"),
  categorie: z.enum(["recrutement", "evenement", "tournoi", "info", "autre"]),
  date_debut: z.string().min(1, "Date de début requise"),
  date_fin: z.string().nullable().optional(),
  lieu: z.string().nullable().optional(),
  description: z.string().min(1, "Description requise"),
  lien_cta: z.string().nullable().optional(),
  label_cta: z.string().nullable().optional(),
  expire_le: z.string().nullable().optional(),
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
          <span className="text-white/20 text-xs">JPG, PNG, WebP — format 16:9 recommandé</span>
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

export default function EvenementsPage() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<null | "new" | string>(null);
  const [saving, setSaving] = useState(false);

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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categorie: "evenement", actif: true, ordre: 0 },
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(evUrl("evenements?order=ordre.asc,date_debut.asc"), {
        headers: evHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEvents(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

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
    reset({
      categorie: "evenement",
      actif: true,
      ordre: events.length,
      titre: "",
      date_debut: "",
      description: "",
      date_fin: null,
      lieu: null,
      lien_cta: null,
      label_cta: null,
      expire_le: null,
    });
    setFormMode("new");
  }

  function openEdit(ev: Evenement) {
    resetPhotoState();
    setExistingPhotoUrl(ev.photo_url ?? null);
    reset({
      titre: ev.titre,
      categorie: ev.categorie,
      date_debut: ev.date_debut,
      date_fin: ev.date_fin ?? null,
      lieu: ev.lieu ?? null,
      description: ev.description,
      lien_cta: ev.lien_cta ?? null,
      label_cta: ev.label_cta ?? null,
      expire_le: ev.expire_le ?? null,
      ordre: ev.ordre,
      actif: ev.actif,
    });
    setFormMode(ev.id);
  }

  function closeForm() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
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
        titre: data.titre,
        categorie: data.categorie,
        date_debut: data.date_debut,
        date_fin: data.date_fin || null,
        lieu: data.lieu || null,
        description: data.description,
        photo_url,
        lien_cta: data.lien_cta || null,
        label_cta: data.label_cta || null,
        expire_le: data.expire_le || null,
        ordre: data.ordre,
        actif: data.actif,
      };

      if (formMode === "new") {
        const res = await fetch(evUrl("evenements"), {
          method: "POST",
          headers: { ...evHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const res = await fetch(evUrl(`evenements?id=eq.${formMode}`), {
          method: "PATCH",
          headers: { ...evHeaders(), Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      setFormMode(null);
      resetPhotoState();
      await loadEvents();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(ev: Evenement) {
    setError(null);
    try {
      const res = await fetch(evUrl(`evenements?id=eq.${ev.id}`), {
        method: "PATCH",
        headers: { ...evHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ actif: !ev.actif }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadEvents();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    setError(null);
    try {
      const res = await fetch(evUrl(`evenements?id=eq.${id}`), {
        method: "DELETE",
        headers: { ...evHeaders(), Prefer: "return=minimal" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (formMode === id) closeForm();
      await loadEvents();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-white">Événements</h1>
          <p className="text-white/40 text-sm mt-1">
            Gérez les événements affichés sur la page publique.
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

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          {error}
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
              {formMode === "new" ? "Nouvel événement" : "Modifier l'événement"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Titre */}
          <Field label="Titre" error={errors.titre?.message}>
            <Input
              {...register("titre")}
              placeholder="Recrutement ouvert — Saison 2026/2027"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Catégorie */}
            <Field label="Catégorie" error={errors.categorie?.message}>
              <Controller
                name="categorie"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white">
                      <SelectValue placeholder="Choisir…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Actif */}
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
                      {field.value ? "Publié (visible sur le site)" : "Masqué"}
                    </span>
                  </div>
                )}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Date de début" error={errors.date_debut?.message}>
              <Input
                type="date"
                {...register("date_debut")}
                className="bg-white/[0.04] border-white/[0.10] text-white"
              />
            </Field>

            <Field label="Date de fin" hint="Optionnel — si l'événement dure plusieurs jours">
              <Input
                type="date"
                {...register("date_fin")}
                className="bg-white/[0.04] border-white/[0.10] text-white"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Lieu" hint="Optionnel">
              <Input
                {...register("lieu")}
                placeholder="Gymnase Municipal, Boussy-Saint-Antoine"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            <Field label="Expire le" hint="Optionnel — masquer automatiquement après cette date">
              <Input
                type="date"
                {...register("expire_le")}
                className="bg-white/[0.04] border-white/[0.10] text-white"
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" error={errors.description?.message} hint="Séparer les paragraphes par une ligne vide">
            <Textarea
              {...register("description")}
              rows={6}
              placeholder="Texte de présentation de l'événement…"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 resize-y"
            />
          </Field>

          {/* Photo */}
          <Field label="Photo" hint={displayPhotoUrl ? undefined : "Optionnel — apparaît en haut de la carte publique"}>
            <PhotoUpload
              previewUrl={displayPhotoUrl}
              onSelect={handlePhotoSelect}
              onClear={handlePhotoClear}
              sizeWarning={photoSizeWarning}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Label du bouton" hint="Optionnel — ex : S'inscrire maintenant">
              <Input
                {...register("label_cta")}
                placeholder="S'inscrire maintenant"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            <Field label="Lien du bouton" hint="Optionnel — chemin interne ou URL externe">
              <Input
                {...register("lien_cta")}
                placeholder="/inscriptions ou https://…"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
          </div>

          <Field label="Ordre d'affichage" hint="Les plus petits apparaissent en premier">
            <Input
              type="number"
              {...register("ordre")}
              className="bg-white/[0.04] border-white/[0.10] text-white w-28"
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
                : formMode === "new" ? "Créer l'événement" : "Enregistrer"}
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
      {loading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-white/25 border border-white/[0.06] rounded-2xl">
          <CalendarRange size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun événement. Cliquez sur « Ajouter » pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const actionButtons = (
              <>
                <button
                  onClick={() => handleToggle(ev)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    ev.actif
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                      : "bg-white/[0.05] text-white/30 border-white/[0.10] hover:bg-white/10 hover:text-white/50"
                  }`}
                >
                  {ev.actif ? "Actif" : "Inactif"}
                </button>
                <button
                  onClick={() => (formMode === ev.id ? closeForm() : openEdit(ev))}
                  className={`p-1.5 rounded-lg transition-all ${
                    formMode === ev.id
                      ? "text-orange-400 bg-orange-500/10"
                      : "text-white/30 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  aria-label="Modifier"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </>
            );

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border transition-colors ${
                  ev.actif
                    ? "bg-white/[0.03] border-white/[0.08]"
                    : "bg-white/[0.01] border-white/[0.04] opacity-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Miniature photo */}
                  {ev.photo_url ? (
                    <img
                      src={ev.photo_url}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <ImageIcon size={16} className="text-white/20" />
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${CATEGORIE_COLORS[ev.categorie]}`}>
                      {CATEGORIE_OPTIONS.find((o) => o.value === ev.categorie)?.label ?? ev.categorie}
                    </span>
                    <p className="text-white text-sm font-semibold truncate mt-0.5">{ev.titre}</p>
                    <p className="text-white/35 text-xs mt-0.5 truncate">
                      {ev.date_debut}
                      {ev.date_fin && ` – ${ev.date_fin}`}
                      {ev.lieu && ` · ${ev.lieu}`}
                    </p>
                  </div>

                  {/* Actions — desktop uniquement */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {actionButtons}
                  </div>
                </div>

                {/* Actions — mobile uniquement */}
                <div className="flex sm:hidden items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
                  {actionButtons}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Les événements inactifs ou expirés ne s'affichent pas sur le site public.
      </p>
    </div>
  );
}

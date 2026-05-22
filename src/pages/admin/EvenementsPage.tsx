import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2, X, CalendarRange } from "lucide-react";
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EvenementsPage() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<null | "new" | string>(null);
  const [saving, setSaving] = useState(false);

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

  function openNew() {
    reset({ categorie: "evenement", actif: true, ordre: events.length, titre: "", date_debut: "", description: "", date_fin: null, lieu: null, lien_cta: null, label_cta: null, expire_le: null });
    setFormMode("new");
  }

  function openEdit(ev: Evenement) {
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
    setFormMode(null);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError(null);
    const payload = {
      titre: data.titre,
      categorie: data.categorie,
      date_debut: data.date_debut,
      date_fin: data.date_fin || null,
      lieu: data.lieu || null,
      description: data.description,
      lien_cta: data.lien_cta || null,
      label_cta: data.label_cta || null,
      expire_le: data.expire_le || null,
      ordre: data.ordre,
      actif: data.actif,
    };
    try {
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
      if (formMode === id) setFormMode(null);
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
            {/* Date début */}
            <Field label="Date de début" error={errors.date_debut?.message}>
              <Input
                type="date"
                {...register("date_debut")}
                className="bg-white/[0.04] border-white/[0.10] text-white"
              />
            </Field>

            {/* Date fin */}
            <Field label="Date de fin" hint="Optionnel — si l'événement dure plusieurs jours">
              <Input
                type="date"
                {...register("date_fin")}
                className="bg-white/[0.04] border-white/[0.10] text-white"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Lieu */}
            <Field label="Lieu" hint="Optionnel">
              <Input
                {...register("lieu")}
                placeholder="Gymnase Municipal, Boussy-Saint-Antoine"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            {/* Expire le */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Label CTA */}
            <Field label="Label du bouton" hint="Optionnel — ex : S'inscrire maintenant">
              <Input
                {...register("label_cta")}
                placeholder="S'inscrire maintenant"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>

            {/* Lien CTA */}
            <Field label="Lien du bouton" hint="Optionnel — chemin interne (/inscriptions) ou URL externe">
              <Input
                {...register("lien_cta")}
                placeholder="/inscriptions ou https://…"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              />
            </Field>
          </div>

          {/* Ordre */}
          <Field label="Ordre d'affichage" hint="Valeur numérique — les plus petits apparaissent en premier">
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
              {formMode === "new" ? "Créer l'événement" : "Enregistrer"}
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
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                ev.actif
                  ? "bg-white/[0.03] border-white/[0.08]"
                  : "bg-white/[0.01] border-white/[0.04] opacity-50"
              }`}
            >
              {/* Badge catégorie */}
              <span
                className={`shrink-0 mt-0.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${CATEGORIE_COLORS[ev.categorie]}`}
              >
                {CATEGORIE_OPTIONS.find((o) => o.value === ev.categorie)?.label ?? ev.categorie}
              </span>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{ev.titre}</p>
                <p className="text-white/35 text-xs mt-0.5">
                  {ev.date_debut}
                  {ev.date_fin && ` – ${ev.date_fin}`}
                  {ev.lieu && ` · ${ev.lieu}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Toggle actif */}
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

                {/* Éditer */}
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

                {/* Supprimer */}
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-white/20 text-xs mt-6">
        Les événements inactifs ou expirés ne s'affichent pas sur le site public.
      </p>
    </div>
  );
}

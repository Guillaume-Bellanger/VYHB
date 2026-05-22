import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMatch, useCreateMatch, useUpdateMatch } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Constants ────────────────────────────────────────────────────────────────

const SALLES_DOMICILE = [
  "Halle des sports",
  "Salle polyvalente Georges Pompidou",
] as const;

const CATEGORIES = [
  "Séniors Masculins",
  "Séniors Féminins",
  "-15/-18M",
  "-15/-18F",
  "-13F",
  "-13H",
  "-11 Mixte",
  "-9",
  "Baby / -7",
  "Loisir",
];

const TYPE_OPTIONS = [
  { value: "championnat", label: "Championnat" },
  { value: "coupe", label: "Coupe" },
  { value: "amical", label: "Amical" },
  { value: "tournoi", label: "Tournoi" },
] as const;

const STATUT_OPTIONS = [
  { value: "prevu", label: "Prévu" },
  { value: "joue", label: "Joué" },
  { value: "publie", label: "Publié" },
] as const;

// ── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  date: z.string().min(1, "Date requise"),
  adversaire: z.string().min(1, "Adversaire requis").max(100, "100 caractères max"),
  domicile: z.boolean(),
  categorie: z.string().min(1, "Catégorie requise"),
  type: z.enum(["championnat", "coupe", "amical", "tournoi"]),
  statut: z.enum(["prevu", "joue", "publie"]),
  score_nous: z.number().int().min(0).nullable(),
  score_eux: z.number().int().min(0).nullable(),
  resume: z.string().nullable(),
  lieu: z.string().nullable(),
});

type FormData = z.infer<typeof schema>;

// ── Helper ───────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-sm">{label}</Label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MatchFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { isAdmin, isResponsable, isRedacteur, categorie: userCategorie } = useAuth();

  const { data: existing, isLoading: loadingMatch } = useMatch(id);
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      domicile: true,
      statut: "prevu",
      type: "championnat",
      categorie: userCategorie ?? "",
      score_nous: null,
      score_eux: null,
      resume: null,
      lieu: null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      reset({
        date: toDatetimeLocal(existing.date),
        adversaire: existing.adversaire,
        domicile: existing.domicile,
        categorie: existing.categorie,
        type: existing.type,
        statut: existing.statut,
        score_nous: existing.score_nous,
        score_eux: existing.score_eux,
        resume: existing.resume ?? "",
        lieu: existing.lieu ?? "",
      });
    }
  }, [existing, reset]);

  const statut = watch("statut");
  const domicile = watch("domicile");
  const showScore = statut === "joue" || statut === "publie";
  const showResume = statut === "joue" || statut === "publie";

  // Permissions
  const fieldsDisabled = isRedacteur; // rédacteur : tout sauf resume
  const categorieLocked = isResponsable; // responsable : catégorie figée

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      lieu: data.lieu || null,
      resume: showResume ? (data.resume || null) : null,
      score_nous: showScore ? data.score_nous : null,
      score_eux: showScore ? data.score_eux : null,
    };

    try {
      if (isEditMode) {
        // Rédacteur ne soumet que le résumé
        const updatePayload = isRedacteur
          ? { resume: payload.resume }
          : payload;
        await updateMutation.mutateAsync({ id: id!, data: updatePayload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate("/admin/matches");
    } catch {
      // error displayed via mutationError
    }
  }

  if (isEditMode && loadingMatch) {
    return (
      <div className="flex items-center gap-2 text-white/40 py-12 justify-center">
        <Loader2 size={18} className="animate-spin" />
        <span>Chargement…</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/matches")}
          className="text-white/40 hover:text-white hover:bg-white/[0.06] gap-2 pl-2"
        >
          <ArrowLeft size={16} />
          Retour
        </Button>
        <h1 className="text-2xl font-display font-black text-white">
          {isEditMode ? "Modifier le match" : "Nouveau match"}
        </h1>
      </div>

      {isRedacteur && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm">
          Mode rédacteur — seul le champ Résumé est modifiable.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Date */}
        <Field label="Date et heure" error={errors.date?.message}>
          <Input
            type="datetime-local"
            disabled={fieldsDisabled}
            className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40"
            {...register("date")}
          />
        </Field>

        {/* Adversaire */}
        <Field label="Adversaire" error={errors.adversaire?.message}>
          <Input
            placeholder="Nom de l'équipe adverse"
            disabled={fieldsDisabled}
            className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 disabled:opacity-40"
            {...register("adversaire")}
          />
        </Field>

        {/* Domicile */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
          <div>
            <p className="text-white/70 text-sm font-medium">Domicile</p>
            <p className="text-white/35 text-xs">Décochez si match à l'extérieur</p>
          </div>
          <Controller
            control={control}
            name="domicile"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={fieldsDisabled}
                className="data-[state=checked]:bg-orange-500"
              />
            )}
          />
        </div>

        {/* Lieu */}
        {domicile ? (
          <Field label="Salle (optionnel)">
            <Controller
              control={control}
              name="lieu"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                  disabled={fieldsDisabled}
                >
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                    <SelectValue placeholder="Sélectionner une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALLES_DOMICILE.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        ) : (
          <Field label="Adresse du match (optionnel)">
            <Input
              placeholder="Adresse ou nom de la salle adverse"
              disabled={fieldsDisabled}
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 disabled:opacity-40"
              {...register("lieu")}
            />
          </Field>
        )}

        {/* Catégorie */}
        <Field label="Catégorie" error={errors.categorie?.message}>
          <Controller
            control={control}
            name="categorie"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={fieldsDisabled || categorieLocked}
              >
                <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {categorieLocked && (
            <p className="text-white/30 text-xs">Catégorie fixée par votre rôle.</p>
          )}
        </Field>

        {/* Type */}
        <Field label="Type de rencontre" error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={fieldsDisabled}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* Statut */}
        <Field label="Statut" error={errors.statut?.message}>
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={fieldsDisabled}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUT_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* Score — visible si joué ou publié */}
        {showScore && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Score (nous)" error={errors.score_nous?.message}>
              <Input
                type="number"
                min={0}
                disabled={fieldsDisabled}
                placeholder="0"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 disabled:opacity-40"
                {...register("score_nous", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
              />
            </Field>
            <Field label="Score (eux)" error={errors.score_eux?.message}>
              <Input
                type="number"
                min={0}
                disabled={fieldsDisabled}
                placeholder="0"
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 disabled:opacity-40"
                {...register("score_eux", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
              />
            </Field>
          </div>
        )}

        {/* Résumé — visible uniquement si joué ou publié */}
        {showResume && (
          <Field label="Résumé du match" error={errors.resume?.message}>
            <Textarea
              placeholder="Compte-rendu du match, points forts, résultat commenté…"
              rows={5}
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 resize-none"
              {...register("resume")}
            />
          </Field>
        )}

        {/* Erreur serveur */}
        {mutationError && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {(mutationError as Error).message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Enregistrement…" : isEditMode ? "Enregistrer" : "Créer le match"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/matches")}
            className="text-white/40 hover:text-white hover:bg-white/[0.06]"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}

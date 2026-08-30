import { useState } from "react";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { useSiteContentAdmin, useUpdateSiteContent } from "@/hooks/useSiteContent";
import type { SiteContentRow } from "@/types/siteContent";

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</Label>
      {children}
      {hint && <p className="text-white/30 text-xs">{hint}</p>}
    </div>
  );
}

// ── Éditeur de liste (type "liste") ────────────────────────────────────────────
// Générique : les colonnes affichées sont déduites des clés du premier élément
// (ex. { annee, titre, texte } pour l'historique, { titre, texte } pour les valeurs).

type ListeItem = Record<string, string>;

function ListEditor({ items, onChange }: { items: ListeItem[]; onChange: (items: ListeItem[]) => void }) {
  const columns = items.length > 0 ? Object.keys(items[0]) : ["titre", "texte"];

  function updateItem(i: number, key: string, val: string) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }
  function addItem() {
    onChange([...items, Object.fromEntries(columns.map((c) => [c, ""]))]);
  }
  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function move(i: number, direction: -1 | 1) {
    const target = i + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-white/[0.08] rounded-xl p-3 space-y-2 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-xs font-medium">Entrée {i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:pointer-events-none"
                aria-label="Monter"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-1 rounded text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-20 disabled:pointer-events-none"
                aria-label="Descendre"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10"
                aria-label="Supprimer cette entrée"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {columns.map((col) =>
            col === "texte" ? (
              <Textarea
                key={col}
                rows={3}
                value={item[col] ?? ""}
                onChange={(e) => updateItem(i, col, e.target.value)}
                placeholder={col}
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 text-sm resize-y"
              />
            ) : (
              <Input
                key={col}
                value={item[col] ?? ""}
                onChange={(e) => updateItem(i, col, e.target.value)}
                placeholder={col}
                className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 text-sm h-9"
              />
            )
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors flex items-center gap-1.5"
      >
        <Plus size={14} />
        Ajouter une entrée
      </button>
    </div>
  );
}

// ── Champ selon le type de contenu ─────────────────────────────────────────────

function FieldEditor({
  row,
  value,
  onChange,
}: {
  row: SiteContentRow;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (row.type === "texte") {
    return (
      <Field label={row.libelle}>
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/[0.04] border-white/[0.10] text-white"
        />
      </Field>
    );
  }

  if (row.type === "texte_long") {
    return (
      <Field label={row.libelle} hint="Sauts de ligne conservés à l'affichage">
        <Textarea
          rows={5}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/[0.04] border-white/[0.10] text-white resize-y"
        />
      </Field>
    );
  }

  return (
    <Field label={row.libelle}>
      <ListEditor items={(value as ListeItem[]) ?? []} onChange={onChange} />
    </Field>
  );
}

// ── Section (une par "groupe"), avec son propre bouton Enregistrer ────────────

function ContentGroup({ groupe, rows }: { groupe: string; rows: SiteContentRow[] }) {
  const updateContent = useUpdateSiteContent();
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(rows.map((r) => [r.cle, r.valeur]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const changed = rows.filter(
        (r) => JSON.stringify(values[r.cle]) !== JSON.stringify(r.valeur)
      );
      await Promise.all(
        changed.map((r) => updateContent.mutateAsync({ cle: r.cle, valeur: values[r.cle] }))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AccordionItem value={groupe} className="border-white/[0.08]">
      <AccordionTrigger className="text-white font-display font-bold hover:no-underline hover:text-orange-400">
        {groupe}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6 pt-2">
          {rows.map((r) => (
            <FieldEditor
              key={r.cle}
              row={r}
              value={values[r.cle]}
              onChange={(v) => setValues((s) => ({ ...s, [r.cle]: v }))}
            />
          ))}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {saved && (
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <Check size={13} /> Enregistré
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContenuPage() {
  const { data: rows = [], isLoading, error: loadError } = useSiteContentAdmin();

  const groupes = Array.from(new Set(rows.map((r) => r.groupe)));

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-black text-white">Textes du site</h1>
        <p className="text-white/40 text-sm mt-1">
          Modifiez les textes libres affichés sur le site (historique, valeurs, coordonnées…) sans toucher au code.
        </p>
      </div>

      {loadError && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          {(loadError as Error).message}
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 py-10 justify-center">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={groupes} className="space-y-2">
          {groupes.map((groupe) => (
            <ContentGroup key={groupe} groupe={groupe} rows={rows.filter((r) => r.groupe === groupe)} />
          ))}
        </Accordion>
      )}
    </div>
  );
}

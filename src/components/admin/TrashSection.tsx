import { Loader2, Trash2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";

export interface TrashItem {
  id: string;
  label: string;
  supprime_le: string;
  supprime_par_profile?: { full_name: string | null } | null;
}

interface TrashSectionProps {
  items: TrashItem[];
  isLoading: boolean;
  canHardDelete: boolean;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}

// Section repliable réutilisée par les pages admin encadrement/collectifs/
// evenements/tarifs — liste les fiches supprimées (soft delete), avec
// restauration pour tous les admins et suppression définitive réservée à
// super_admin (canHardDelete), avec confirmation.
export default function TrashSection({
  items,
  isLoading,
  canHardDelete,
  onRestore,
  onHardDelete,
}: TrashSectionProps) {
  return (
    <Accordion type="single" collapsible className="mt-10">
      <AccordionItem value="corbeille" className="border-white/[0.08]">
        <AccordionTrigger className="text-white/50 font-display font-bold hover:no-underline hover:text-white/80 text-sm">
          <span className="flex items-center gap-2">
            <Trash2 size={14} />
            Corbeille{items.length > 0 ? ` (${items.length})` : ""}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/30 py-6 justify-center text-sm">
              <Loader2 size={14} className="animate-spin" />
              Chargement…
            </div>
          ) : items.length === 0 ? (
            <p className="text-white/25 text-sm py-4 text-center">Corbeille vide.</p>
          ) : (
            <div className="space-y-2 pt-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="min-w-0">
                    <p className="text-white/70 text-sm truncate">{item.label}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      Supprimé le {format(new Date(item.supprime_le), "d MMM yyyy à HH:mm", { locale: fr })}
                      {item.supprime_par_profile?.full_name ? ` par ${item.supprime_par_profile.full_name}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestore(item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Restaurer
                    </button>
                    {canHardDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer définitivement « ${item.label} » ? Cette action est irréversible.`)) {
                            onHardDelete(item.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-400/70 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={12} />
                        Supprimer définitivement
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

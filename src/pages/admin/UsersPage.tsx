import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Pencil, Power, Loader2, ShieldAlert, Clock, FileText } from "lucide-react";
import { useUsers, useUpdateUser, useInviteUser, type InvitePayload } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import type { Profile, UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Audit log types & helpers ─────────────────────────────────

interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

function auditHeaders(): Record<string, string> {
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
  return { apikey: key, Authorization: `Bearer ${token}` };
}

function auditUrl(path: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL as string}/rest/v1/${path}`;
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `il y a ${Math.max(1, mins)} min`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `il y a ${hours}h`;
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

const ENTITY_BADGE: Record<string, string> = {
  match:     "bg-orange-500/15 text-orange-400 border-orange-500/25",
  evenement: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  poste:     "bg-blue-500/15 text-blue-400 border-blue-500/25",
  user:      "bg-violet-500/15 text-violet-400 border-violet-500/25",
};

function DetailContent({ details }: { details: Record<string, unknown> }) {
  const avant = details.avant as Record<string, unknown> | null | undefined;
  const apres = details.apres as Record<string, unknown> | null | undefined;

  if (avant && apres && typeof avant === "object" && typeof apres === "object") {
    const allKeys = Array.from(new Set([...Object.keys(avant), ...Object.keys(apres)]));
    const changed = new Set(allKeys.filter((k) => JSON.stringify(avant[k]) !== JSON.stringify(apres[k])));

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-2">Avant</p>
          <div className="space-y-1">
            {allKeys.map((k) => (
              <div key={k} className={`px-2 py-1 rounded text-xs ${changed.has(k) ? "bg-red-500/15 text-red-300" : "text-white/40"}`}>
                <span className="font-medium">{k}: </span>
                <span>{avant[k] == null ? "—" : String(avant[k])}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-2">Après</p>
          <div className="space-y-1">
            {allKeys.map((k) => (
              <div key={k} className={`px-2 py-1 rounded text-xs ${changed.has(k) ? "bg-emerald-500/15 text-emerald-300" : "text-white/40"}`}>
                <span className="font-medium">{k}: </span>
                <span>{apres[k] == null ? "—" : String(apres[k])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {Object.entries(details).map(([k, v]) => (
        <div key={k} className="flex gap-2 text-xs">
          <span className="text-white/40 shrink-0 font-medium">{k}:</span>
          <span className="text-white/70 break-all">
            {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v ?? "—")}
          </span>
        </div>
      ))}
    </div>
  );
}

function AuditLogSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        auditUrl("audit_logs?order=created_at.desc&limit=50&select=*"),
        { headers: auditHeaders() }
      );
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mt-10 pt-8 border-t border-white/[0.08]">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-white/40" />
        <h2 className="text-lg font-display font-black text-white">Journal d'activité</h2>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-white/40 py-6">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      )}

      {!loading && logs.length === 0 && (
        <p className="text-white/30 text-sm py-6 text-center">Aucune activité enregistrée.</p>
      )}

      {!loading && logs.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2.5 text-white/40 font-medium text-xs">Date</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-medium text-xs">Utilisateur</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-medium text-xs">Action</th>
                  <th className="text-left px-4 py-2.5 text-white/40 font-medium text-xs">Entité</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-white/40 text-xs whitespace-nowrap">
                      {formatRelativeDate(log.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-white/70 text-xs whitespace-nowrap">
                      {log.user_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-white text-xs font-medium">
                      {log.action}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex self-start text-[10px] font-bold px-2 py-0.5 rounded-full border ${ENTITY_BADGE[log.entity_type] ?? "bg-white/[0.06] text-white/40 border-white/[0.10]"}`}>
                          {log.entity_type}
                        </span>
                        {log.entity_label && (
                          <span className="text-white/40 text-xs truncate max-w-[160px]">{log.entity_label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {log.details && (
                        <button
                          onClick={() => setSelected(log)}
                          className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white hover:bg-white/[0.06] px-2 py-1 rounded-lg transition-colors"
                        >
                          <FileText size={11} />
                          Détail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Dialog open onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="bg-[#111118] border-white/[0.08] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white text-base">
                {selected.action}
                {selected.entity_label && <span className="text-white/40 font-normal"> — {selected.entity_label}</span>}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              <DetailContent details={selected.details!} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────

const CATEGORIES = [
  "Baby", "-7", "-9/-11", "-11F", "-13M",
  "-15M", "-15F", "Séniors Masculins", "Séniors Féminines", "Loisirs",
];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  president: "Président",
  entraineur: "Entraîneur",
  evenements_com: "Événements & Com",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  president: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  entraineur: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  evenements_com: "bg-white/[0.06] text-white/50 border-white/[0.10]",
};

// ── Schemas ──────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["president", "entraineur", "evenements_com"] as const),
  categorie: z.string().nullable(),
});

const editSchema = z.object({
  role: z.enum(["super_admin", "president", "entraineur", "evenements_com"] as const),
  categorie: z.string().nullable(),
});

type InviteForm = z.infer<typeof inviteSchema>;
type EditForm = z.infer<typeof editSchema>;

// ── Sub-components ───────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function CategorieSelect({ control, name, disabled }: {
  control: ReturnType<typeof useForm<InviteForm | EditForm>>["control"];
  name: "categorie";
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control as ReturnType<typeof useForm<InviteForm>>["control"]}
      name={name}
      render={({ field }) => (
        <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)} disabled={disabled}>
          <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
            <SelectValue placeholder="Aucune (super_admin / rédacteur)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    />
  );
}

// ── Invite Dialog ────────────────────────────────────────────

function InviteDialog({ open, onClose, canEditRole }: { open: boolean; onClose: () => void; canEditRole: boolean }) {
  const invite = useInviteUser();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "entraineur", categorie: null },
  });
  const role = watch("role");

  async function onSubmit(data: InvitePayload) {
    try {
      await invite.mutateAsync(data);
      onClose();
    } catch { /* displayed below */ }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111118] border-white/[0.08] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Inviter un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">Email</Label>
            <Input
              type="email"
              placeholder="prenom@club.fr"
              className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
              {...register("email")}
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">Rôle</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canEditRole}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["president", "entraineur", "evenements_com"] as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role === "entraineur" && (
            <div className="space-y-1.5">
              <Label className="text-white/70">Catégorie</Label>
              <CategorieSelect control={control as never} name="categorie" />
            </div>
          )}

          {invite.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {(invite.error as Error).message}
            </p>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-300 text-xs">
            Un email avec un lien de connexion sera envoyé à l'adresse indiquée.
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/40 hover:text-white">
              Annuler
            </Button>
            <Button type="submit" disabled={invite.isPending} className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2">
              {invite.isPending && <Loader2 size={14} className="animate-spin" />}
              {invite.isPending ? "Envoi…" : "Envoyer l'invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────

function EditDialog({ user, onClose, canEditRole }: { user: Profile; onClose: () => void; canEditRole: boolean }) {
  const update = useUpdateUser();
  const { handleSubmit, control, watch, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { role: user.role, categorie: user.categorie },
  });
  const role = watch("role");

  async function onSubmit(data: EditForm) {
    try {
      await update.mutateAsync({ id: user.id, data });
      onClose();
    } catch { /* displayed below */ }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111118] border-white/[0.08] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Modifier {user.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">Rôle</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!canEditRole}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white disabled:opacity-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["super_admin", "president", "entraineur", "evenements_com"] as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role === "entraineur" && (
            <div className="space-y-1.5">
              <Label className="text-white/70">Catégorie</Label>
              <CategorieSelect control={control as never} name="categorie" />
            </div>
          )}

          {errors.role && <p className="text-red-400 text-xs">{errors.role.message}</p>}

          {update.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {(update.error as Error).message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/40 hover:text-white">
              Annuler
            </Button>
            <Button type="submit" disabled={update.isPending} className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2">
              {update.isPending && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const updateUser = useUpdateUser();
  const { can, isAdmin } = useAuth();
  const canEditRole = can("edit_user_role");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);

  function handleToggleDisable(user: Profile) {
    updateUser.mutate({ id: user.id, data: { disabled: !user.disabled } });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-white">Utilisateurs</h1>
          <p className="text-white/40 text-sm mt-0.5">Gestion des accès à l'espace admin</p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold gap-2"
        >
          <UserPlus size={16} />
          Inviter un utilisateur
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-white/40 py-12 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span>Chargement…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          <ShieldAlert size={16} className="shrink-0" />
          {(error as Error).message}
        </div>
      )}

      {/* Cartes mobile */}
      {!isLoading && users && users.length > 0 && (
        <div className="md:hidden space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3 ${user.disabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">{user.full_name}</p>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{user.email ?? "—"}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-white/40 space-y-0.5">
                  <p>{user.categorie ?? "—"}</p>
                  {user.disabled ? (
                    <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                      Désactivé
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      Actif
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditTarget(user)}
                    className="text-white/50 hover:text-white hover:bg-white/[0.06] h-8 w-8 p-0"
                    title="Modifier le rôle"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={updateUser.isPending}
                    onClick={() => handleToggleDisable(user)}
                    className={`h-8 w-8 p-0 ${user.disabled ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/30 hover:text-red-400 hover:bg-red-500/10"}`}
                    title={user.disabled ? "Réactiver" : "Désactiver"}
                  >
                    <Power size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tableau desktop */}
      {!isLoading && users && users.length > 0 && (
        <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40">Nom</TableHead>
                <TableHead className="text-white/40">Email</TableHead>
                <TableHead className="text-white/40">Rôle</TableHead>
                <TableHead className="text-white/40">Catégorie</TableHead>
                <TableHead className="text-white/40">Statut</TableHead>
                <TableHead className="text-white/40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`border-white/[0.04] hover:bg-white/[0.02] ${user.disabled ? "opacity-50" : ""}`}
                >
                  <TableCell className="text-white font-medium">{user.full_name}</TableCell>
                  <TableCell className="text-white/50 text-sm">{user.email ?? "—"}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell className="text-white/50 text-sm">{user.categorie ?? "—"}</TableCell>
                  <TableCell>
                    {user.disabled ? (
                      <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                        Désactivé
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Actif
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditTarget(user)}
                        className="text-white/50 hover:text-white hover:bg-white/[0.06] h-8 w-8 p-0"
                        title="Modifier le rôle"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateUser.isPending}
                        onClick={() => handleToggleDisable(user)}
                        className={`h-8 w-8 p-0 ${user.disabled ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/30 hover:text-red-400 hover:bg-red-500/10"}`}
                        title={user.disabled ? "Réactiver" : "Désactiver"}
                      >
                        <Power size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <p className="text-white/30 text-sm py-12 text-center">Aucun utilisateur trouvé.</p>
      )}

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} canEditRole={canEditRole} />
      {editTarget && <EditDialog user={editTarget} onClose={() => setEditTarget(null)} canEditRole={canEditRole} />}

      {isAdmin && <AuditLogSection />}
    </div>
  );
}

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Pencil, Power, Loader2, ShieldAlert } from "lucide-react";
import { useUsers, useUpdateUser, useInviteUser, type InvitePayload } from "@/hooks/useUsers";
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

// ── Constants ────────────────────────────────────────────────

const CATEGORIES = [
  "Séniors Masculins", "Séniors Féminins", "-15/-18M", "-15/-18F",
  "-13F", "-13H", "-11 Mixte", "-9", "Baby / -7", "Loisir",
];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  responsable: "Responsable",
  redacteur: "Rédacteur",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  responsable: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  redacteur: "bg-white/[0.06] text-white/50 border-white/[0.10]",
};

// ── Schemas ──────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["super_admin", "responsable", "redacteur"] as const),
  categorie: z.string().nullable(),
});

const editSchema = z.object({
  role: z.enum(["super_admin", "responsable", "redacteur"] as const),
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

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invite = useInviteUser();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "redacteur", categorie: null },
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["super_admin", "responsable", "redacteur"] as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role === "responsable" && (
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

function EditDialog({ user, onClose }: { user: Profile; onClose: () => void }) {
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.10] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["super_admin", "responsable", "redacteur"] as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role === "responsable" && (
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

      {!isLoading && users && users.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
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

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      {editTarget && <EditDialog user={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}

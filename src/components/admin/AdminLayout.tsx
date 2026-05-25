import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Megaphone,
  CalendarRange,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: Array<"super_admin" | "president" | "entraineur" | "evenements_com">;
}

const navItems: NavItem[] = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/matches", label: "Matchs", icon: CalendarDays },
  { to: "/admin/users", label: "Utilisateurs", icon: Users, roles: ["super_admin"] },
  { to: "/admin/ticker", label: "Bandeau com", icon: Megaphone, roles: ["super_admin", "president", "evenements_com"] },
  { to: "/admin/evenements", label: "Événements", icon: CalendarRange, roles: ["super_admin", "president", "evenements_com"] },
];

function NavItems({ onClose }: { onClose?: () => void }) {
  const { hasRole } = useAuth();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ to, label, icon: Icon, roles }) => {
        if (roles && !hasRole(...roles)) return null;
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05]"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin",
    president: "Président",
    entraineur: "Entraîneur",
    evenements_com: "Événements & Com",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <p className="font-display font-black text-white text-sm leading-tight">
          Val d'Yerres <span className="text-orange-500">Handball</span>
        </p>
        <p className="text-white/30 text-xs mt-0.5">Administration</p>
      </div>

      <NavItems onClose={onClose} />

      {/* Footer user */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <span className="text-orange-400 font-bold text-xs">
              {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name ?? "—"}</p>
            <p className="text-white/35 text-[11px]">
              {profile?.role ? roleLabel[profile.role] : ""}
              {profile?.categorie ? ` · ${profile.categorie}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={15} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/[0.06] bg-white/[0.02]">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#0f0f17] border-r border-white/[0.06] transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            <Menu size={20} />
          </button>
          <p className="font-display font-black text-white text-sm">
            Val d'Yerres <span className="text-orange-500">Handball</span>
          </p>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

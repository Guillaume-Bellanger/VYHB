import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/database";

export function useAuth() {
  const { user, profile, isLoading, signIn, signOut } = useAuthStore();

  const role = profile?.role ?? null;
  const categorie = profile?.categorie ?? null;

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  const isAdmin = hasRole("super_admin");
  const isResponsable = hasRole("responsable");
  const isRedacteur = hasRole("redacteur");

  return {
    user,
    profile,
    role,
    categorie,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isResponsable,
    isRedacteur,
    hasRole,
    signIn,
    signOut,
  };
}

import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/database";
import { can as permCan } from "@/lib/permissions";

export function useAuth() {
  const { user, profile, isLoading, signIn, signOut } = useAuthStore();

  const role = profile?.role ?? null;
  const categorie = profile?.categorie ?? null;

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  const can = (action: string, context?: { userCategorie?: string; matchCategorie?: string }): boolean => {
    if (!role) return false;
    return permCan(role, action, context);
  };

  const isAdmin = hasRole("super_admin");
  const isPresident = hasRole("president");
  const isEntraineur = hasRole("entraineur");
  const isEvenementsCom = hasRole("evenements_com");

  return {
    user,
    profile,
    role,
    categorie,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isPresident,
    isEntraineur,
    isEvenementsCom,
    hasRole,
    can,
    signIn,
    signOut,
  };
}

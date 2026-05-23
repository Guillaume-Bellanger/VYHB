import type { UserRole } from "@/types/database";

export const can = (
  role: UserRole,
  action: string,
  _context?: { userCategorie?: string; matchCategorie?: string }
): boolean => {
  switch (action) {
    case "manage_roles":
      return role === "super_admin";
    case "view_users":
      return ["super_admin", "president"].includes(role);
    case "invite_users":
      return ["super_admin", "president"].includes(role);
    case "edit_user_role":
      return role === "super_admin";
    case "manage_all_matches":
      return ["super_admin", "president"].includes(role);
    case "manage_own_matches":
      return ["super_admin", "president", "entraineur"].includes(role);
    case "publish_match":
      return ["super_admin", "president", "evenements_com"].includes(role);
    case "edit_resume":
      return ["super_admin", "president", "entraineur", "evenements_com"].includes(role);
    case "manage_benevoles":
      return true;
    case "manage_evenements":
      return ["super_admin", "president", "evenements_com"].includes(role);
    case "manage_ticker":
      return ["super_admin", "president", "evenements_com"].includes(role);
    case "view_dashboard":
      return true;
    default:
      return false;
  }
};

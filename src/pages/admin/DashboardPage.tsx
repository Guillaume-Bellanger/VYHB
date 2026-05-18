import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-display font-black text-white mb-1">Tableau de bord</h1>
      <p className="text-white/40 text-sm mb-8">
        Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
      </p>
      <p className="text-white/30 text-sm">
        Utilisez la navigation pour gérer les matchs et les utilisateurs.
      </p>
    </div>
  );
}

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Club from "./pages/Club";
import Collectifs from "./pages/Collectifs";
import CollectifDetail from "./pages/CollectifDetail";
import Registration from "./pages/Registration";
import Partners from "./pages/Partners";
import Shop from "./pages/Shop";
import ProduitDetail from "./pages/ProduitDetail";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Resultats from "./pages/Resultats";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
// Admin
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import LoginPage from "./pages/admin/LoginPage";
import AuthCallbackPage from "./pages/admin/AuthCallbackPage";
import DashboardPage from "./pages/admin/DashboardPage";
import MatchListAdminPage from "./pages/admin/MatchListAdminPage";
import MatchFormPage from "./pages/admin/MatchFormPage";
import UsersPage from "./pages/admin/UsersPage";
import { useAuthStore } from "./stores/authStore";

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s._init);
  useEffect(() => init(), [init]);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* ── Routes publiques ── */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/club" element={<Club />} />
              <Route path="/collectifs" element={<Collectifs />} />
              <Route path="/collectifs/:slug" element={<CollectifDetail />} />
              <Route path="/inscriptions" element={<Registration />} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/boutique/:id" element={<ProduitDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/evenements" element={<Events />} />
              <Route path="/matchs" element={<Navigate to="/resultats" replace />} />
              <Route path="/resultats" element={<Resultats />} />
              <Route path="/mentions-legales" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ── Routes admin ── */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            <Route element={<AdminLayout />}>
              {/* Tous les rôles connectés */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/matches" element={<MatchListAdminPage />} />
              </Route>

              {/* super_admin + responsable uniquement */}
              <Route element={<ProtectedRoute allowedRoles={["super_admin", "responsable"]} />}>
                <Route path="/admin/matches/new" element={<MatchFormPage />} />
                <Route path="/admin/matches/:id/edit" element={<MatchFormPage />} />
              </Route>

              {/* super_admin uniquement */}
              <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
                <Route path="/admin/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

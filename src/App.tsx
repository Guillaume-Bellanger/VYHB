import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Matches from "./pages/Matches";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/club" element={<Club />} />
            <Route path="/collectifs" element={<Collectifs />} />
            <Route path="/collectifs/:slug" element={<CollectifDetail />} />
            <Route path="/inscriptions" element={<Registration />} />
            <Route path="/partenaires" element={<Partners />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/evenements" element={<Events />} />
            <Route path="/matchs" element={<Matches />} />
            <Route path="/mentions-legales" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

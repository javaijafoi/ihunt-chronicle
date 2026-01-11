import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { VTTPage } from "./pages/VTTPage";
import { LobbyPage } from "./pages/LobbyPage";
import { CreateCampaignPage } from "./pages/CreateCampaignPage";
import NotFound from "./pages/NotFound";
import { ProfilePage } from "./pages/ProfilePage";
import { AboutPage } from "./pages/AboutPage";
import { CodexPage } from "./pages/CodexPage";

const queryClient = new QueryClient();

import { useParams } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MonsterCreatorPage } from "./pages/MonsterCreatorPage";
import { CampaignProvider } from "@/contexts/CampaignContext";

const CampaignRoute = () => {
  const { campaignId } = useParams();
  return (
    <CampaignProvider campaignId={campaignId}>
      <VTTPage />
    </CampaignProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/monsters" element={<MonsterCreatorPage />} />
          <Route path="/campaigns/new" element={<CreateCampaignPage />} />
          <Route path="/campaign/:campaignId" element={<CampaignRoute />} />
          {/* Legacy VTT currently broken/unsupported without campaignId. Redirect or specific handler? */}
          {/* <Route path="/vtt" element={<VTTPage />} /> */}
          <Route path="/old" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/codex" element={<CodexPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

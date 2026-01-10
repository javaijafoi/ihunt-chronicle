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

const queryClient = new QueryClient();

import { useParams } from "react-router-dom";
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
          <Route path="/" element={<LobbyPage />} />
          <Route path="/campaigns/new" element={<CreateCampaignPage />} />
          <Route path="/campaign/:campaignId" element={<CampaignRoute />} />
          {/* Legacy VTT currently broken/unsupported without campaignId. Redirect or specific handler? */}
          {/* <Route path="/vtt" element={<VTTPage />} /> */}
          <Route path="/old" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

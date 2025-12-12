import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";
import { useEffect } from "react";
import { useSuiClientContext } from "@mysten/dapp-kit";
import LandingPage from "./pages/LandingPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import PulsePage from "./pages/PulsePage";
import NotFound from "./pages/NotFound";
import SpaceNetworkBackground from "./components/ThreeBg";
import SwapSuccessPage from "./pages/swap/success/page";
import SwapFailedPage from "./pages/swap/fail/page";
import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();

// Configure Sui networks
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

// Component to register Enoki wallets
function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;

    const ENOKI_PUBLIC_KEY = import.meta.env.VITE_ENOKI_PUBLIC_KEY;
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!ENOKI_PUBLIC_KEY || !GOOGLE_CLIENT_ID) {
      console.error("Missing Enoki configuration");
      return;
    }

    registerEnokiWallets({
      client,
      network,
      apiKey: ENOKI_PUBLIC_KEY,
      providers: {
        google: {
          clientId: GOOGLE_CLIENT_ID,
        },
      },
    });

    console.log("✅ Enoki wallets registered for network:", network);
  }, [client, network]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <RegisterEnokiWallets />
      <WalletProvider autoConnect>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SpaceNetworkBackground />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:id" element={<PlayerDetailPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/pulse" element={<PulsePage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/swap/success" element={<SwapSuccessPage />} />
              <Route path="/swap/fail" element={<SwapFailedPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
